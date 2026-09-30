import os
import sys
import huggingface_hub

# 1. CRITICAL: Monkey-patch HfFolder BEFORE importing gradio
if not hasattr(huggingface_hub, "HfFolder"):
    class HfFolder:
        @classmethod
        def get_token(cls): return None
        @classmethod
        def save_token(cls, token): pass
    huggingface_hub.HfFolder = HfFolder

import io
import gc
import uuid
import tempfile
import scipy.io.wavfile
import numpy as np
import torch
import torchaudio
import spaces
import gradio as gr
from transformers import AutoProcessor, MusicgenForConditionalGeneration, MusicgenMelodyForConditionalGeneration

MODEL_ID = "facebook/musicgen-small"
MELODY_MODEL_ID = "facebook/musicgen-melody"

print(f"🚀 Pre-loading MusicGen Models & Processors into RAM...")
processor_text = AutoProcessor.from_pretrained(MODEL_ID)
model_text_cpu = MusicgenForConditionalGeneration.from_pretrained(MODEL_ID, torch_dtype=torch.float32)

processor_melody = AutoProcessor.from_pretrained(MELODY_MODEL_ID)
model_melody_cpu = MusicgenMelodyForConditionalGeneration.from_pretrained(MELODY_MODEL_ID, torch_dtype=torch.float32)

print("✨ MusicGen Models successfully pre-loaded in memory!")

def apply_ace_step_conditioning(raw_prompt: str, style_tags: str = "") -> str:
    """ACE-Step 8.0 Dataset Conditioning Pipeline."""
    if "[ACE-Step" in raw_prompt:
        return raw_prompt
        
    lower = raw_prompt.lower()
    genre = "Cinematic Score"
    if "rock" in lower: genre = "Alternative Rock"
    elif "pop" in lower: genre = "Acoustic Pop"
    elif "lofi" in lower or "lo-fi" in lower: genre = "Lo-Fi Chillhop"
    elif "edm" in lower or "dance" in lower: genre = "Melodic EDM"
    elif "synth" in lower or "cyber" in lower: genre = "Cyberpunk Synthwave"
    elif "devotional" in lower or "spiritual" in lower: genre = "Spiritual Indian Fusion"
    elif "piano" in lower: genre = "Romantic Piano Solo"
    elif "hero" in lower or "war" in lower: genre = "Epic Orchestral Action"
    elif "jazz" in lower: genre = "Smooth Jazz Lounge"

    return (
        f"[ACE-Step 8.0 Master BGM] "
        f"[Genre: {genre}] "
        f"[Style: {style_tags if style_tags else 'Professional Composition'}] "
        f"[Acoustics: Deep Stereo Resonance, Balanced Harmonics] "
        f"[Production: Multi-Platinum Studio Master Quality] "
        f"[Prompt: {raw_prompt}]"
    )

@spaces.GPU(duration=60)
def generate_music(prompt: str, style: str = "", duration: int = 10):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        gc.collect()

    ace_prompt = apply_ace_step_conditioning(prompt, style)
    
    # Move model to assigned ZeroGPU
    model = model_text_cpu.to(device)
    
    inputs = processor_text(
        text=[ace_prompt],
        padding=True,
        return_tensors="pt"
    ).to(device)
    
    # 50 tokens = 1 sec audio
    max_tokens = int(min(max(duration, 3), 30) * 50)
    
    with torch.no_grad():
        audio_values = model.generate(**inputs, max_new_tokens=max_tokens, do_sample=True, guidance_scale=3.0)
        
    wav = audio_values[0, 0].cpu().float().numpy()
    wav = wav / (max(abs(wav)) + 1e-6)
    
    sampling_rate = model.config.audio_encoder.sampling_rate if hasattr(model.config, 'audio_encoder') else 32000
    temp_wav = os.path.join(tempfile.gettempdir(), f"music_{uuid.uuid4().hex}.wav")
    scipy.io.wavfile.write(temp_wav, int(sampling_rate), wav)
    return temp_wav

