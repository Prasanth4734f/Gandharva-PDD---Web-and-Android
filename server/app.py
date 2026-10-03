# app.py - Gandharva Omni-Model 24/7 ZeroGPU Music Engine
# Deploy directly into Hugging Face ZeroGPU Space: Prasanthm4734f/Gandharva-Omni-Model

import os
import io
import gc
import time
import spaces
import torch
import numpy as np
import gradio as gr
from transformers import AutoProcessor, MusicgenForConditionalGeneration

print("🚀 Initializing Gandharva ZeroGPU Music Engine...")

# Preload facebook/musicgen-small
processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
musicgen_model = MusicgenForConditionalGeneration.from_pretrained(
    "facebook/musicgen-small",
    torch_dtype=torch.float32 # Use float32 on CPU for clean serialization
)

print("✨ MusicGen Loaded!")

@spaces.GPU(duration=60)
def generate_music(prompt: str, duration: int = 10):
    """Generates AI Music from text prompt on ZeroGPU and returns tuple of (sample_rate, numpy_array)."""
    if not prompt or not str(prompt).strip():
        prompt = "High quality master-tier cinematic music, pristine acoustics, 24-bit audio"

    device = "cuda" if torch.cuda.is_available() else "cpu"
    musicgen_model.to(device)

    target_duration = max(5, min(int(duration or 10), 30))
    max_tokens = int(target_duration * 50)

    inputs = processor(
        text=[str(prompt).strip()],
        padding=True,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        audio_values = musicgen_model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            do_sample=True,
            guidance_scale=3.5
        )

    sampling_rate = int(musicgen_model.config.audio_encoder.sampling_rate) # 32000
    audio_data = audio_values[0, 0].cpu().float().numpy()

    # Normalize audio
    max_val = float(np.max(np.abs(audio_data)))
    if max_val > 0:
        audio_data = audio_data / max_val

    # Clear VRAM cache
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    gc.collect()

    return (sampling_rate, audio_data)


# Gradio Web Studio + API Interface
with gr.Blocks(title="Gandharva AI Studio Engine") as demo:
    gr.Markdown("# 🎵 Gandharva AI Music Production Engine (ZeroGPU)")
    gr.Markdown("24/7 AI Neural Music Generation API for Gandharva Mobile and Web Studios.")

    with gr.Row():
        with gr.Column():
            prompt_input = gr.Textbox(
                label="Music Prompt",
                placeholder="E.g. A master-tier High-Octane Cinematic Mass Anthem at 130 BPM in E Minor with heavy 808 sub-bass...",
                lines=4
            )
            duration_slider = gr.Slider(minimum=5, maximum=30, value=10, step=1, label="Duration (seconds)")
            generate_btn = gr.Button("Generate AI Music 🚀", variant="primary")
        with gr.Column():
            audio_output = gr.Audio(label="Generated Soundtrack WAV")

    generate_btn.click(
        fn=generate_music,
        inputs=[prompt_input, duration_slider],
        outputs=[audio_output],
        api_name="generate_music"
    )

demo.launch()
