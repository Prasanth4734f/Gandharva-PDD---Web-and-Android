# Check for ZeroGPU - MUST be imported before torch / transformers / cuda libraries
try:
    import spaces
    has_spaces = True
except ImportError:
    has_spaces = False
    class spaces:
        @staticmethod
        def GPU(func=None, duration=None):
            if func is None:
                return lambda f: f
            return func

import os
import sys
import re
import json
import torch
import huggingface_hub
import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# Monkey-patch HfFolder for compatibility
if not hasattr(huggingface_hub, "HfFolder"):
    class HfFolder:
        @classmethod
        def get_token(cls): return None
        @classmethod
        def save_token(cls, token): pass
    huggingface_hub.HfFolder = HfFolder

BASE_MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
ADAPTER_DIR = os.environ.get("ADAPTER_REPO_OR_PATH", "Prasanthm4734f/gandharva-omni-weights")

# Fallback paths
if not os.path.exists(ADAPTER_DIR):
    candidates = [
        "gandharva_omni_weights",
        "../gandharva_omni_weights",
        "./",
        "server/gandharva_omni_weights",
        "gandharva_lyrics_v1",
        "server/lyrics_backend/gandharva_lyrics_v1"
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.exists(os.path.join(c, "adapter_config.json")):
            ADAPTER_DIR = c
            break

print(f"🚀 Initializing Gandharva-Omni Tokenizer...")
try:
    tokenizer = AutoTokenizer.from_pretrained(ADAPTER_DIR, trust_remote_code=True)
except Exception:
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID, trust_remote_code=True)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

_model_cache = None

def get_model():
    global _model_cache
    if _model_cache is not None:
        return _model_cache

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"📥 Loading Base Model ({BASE_MODEL_ID}) on {device}...")
    
    try:
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_ID,
            device_map="auto" if torch.cuda.is_available() else None,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            low_cpu_mem_usage=True,
            trust_remote_code=True
        )
    except Exception as e:
        print(f"⚠️ Falling back to 1.5B standard instruct: {e}")
        base_model = AutoModelForCausalLM.from_pretrained(
            "Qwen/Qwen2.5-1.5B-Instruct",
            device_map="auto" if torch.cuda.is_available() else None,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            low_cpu_mem_usage=True,
            trust_remote_code=True
        )

    if os.path.exists(ADAPTER_DIR) and os.path.exists(os.path.join(ADAPTER_DIR, "adapter_config.json")):
        print(f"✨ Attaching Gandharva-Omni LoRA Adapter from '{ADAPTER_DIR}'...")
        try:
            _model_cache = PeftModel.from_pretrained(base_model, ADAPTER_DIR)
        except Exception as peft_err:
            print(f"⚠️ Peft load note: {peft_err}. Using base model.")
            _model_cache = base_model
    else:
        _model_cache = base_model

    _model_cache.eval()
    return _model_cache

LANGUAGE_INSTRUCTIONS = {
    "Telugu": "Write strictly in authentic Telugu script (తెలుగు లిపి). Use Telugu section headers [పల్లవి], [చరణం 1], [చరణం 2], [ముగింపు] with chords. DO NOT write English lyrics.",
    "Hindi": "Write strictly in authentic Hindi Devanagari script (हिन्दी). Use section headers [मुखड़ा], [अंतरा 1], [अंतरा 2], [समाप्ति] with chords. DO NOT write English lyrics.",
    "Tamil": "Write strictly in authentic Tamil script (தமிழ்). Use section headers [பல்லவி], [சரணம் 1], [சரணம் 2], [முடிவு] with chords. DO NOT write English lyrics.",
    "Kannada": "Write strictly in authentic Kannada script (ಕನ್ನಡ). Use section headers [ಪಲ್ಲವಿ], [ಚರಣ 1], [ಚರಣ 2] with chords. DO NOT write English lyrics.",
    "Malayalam": "Write strictly in authentic Malayalam script (മലയാളം). Use section headers [പല്ലവി], [ചരണം 1], [ചരണം 2] with chords. DO NOT write English lyrics.",
    "English": "Write full song structure in English with [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] and chords."
}

SYSTEM_PROMPT = """<|im_start|>system
You are Gandharva-Omni AI Engine, an expert music studio intelligence system.
CORE ORIGINALITY RULE: You strictly generate 100% ORIGINAL music compositions, chord charts, and lyrics.
When composer styles are mentioned, extract strictly their acoustic DNA and NEVER reproduce past copyrighted song motifs.
You operate in 5 specialized modes based on the task tag:
- [MODE: PROMPT_DIRECTOR]: Expand raw music prompt into a 150-word audio engineering prompt with BPM, Key signature, and acoustic textures for MusicGen.
- [MODE: LYRICS_STUDIO]: Write a full structured song in the requested native language script (Telugu, Hindi, Tamil, English, Kannada, Malayalam) with chords.
- [MODE: STORY_BLUEPRINT]: Analyze story text and output 100% valid JSON matching the AlbumBlueprint schema with scene tracks, emotions, and BPM.
- [MODE: MUSIC_DIRECTOR]: Output JSON with recommended BPM, Root Key, Time Signature, and Arrangement Stems.
- [MODE: VOCAL_COACH]: Provide actionable vocal tips, pitch guidance, and singing expression notes.<|im_end|>"""

