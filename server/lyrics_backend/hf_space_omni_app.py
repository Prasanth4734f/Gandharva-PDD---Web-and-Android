import os
import sys
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

# Check for ZeroGPU
try:
    import spaces
    has_spaces = True
except ImportError:
    has_spaces = False
    class spaces:
        @staticmethod
        def GPU(func):
            return func

BASE_MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"
ADAPTER_DIR = os.environ.get("ADAPTER_REPO_OR_PATH", "Prasanthm4734f/gandharva-omni-weights")

# Fallback paths
if not os.path.exists(ADAPTER_DIR):
    candidates = [
        "gandharva_omni_weights",
        "../gandharva_omni_weights",
        "./",
        "server/gandharva_omni_weights"
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.exists(os.path.join(c, "adapter_config.json")):
            ADAPTER_DIR = c
            break

print(f"🚀 Initializing Gandharva-Omni Tokenizer...")
try:
    tokenizer = AutoTokenizer.from_pretrained(ADAPTER_DIR, trust_remote_code=True)
except Exception:
    tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B-Instruct", trust_remote_code=True)

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
        print(f"⚠️ Falling back to 1.5B/7B standard instruct: {e}")
        base_model = AutoModelForCausalLM.from_pretrained(
            "Qwen/Qwen2.5-7B-Instruct",
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

SYSTEM_PROMPT = """<|im_start|>system
You are Gandharva-Omni AI Engine, an expert music studio intelligence system.
CORE ORIGINALITY RULE: You strictly generate 100% ORIGINAL music compositions, chord charts, and lyrics. When composer styles (such as Anirudh, A.R. Rahman, Hans Zimmer, Thaman, Keeravani) are mentioned, you extract strictly their acoustic sound engineering DNA (sub-bass energy, transient dynamics, modal chord density, tempo pacing) and NEVER reproduce past melodies, riffs, or copyright song motifs.
You operate in 5 specialized modes based on the task tag:
- [MODE: PROMPT_DIRECTOR]: Expand raw music prompt into a 150-word audio engineering prompt with BPM, Key signature, and acoustic textures for MusicGen.
- [MODE: LYRICS_STUDIO]: Write a full structured song in the requested language (Telugu, Hindi, Tamil, English, Kannada, Malayalam) with section tags [పల్లవి], [చరణం], [Verse], [Chorus] and embedded chord tags.
- [MODE: NIE_BLUEPRINT]: Analyze story text and output 100% valid JSON matching the AlbumBlueprint schema with scene tracks, emotions, and BPM.
- [MODE: MUSIC_DIRECTOR]: Output JSON with recommended BPM, Root Key, Time Signature, and Arrangement Stems.
- [MODE: VOCAL_COACH]: Provide actionable vocal tips, pitch guidance, and singing expression notes.<|im_end|>"""

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

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=int(max_tokens),
            temperature=float(temperature),
            top_p=0.9,
            repetition_penalty=1.05,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id or tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )

    full_output = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "<|im_start|>assistant" in full_output:
        result = full_output.split("<|im_start|>assistant")[-1].strip()
    elif "\nassistant\n" in full_output:
        result = full_output.split("\nassistant\n")[-1].strip()
    else:
        result = full_output.replace(formatted_user_prompt, "").strip()

    return result

# ----------------- Specialized Helper Functions for API -----------------

def api_lyrics_studio(topic, language, mood, genre):
    prompt_text = f'Write song lyrics: Topic: "{topic}" | Language: {language} | Mood: {mood} | Genre: {genre}'
    return run_omni_inference("LYRICS_STUDIO", prompt_text, temperature=0.75, max_tokens=1024)

def api_prompt_director(idea, genre, mood):
    prompt_text = f'Enhance music prompt: "{idea}" | Genre: {genre} | Target Mood: {mood}'
    return run_omni_inference("PROMPT_DIRECTOR", prompt_text, temperature=0.6, max_tokens=300)

def api_story_blueprint(story, genre, track_count=4):
    prompt_text = f'Analyze story into album blueprint: Story: "{story}" | Preferred Genre: {genre} | Track Count: {track_count}'
    return run_omni_inference("NIE_BLUEPRINT", prompt_text, temperature=0.5, max_tokens=800)

def api_music_director(idea, emotion):
    prompt_text = f'Analyze musical arrangement parameters: Idea: "{idea}" | Emotion: {emotion}'
    return run_omni_inference("MUSIC_DIRECTOR", prompt_text, temperature=0.5, max_tokens=600)

def api_vocal_coach(lyrics, target_style):
    prompt_text = f'Vocal coaching request: Lyrics: "{lyrics}" | Target Style: {target_style}'
    return run_omni_inference("VOCAL_COACH", prompt_text, temperature=0.5, max_tokens=400)

# ----------------- Gradio Multi-Tab Interface -----------------

with gr.Blocks(title="🎵 Gandharva-Omni AI Music Studio") as demo:
    gr.Markdown("# 🎼 Gandharva-Omni AI Music Studio\n**All-in-One Multi-Engine Music Intelligence** (Lyrics, Prompt Enhancement, Album Blueprints, Vocal Coaching)")
    
    with gr.Tab("🎤 Lyrics Studio"):
        with gr.Row():
            with gr.Column():
                l_topic = gr.Textbox(label="Song Topic / Theme", placeholder="విజయ యాత్ర మరియు సంకల్పం / First Love / Road Trip Anthem", lines=2)
                l_lang = gr.Dropdown(["Telugu", "Hindi", "Tamil", "English", "Kannada", "Malayalam"], value="Telugu", label="Language")
                l_mood = gr.Dropdown(["Motivation & Energy", "Romantic Melody", "Melancholic Sad", "Devotional & Spiritual", "Party & Dance", "Folk & Earthy"], value="Motivation & Energy", label="Mood")
                l_genre = gr.Dropdown(["Mass Anthem", "Soulful", "Acoustic Pop", "Classical Fusion", "Rap / Hip-Hop", "EDM"], value="Mass Anthem", label="Genre")
                btn_lyrics = gr.Button("✨ Generate Multilingual Lyrics & Chords", variant="primary")
            with gr.Column():
                out_lyrics = gr.Textbox(label="Generated Lyrics with Chords", lines=18)
        btn_lyrics.click(api_lyrics_studio, inputs=[l_topic, l_lang, l_mood, l_genre], outputs=out_lyrics, api_name="generate_lyrics")

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
    demo.launch(share=True)
