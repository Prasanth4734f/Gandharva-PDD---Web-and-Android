import spaces
import os
import sys
import re
import torch
import huggingface_hub

# Monkey-patch HfFolder for compatibility with newer huggingface_hub versions
if not hasattr(huggingface_hub, "HfFolder"):
    class HfFolder:
        @classmethod
        def get_token(cls): return None
        @classmethod
        def save_token(cls, token): pass
    huggingface_hub.HfFolder = HfFolder

import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

BASE_MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"
ADAPTER_REPO = "Prasanthm4734f/gandharva-lyrics-v1"
LOCAL_ADAPTER_PATH = os.path.join(os.path.dirname(__file__), "gandharva_lyrics_v1")

target_adapter = ADAPTER_REPO
if os.path.exists(LOCAL_ADAPTER_PATH):
    target_adapter = LOCAL_ADAPTER_PATH
elif os.path.exists("gandharva_lyrics_v1"):
    target_adapter = "gandharva_lyrics_v1"

print(f"🚀 Initializing Tokenizer ({BASE_MODEL_ID})...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID, trust_remote_code=True)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

_model_cache = None

def get_model(device):
    global _model_cache
    if _model_cache is not None:
        return _model_cache
        
    print(f"🚀 Loading Base Model ({BASE_MODEL_ID}) & LoRA Adapter from '{target_adapter}' on {device}...")
    try:
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_ID,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            low_cpu_mem_usage=True,
            trust_remote_code=True
        )
    except Exception as err:
        print(f"⚠️ Base model load fallback ({err}). Using Qwen2.5-1.5B-Instruct...")
        base_model = AutoModelForCausalLM.from_pretrained(
            "Qwen/Qwen2.5-1.5B-Instruct",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            low_cpu_mem_usage=True,
            trust_remote_code=True
        )
    
    print(f"✅ Loading Gandharva LoRA Adapter from '{target_adapter}'...")
    try:
        _model_cache = PeftModel.from_pretrained(base_model, target_adapter)
    except Exception as p_err:
        print(f"⚠️ Peft note ({p_err}). Using base model.")
        _model_cache = base_model
        
    _model_cache.eval()
    if device == "cuda":
        _model_cache.to("cuda")
    return _model_cache

LANGUAGE_INSTRUCTIONS = {
    "Telugu": "Write strictly in authentic Telugu script (తెలుగు లిపి). Structure the song with [పల్లవి], [చరణం 1], [చరణం 2], [ముగింపు] and chords [Em], [D], [G], etc. DO NOT write English lyrics.",
    "Hindi": "Write strictly in authentic Hindi Devanagari script (हिन्दी). Structure the song with [मुखड़ा], [अंतरा 1], [अंतरा 2], [समाप्ति] and chords. DO NOT write English lyrics.",
    "Tamil": "Write strictly in authentic Tamil script (தமிழ்). Structure the song with [பல்லவி], [சரணம் 1], [சரணம் 2], [முடிவு] and chords. DO NOT write English lyrics.",
    "Kannada": "Write strictly in authentic Kannada script (ಕನ್ನಡ). Structure the song with [ಪಲ್ಲವಿ], [ಚರಣ 1], [ಚರಣ 2] and chords. DO NOT write English lyrics.",
    "Malayalam": "Write strictly in authentic Malayalam script (മലയാളം). Structure the song with [പല്ലവി], [ചരണം 1], [ചരണം 2] and chords. DO NOT write English lyrics.",
    "English": "Write full song structure in English with [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] and chords."
}

def clean_output(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r'^(?:assistant|Assistant)\s*:\s*', '', cleaned)
    cleaned = re.sub(r'^(?:<\|im_start\|>assistant|<\|im_end\|>|\nassistant\n)', '', cleaned).strip()
    # Strip hallucinated remnants like Nie_BLUE, NIE_BLUEPRINT, etc.
    cleaned = re.sub(r'(?i)^(?:Nie_BLUE[^\n]*,?\s*|\bNIE_BLUEPRINT\b\s*|\[MODE:\s*[^\]]+\]\s*)', '', cleaned).strip()
    cleaned = re.sub(r'\[(Em|Am|C|D|G|F|Bm|A|E)\]\s*Nie_BLUE[^\n]*,?', r'[\1]', cleaned, flags=re.IGNORECASE).strip()
    return cleaned

@spaces.GPU
def generate_lyrics(prompt, language="Telugu", mood="Devotional", genre="Filmi / Cinematic", bpm=90):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = get_model(device)

    lang_rule = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["Telugu"])

    system_prompt = f"""<|im_start|>system
You are Gandharva Lyrics AI, a master multilingual songwriter and music director.
CRITICAL LANGUAGE INSTRUCTION:
{lang_rule}
Language: {language}
Mood: {mood}
Genre/Style: {genre}
Tempo: {bpm} BPM

Return ONLY the complete song lyrics in authentic {language} script with chord tags. Do not output English explanations.
<|im_end|>
<|im_start|>user
Write a full devotional and emotive song with chords based on this theme:
Topic: "{prompt}"
Target Language: {language}
Mood: {mood}
Genre: {genre}
Tempo: {bpm} BPM
<|im_end|>
<|im_start|>assistant
"""
    inputs = tokenizer([system_prompt], return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    input_len = inputs["input_ids"].shape[1]

    pad_id = tokenizer.pad_token_id if tokenizer.pad_token_id is not None else tokenizer.eos_token_id

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=1024,
            min_new_tokens=128,
            temperature=0.75,
            top_p=0.9,
            repetition_penalty=1.08,
            do_sample=True,
            pad_token_id=pad_id,
            eos_token_id=tokenizer.eos_token_id
        )

    # Slice generated tokens only
    generated_tokens = outputs[0][input_len:]
    raw_text = tokenizer.decode(generated_tokens, skip_special_tokens=True)
    return clean_output(raw_text)

custom_css = """
body { font-family: 'Segoe UI', system-ui, sans-serif; }
.generate-btn { background: linear-gradient(135deg, #ea580c, #f97316) !important; color: white !important; font-weight: 600; border-radius: 8px; }
"""

with gr.Blocks(title="Gandharva Omni - AI Lyrics & Composition Assistant", css=custom_css) as demo:
    gr.Markdown(
        """
        # 🎵 Gandharva Omni - AI Lyrics & Composition Assistant
        **ZeroGPU-accelerated multilingual neural lyric generator.**
        """
    )
    
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
        generate_lyrics,
        inputs=[t_prompt, t_language, t_mood, t_genre, t_bpm],
        outputs=out_lyrics,
        api_name="generate_lyrics"
    )

if __name__ == "__main__":
    demo.launch()