def clean_model_output(text: str) -> str:
    """Sanitize output by removing any accidental prompt tokens, system tags, or hallucinated prefixes."""
    cleaned = text.strip()
    
    # Remove leading assistant tag if present
    cleaned = re.sub(r'^(?:assistant|Assistant)\s*:\s*', '', cleaned)
    cleaned = re.sub(r'^(?:<\|im_start\|>assistant|<\|im_end\|>|\nassistant\n)', '', cleaned).strip()
    
    # Strip hallucinated mode artifacts like Nie_BLUE, NIE_BLUEPRINT, etc.
    cleaned = re.sub(r'(?i)^(?:Nie_BLUE[^\n]*,?\s*|\bNIE_BLUEPRINT\b\s*|\[MODE:\s*[^\]]+\]\s*)', '', cleaned).strip()
    cleaned = re.sub(r'\[(Em|Am|C|D|G|F|Bm|A|E)\]\s*Nie_BLUE[^\n]*,?', r'[\1]', cleaned, flags=re.IGNORECASE).strip()
    
    return cleaned

@spaces.GPU
def run_omni_inference(mode, prompt_text, temperature=0.7, max_tokens=1024):
    model = get_model()
    device = "cuda" if torch.cuda.is_available() else "cpu"

    formatted_user_prompt = f"""{SYSTEM_PROMPT}
<|im_start|>user
[MODE: {mode}]
{prompt_text}<|im_end|>
<|im_start|>assistant
"""
    inputs = tokenizer([formatted_user_prompt], return_tensors="pt")
    if device == "cuda":
        inputs = {k: v.to("cuda") for k, v in inputs.items()}

    input_len = inputs["input_ids"].shape[1]

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=int(max_tokens),
            temperature=float(temperature),
            top_p=0.9,
            repetition_penalty=1.08,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id or tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    # Slice strictly the generated tokens to prevent any prompt token leaking
    generated_tokens = outputs[0][input_len:]
    raw_output = tokenizer.decode(generated_tokens, skip_special_tokens=True)
    
    return clean_model_output(raw_output)

# ----------------- Specialized Helper Functions for Gradio UI & API -----------------

def api_lyrics_studio(topic, language="Telugu", mood="Devotional", genre="Filmi / Cinematic", bpm=90):
    lang_rule = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["Telugu"])
    prompt_text = (
        f'Write a complete song with chords.\n'
        f'Topic/Theme: "{topic}"\n'
        f'Target Language: {language}\n'
        f'Language Instruction: {lang_rule}\n'
        f'Mood: {mood}\n'
        f'Genre/Style: {genre}\n'
        f'Tempo: {bpm} BPM'
    )
    return run_omni_inference("LYRICS_STUDIO", prompt_text, temperature=0.75, max_tokens=1024)

def api_prompt_director(idea, genre, mood):
    prompt_text = f'Enhance music prompt: "{idea}" | Genre: {genre} | Target Mood: {mood}'
    return run_omni_inference("PROMPT_DIRECTOR", prompt_text, temperature=0.6, max_tokens=300)

def api_story_blueprint(story, genre, track_count=4):
    prompt_text = f'Analyze story into album blueprint: Story: "{story}" | Preferred Genre: {genre} | Track Count: {track_count}'
    return run_omni_inference("STORY_BLUEPRINT", prompt_text, temperature=0.5, max_tokens=800)

def api_music_director(idea, emotion):
    prompt_text = f'Analyze musical arrangement parameters: Idea: "{idea}" | Emotion: {emotion}'
    return run_omni_inference("MUSIC_DIRECTOR", prompt_text, temperature=0.5, max_tokens=600)

def api_vocal_coach(lyrics, target_style):
    prompt_text = f'Vocal coaching request: Lyrics: "{lyrics}" | Target Style: {target_style}'
    return run_omni_inference("VOCAL_COACH", prompt_text, temperature=0.5, max_tokens=400)

# ----------------- Gradio Interface -----------------

custom_css = """
body { font-family: 'Segoe UI', system-ui, sans-serif; }
.main-title { font-size: 26px; font-weight: 700; margin-bottom: 2px; }
.sub-title { font-size: 14px; color: #64748b; margin-bottom: 20px; }
.generate-btn { background: linear-gradient(135deg, #ea580c, #f97316) !important; color: white !important; font-weight: 600; border-radius: 8px; }
"""

