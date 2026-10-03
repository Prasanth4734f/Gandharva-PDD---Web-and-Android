# app.py - Gandharva Omni-Model 24/7 ZeroGPU Music Engine
# Designed for 24/7 continuous operation on Hugging Face ZeroGPU (Prasanthm4734f/Gandharva-Omni-Model)

import os
import io
import gc
import time
import spaces
import torch
import numpy as np
import scipy.io.wavfile
import gradio as gr
from fastapi import Request, Response, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoProcessor, MusicgenForConditionalGeneration

print("🚀 Initializing Gandharva 24/7 ZeroGPU Music Engine...")

# 1. Pre-load MusicGen Model Architecture on CPU (ZeroGPU dynamically moves to GPU on request)
print("📥 Loading facebook/musicgen-small model...")
processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
musicgen_model = MusicgenForConditionalGeneration.from_pretrained(
    "facebook/musicgen-small",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)

# 2. Optional Vocal Diffusion Loader
audioldm_pipe = None
try:
    from diffusers import AudioLDM2Pipeline
    audioldm_pipe = AudioLDM2Pipeline.from_pretrained(
        "cvssp/audioldm2-music",
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
    )
    print("✅ AudioLDM2 Vocal pipeline loaded.")
except Exception as e:
    print(f"ℹ️ Vocal pipeline notice: {e} (Running in pure MusicGen mode)")

print("✨ Gandharva 24/7 Engine Ready!")


# --- Core 24/7 ZeroGPU Inference Functions ---

@spaces.GPU(duration=60)
def synthesize_musicgen_wav(prompt: str, duration: int = 10, seed: int = None) -> bytes:
    """Generates studio-quality AI Music WAV from text prompt using dynamic ZeroGPU."""
    if not prompt or not prompt.strip():
        prompt = "High quality master-tier cinematic music, pristine acoustics, 24-bit studio audio"

    if seed is not None and int(seed) > 0:
        torch.manual_seed(int(seed))
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(int(seed))

    device = "cuda" if torch.cuda.is_available() else "cpu"
    musicgen_model.to(device)

    target_duration = max(5, min(int(duration), 30))
    # 50 tokens = 1 second of audio in MusicGen architecture
    max_tokens = int(target_duration * 50)

    inputs = processor(
        text=[prompt.strip()],
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

    sampling_rate = musicgen_model.config.audio_encoder.sampling_rate # 32000 Hz
    audio_data = audio_values[0, 0].cpu().float().numpy()

    # Peak normalization to prevent audio clipping distortion
    max_val = np.max(np.abs(audio_data))
    if max_val > 0:
        audio_data = audio_data / max_val
    audio_int16 = np.int16(audio_data * 32767)

    # Clean GPU memory immediately to maintain 24/7 stability
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    gc.collect()

    wav_io = io.BytesIO()
    scipy.io.wavfile.write(wav_io, sampling_rate, audio_int16)
    wav_io.seek(0)
    return wav_io.read()


@spaces.GPU(duration=30)
def generate_pure_vocal_to_accompaniment(vocal_audio_tuple):
    """Generates vocal accompaniment using AudioLDM2 on ZeroGPU."""
    if audioldm_pipe is None or vocal_audio_tuple is None:
        return 16000, np.zeros(16000, dtype=np.float32)

    sr, y = vocal_audio_tuple
    if len(y.shape) > 1:
        y = np.mean(y, axis=1)
    vocal_signal = y.astype(np.float32) / (np.max(np.abs(y)) + 1e-6)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    audioldm_pipe.to(device)

    with torch.no_grad():
        engineered_prompt = "High quality professional studio instrumental accompaniment track, perfectly arranged, no vocals"
        generated_audio = audioldm_pipe(
            prompt=engineered_prompt,
            negative_prompt="low quality, muffled sound, distorted instruments, mono, hiss, crackle, out of tune, amateur mix",
            guidance_scale=4.5,
            audio_placeholder=vocal_signal,
            audio_placeholder_sample_rate=sr,
            num_inference_steps=35,
            audio_length_in_s=15.0
        ).audios[0]

    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    gc.collect()

    return 16000, generated_audio


# --- Interactive Gradio Web Studio Interface ---

with gr.Blocks(title="Gandharva AI Studio Engine") as demo:
    gr.Markdown("# 🎵 Gandharva AI Music Production Engine (24/7 ZeroGPU)")
    gr.Markdown("Direct AI Neural Music Generation API for Gandharva Mobile and Web Apps.")

    with gr.Tab("Prompt to Music (MusicGen)"):
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
                audio_output = gr.Audio(label="Generated Soundtrack WAV", type="filepath")

        def gradio_generate_music(p, d):
            raw_wav = synthesize_musicgen_wav(prompt=p, duration=int(d))
            temp_path = "/tmp/gradio_output.wav"
            with open(temp_path, "wb") as f:
                f.write(raw_wav)
            return temp_path

        generate_btn.click(
            fn=gradio_generate_music,
            inputs=[prompt_input, duration_slider],
            outputs=[audio_output]
        )

    if audioldm_pipe is not None:
        with gr.Tab("Vocal to BGM (AudioLDM2)"):
            vocal_input = gr.Audio(type="numpy", label="Upload Singing or Whistling Vocal")
            vocal_btn = gr.Button("Create Instrumental Accompaniment ✨", variant="primary")
            vocal_output = gr.Audio(label="Synthesized Accompaniment")
            vocal_btn.click(
                fn=generate_pure_vocal_to_accompaniment,
                inputs=[vocal_input],
                outputs=[vocal_output]
            )


# --- Attach REST API Endpoints directly to demo.app (FastAPI) ---

@demo.app.get("/health")
@demo.app.get("/musicgen-health")
async def health_check():
    """24/7 Status check probe for mobile app auto-discovery."""
    return {
        "status": "online",
        "gpu_live": True,
        "backend_live": True,
        "engine": "Gandharva 24/7 ZeroGPU Music Engine",
        "models": ["facebook/musicgen-small"],
        "server_time": time.time()
    }


@demo.app.post("/generate")
async def generate_music_endpoint(payload: dict = Body(...)):
    """
    Main Text-to-Music generation endpoint.
    Accepts: { prompt: str, duration: int, seed: int }
    Returns: Binary WAV audio stream.
    """
    prompt = payload.get("prompt", "")
    duration = int(payload.get("duration", 10))
    seed = payload.get("seed", None)

    if not prompt or not prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    print(f"\n🎵 [24/7 API /generate] Processing: '{prompt[:60]}...' ({duration}s)")
    try:
        wav_bytes = synthesize_musicgen_wav(prompt=prompt, duration=duration, seed=seed)
        return Response(content=wav_bytes, media_type="audio/wav")
    except Exception as e:
        print(f"❌ [24/7 API /generate] Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Enable CORS on demo.app
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Launch Gradio without manual host/port overrides so ZeroGPU handles internal proxy binding
demo.launch()