@spaces.GPU(duration=60)
def generate_vocal_backing(prompt: str, vocal_audio_path: str, duration: int = 10):
    if not vocal_audio_path or not os.path.exists(vocal_audio_path):
        return None

    device = "cuda" if torch.cuda.is_available() else "cpu"
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        gc.collect()

    melody, sr = torchaudio.load(vocal_audio_path)
    if melody.shape[0] > 1:
        melody = melody.mean(dim=0, keepdim=True)
        
    model = model_melody_cpu.to(device)
    ace_prompt = apply_ace_step_conditioning(prompt)
    
    inputs = processor_melody(
        audio=melody[0].numpy(),
        sampling_rate=sr,
        text=[ace_prompt],
        padding=True,
        return_tensors="pt"
    ).to(device)
    
    max_tokens = int(min(max(duration, 3), 30) * 50)
    
    with torch.no_grad():
        audio_values = model.generate(**inputs, max_new_tokens=max_tokens, do_sample=True, guidance_scale=3.0)
        
    wav_array = audio_values[0, 0].cpu().float().numpy()
    wav_array = wav_array / (max(abs(wav_array)) + 1e-6)
    
    sampling_rate = model.config.audio_encoder.sampling_rate if hasattr(model.config, 'audio_encoder') else 32000
    temp_wav = os.path.join(tempfile.gettempdir(), f"vocal_{uuid.uuid4().hex}.wav")
    scipy.io.wavfile.write(temp_wav, int(sampling_rate), wav_array)
    return temp_wav

custom_css = """
body { font-family: 'Segoe UI', system-ui, sans-serif; }
.generate-btn { background: linear-gradient(135deg, #ea580c, #f97316) !important; color: white !important; font-weight: 600; border-radius: 8px; font-size: 16px; padding: 10px; }
"""

with gr.Blocks(title="Gandharva Dual-Brain AI Music Studio (ZeroGPU)", css=custom_css) as demo:
    gr.Markdown(
        """
        # ⚡ Gandharva Dual-Brain AI Music Studio
        **ZeroGPU-powered 32kHz Stereo Music Generation (MusicGen + ACE-Step 8.0)**
        """
    )
    
    with gr.Tab("🎼 Text-to-Music (MusicGen)"):
        with gr.Row():
            with gr.Column(scale=1):
                p_in = gr.Textbox(
                    label="Prompt", 
                    value="Spiritual Indian flute and sitar meditation in C Minor",
                    lines=3
                )
                s_in = gr.Textbox(
                    label="Style Tags", 
                    value="Devotional Classical Fusion, 432Hz"
                )
                d_in = gr.Slider(5, 30, value=10, step=1, label="Duration (Seconds)")
                btn_gen = gr.Button("🎵 Generate Audio", variant="primary", elem_classes=["generate-btn"])
            with gr.Column(scale=1):
                audio_out = gr.Audio(label="Generated Audio Track", type="filepath", interactive=False)
                
        btn_gen.click(
            generate_music, 
            inputs=[p_in, s_in, d_in], 
            outputs=audio_out
        )

    with gr.Tab("🎤 Vocal Studio Magic Box (Melody Conditioning)"):
        with gr.Row():
            with gr.Column(scale=1):
                vp_in = gr.Textbox(
                    label="Prompt / Style", 
                    value="Soulful acoustic guitar backing track",
                    lines=2
                )
                va_in = gr.Audio(label="Record or Upload Vocal Humming/Singing", type="filepath")
                vd_in = gr.Slider(5, 30, value=10, step=1, label="Duration (Seconds)")
                vbtn_gen = gr.Button("✨ Compose Backing Track", variant="primary", elem_classes=["generate-btn"])
            with gr.Column(scale=1):
                vaudio_out = gr.Audio(label="Arranged Backing Track", type="filepath", interactive=False)
                
        vbtn_gen.click(
            generate_vocal_backing, 
            inputs=[vp_in, va_in, vd_in], 
            outputs=vaudio_out
        )

if __name__ == "__main__":
    demo.launch()