with gr.Blocks(title="Gandharva Omni - AI Lyrics & Composition Assistant", css=custom_css) as demo:
    gr.Markdown(
        """
        # 🎵 Gandharva Omni - AI Lyrics & Composition Assistant
        **ZeroGPU-accelerated multilingual neural lyric generator.**
        """
    )
    
    with gr.Tab("🎤 Lyrics Generator"):
        with gr.Row():
            with gr.Column(scale=1):
                t_prompt = gr.Textbox(
                    label="Prompt / Theme",
                    placeholder="create a spiritual lord vinayaka song with real emotions",
                    lines=3
                )
                t_language = gr.Dropdown(
                    ["Telugu", "Hindi", "Tamil", "English", "Kannada", "Malayalam"],
                    value="Telugu",
                    label="Language"
                )
                t_mood = gr.Dropdown(
                    ["Devotional", "Romantic", "Motivation & Energy", "Melancholic Sad", "Party & Dance", "Folk & Earthy"],
                    value="Devotional",
                    label="Mood"
                )
                t_genre = gr.Dropdown(
                    ["Filmi / Cinematic", "Mass Anthem", "Soulful", "Acoustic Pop", "Classical Fusion", "Rap / Hip-Hop", "EDM"],
                    value="Filmi / Cinematic",
                    label="Genre / Style"
                )
                t_bpm = gr.Slider(minimum=40, maximum=200, value=90, step=1, label="Tempo (BPM)")
                
                btn_gen_lyrics = gr.Button("✨ Generate Lyrics", variant="primary", elem_classes=["generate-btn"])
            
            with gr.Column(scale=1):
                out_lyrics = gr.Textbox(label="Generated Lyrics", lines=20, show_copy_button=True)
                
        btn_gen_lyrics.click(
            api_lyrics_studio,
            inputs=[t_prompt, t_language, t_mood, t_genre, t_bpm],
            outputs=out_lyrics,
            api_name="generate_lyrics"
        )

    with gr.Tab("🪄 Magic Prompt Enhancer"):
        with gr.Row():
            with gr.Column():
                p_idea = gr.Textbox(label="Raw Idea", placeholder="High-octane hero introduction festival dance", lines=2)
                p_genre = gr.Dropdown(["Synthwave / Cyberpunk", "Cinematic Orchestral", "Tollywood Folk Fusion", "Lo-Fi Chill", "Progressive Rock"], value="Synthwave / Cyberpunk", label="Genre")
                p_mood = gr.Dropdown(["Cinematic", "Aggressive", "Uplifting", "Atmospheric", "Dramatic"], value="Cinematic", label="Target Mood")
                btn_prompt = gr.Button("⚡ Enhance for MusicGen / ACE-Step", variant="primary")
            with gr.Column():
                out_prompt = gr.Textbox(label="Production Engineering Prompt (BPM, Key, Stems)", lines=8)
        btn_prompt.click(api_prompt_director, inputs=[p_idea, p_genre, p_mood], outputs=out_prompt, api_name="enhance_prompt")

    with gr.Tab("📖 Story-to-Album Blueprint"):
        with gr.Row():
            with gr.Column():
                s_story = gr.Textbox(label="Story / Narrative", placeholder="A young musician travels from a rural village to the metropolis with only a violin...", lines=4)
                s_genre = gr.Dropdown(["Cinematic Drama", "Epic Fantasy", "Romantic Journey", "Cyberpunk Thriller"], value="Cinematic Drama", label="Preferred Genre")
                s_tracks = gr.Slider(minimum=2, maximum=6, value=4, step=1, label="Track Count")
                btn_story = gr.Button("🎬 Generate Album Blueprint JSON", variant="primary")
            with gr.Column():
                out_story = gr.Textbox(label="Generated Album Blueprint JSON", lines=16)
        btn_story.click(api_story_blueprint, inputs=[s_story, s_genre, s_tracks], outputs=out_story, api_name="generate_blueprint")

    with gr.Tab("🎛️ Music Director & Arrangement"):
        with gr.Row():
            with gr.Column():
                m_idea = gr.Textbox(label="Musical Concept", placeholder="Mother singing a gentle lullaby under moonlight", lines=2)
                m_emotion = gr.Dropdown(["Cinematic", "Peaceful", "Tense", "Joyful", "Melancholic"], value="Cinematic", label="Emotion")
                btn_music = gr.Button("🎼 Get BPM, Key & Arrangement Stems", variant="primary")
            with gr.Column():
                out_music = gr.Textbox(label="Arrangement Timeline & Stems JSON", lines=12)
        btn_music.click(api_music_director, inputs=[m_idea, m_emotion], outputs=out_music, api_name="music_director")

    with gr.Tab("🎙️ Vocal Coach"):
        with gr.Row():
            with gr.Column():
                v_lyrics = gr.Textbox(label="Vocal Line / Lyrics", placeholder="కలిసి నడిచే దారులన్నీ పూల వానై మారెనే...", lines=3)
                v_style = gr.Dropdown(["Tollywood High-Energy", "Classical Carnatic Inflection", "Soft Acoustic Pop", "Western Belting"], value="Tollywood High-Energy", label="Target Style")
                btn_vocal = gr.Button("🎤 Get Vocal Execution Guidance", variant="primary")
            with gr.Column():
                out_vocal = gr.Textbox(label="Vocal Guidance (Pitch, Dynamic, Phrasing)", lines=10)
        btn_vocal.click(api_vocal_coach, inputs=[v_lyrics, v_style], outputs=out_vocal, api_name="vocal_coach")

if __name__ == "__main__":
    demo.launch()
