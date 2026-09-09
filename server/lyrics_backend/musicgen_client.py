import os
import random
import httpx
import logging
import uuid
import time
from typing import Optional

logger = logging.getLogger(__name__)

SUPPORTED_AUDIO_EXTENSIONS = ('.mp3', '.wav', '.ogg', '.flac', '.m4a')

class MusicGenClient:
    """
    Handles async communication with the MusicGen API and provides an offline,
    API-free local fallback music library when the GPU service is unavailable.
    """

    def __init__(self, api_url: str = "", fallback_dir: str = "", output_dir: str = ""):
        self.api_url = (api_url or "").rstrip("/")
        
        # Resolve fallback directory: prefer assets/fallback_music, then public/fallback
        if not fallback_dir or not os.path.exists(fallback_dir):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            candidate_assets = os.path.join(base_dir, "assets", "fallback_music")
            candidate_public = os.path.join(base_dir, "public", "fallback")
            if os.path.exists(candidate_assets):
                self.fallback_dir = candidate_assets
            elif os.path.exists(candidate_public):
                self.fallback_dir = candidate_public
            else:
                self.fallback_dir = candidate_assets
        else:
            self.fallback_dir = fallback_dir

        self.output_dir = output_dir or os.path.join(os.path.dirname(os.path.abspath(__file__)), "generated")
        os.makedirs(self.output_dir, exist_ok=True)

        self.last_source: Optional[str] = None
        self._last_fallback_file: Optional[str] = None

    async def generate_bgm(
        self,
        prompt: str,
        duration: int,
        genre: Optional[str] = None,
        analysis: dict = None,
        vocal_path: Optional[str] = None
    ) -> str:
        """
        Attempts to generate music via primary AI API (MusicGen / Hugging Face).
        If unavailable, falls back to the local fallback music library.
        Returns the absolute local path to the generated WAV file.
        """
        seed = int(time.time() * 1000) % 1000000
        output_filename = f"bgm_{uuid.uuid4().hex}.wav"
        output_path = os.path.join(self.output_dir, output_filename)

        # ============================================================
        # 1. Primary AI Generation Pipeline (MusicGen / Hugging Face)
        # ============================================================
        if self.api_url and not self.api_url.startswith("http://offline"):
            try:
                logger.info(f"[MusicGenClient] Requesting primary AI generation from {self.api_url}")
                logger.info(f"[MusicGenClient] Prompt: '{prompt}', Duration: {duration}s")

                async with httpx.AsyncClient() as client:
                    # Fast-fail connectivity check
                    await client.get(self.api_url, timeout=5.0, headers={"ngrok-skip-browser-warning": "1"})

                    if vocal_path and os.path.exists(vocal_path):
                        logger.info("[MusicGenClient] Uploading vocal for conditioning...")
                        magic_box_url = os.getenv("MAGIC_BOX_API_URL", self.api_url).rstrip("/")
                        with open(vocal_path, "rb") as f:
                            files = {'vocal_file': (os.path.basename(vocal_path), f, 'audio/wav')}
                            data = {'prompt': prompt, 'duration': str(duration), 'seed': str(seed)}
                            resp = await client.post(
                                f"{magic_box_url}/generate_vocal",
                                data=data,
                                files=files,
                                headers={"ngrok-skip-browser-warning": "1"},
                                timeout=600.0
                            )
                    else:
                        resp = await client.post(
                            f"{self.api_url}/generate",
                            json={"prompt": prompt, "duration": duration, "seed": seed},
                            headers={"ngrok-skip-browser-warning": "1"},
                            timeout=600.0
                        )

                    if resp.status_code == 200:
                        content_type = resp.headers.get("content-type", "")
                        # Raw binary audio
                        if "audio/" in content_type or resp.content.startswith(b"RIFF"):
                            with open(output_path, "wb") as f:
                                f.write(resp.content)
                            self.last_source = "musicgen"
                            logger.info(f"[MusicGenClient] Primary AI success. Output saved to {output_path}")
                            return output_path

                        # JSON payload containing audio_url
                        try:
                            data = resp.json()
                            audio_url = data.get("audio_url")
                            if audio_url:
                                audio_resp = await client.get(audio_url, timeout=30.0)
                                if audio_resp.status_code == 200:
                                    with open(output_path, "wb") as f:
                                        f.write(audio_resp.content)
                                    self.last_source = "musicgen"
                                    logger.info(f"[MusicGenClient] Primary AI success (downloaded). Output saved to {output_path}")
                                    return output_path
                        except Exception as json_err:
                            logger.warning(f"[MusicGenClient] JSON parse warning: {json_err}")
                    else:
                        logger.warning(f"[MusicGenClient] API returned status code {resp.status_code}")

            except Exception as e:
                logger.warning(f"[MusicGenClient] Primary AI generation unavailable: {e}. Switching to local fallback library...")

        # ============================================================
        # 2. Local Fallback Music Library (Offline, Zero External Calls)
        # ============================================================
        try:
            success = self._load_local_fallback(output_path)
            if success:
                self.last_source = "local_fallback"
                logger.info("[MusicGenClient] Successfully generated track from local fallback library.")
                return output_path
        except Exception as fallback_err:
            logger.error(f"[MusicGenClient] Local fallback processing error: {fallback_err}")
            raise

        raise RuntimeError("Music generation is temporarily unavailable and no local fallback track is available.")

    def _validate_audio_file(self, file_path: str) -> bool:
        """
        Validates that a local audio file exists, has content (>1KB), and is readable.
        """
        if not os.path.exists(file_path):
            return False
        try:
            if os.path.getsize(file_path) < 1024:
                return False
            # Verify file container readability using PyAV
            import av
            container = av.open(file_path)
            has_audio = any(stream.type == 'audio' for stream in container.streams)
            container.close()
            return has_audio
        except Exception as val_err:
            logger.warning(f"[MusicGenClient] Audio validation failed for {file_path}: {val_err}")
            return False

    def _load_local_fallback(self, output_path: str) -> bool:
        """
        Selects a random validated audio track from the local fallback library,
        decodes it, and renders a clean WAV output for downstream audio pipelines.
        """
        if not os.path.exists(self.fallback_dir):
            logger.error(f"[MusicGenClient] Fallback directory does not exist: {self.fallback_dir}")
            raise RuntimeError("Music generation is temporarily unavailable and no local fallback track is available.")

        all_files = [
            f for f in os.listdir(self.fallback_dir)
            if f.lower().endswith(SUPPORTED_AUDIO_EXTENSIONS)
        ]

        if not all_files:
            logger.error(f"[MusicGenClient] Fallback directory is empty: {self.fallback_dir}")
            raise RuntimeError("Music generation is temporarily unavailable and no local fallback track is available.")

        # Avoid repeating the immediate previous track if multiple files are available
        available_candidates = [f for f in all_files if f != self._last_fallback_file]
        if not available_candidates:
            available_candidates = all_files

        # Shuffle candidates to attempt valid selection
        random.shuffle(available_candidates)

        selected_file = None
        for candidate in available_candidates:
            cand_path = os.path.join(self.fallback_dir, candidate)
            if self._validate_audio_file(cand_path):
                selected_file = candidate
                break

        if not selected_file:
            # Try any file if non-repeated ones failed validation
            for candidate in all_files:
                cand_path = os.path.join(self.fallback_dir, candidate)
                if self._validate_audio_file(cand_path):
                    selected_file = candidate
                    break

        if not selected_file:
            logger.error("[MusicGenClient] No valid readable audio tracks found in local fallback library.")
            raise RuntimeError("Music generation is temporarily unavailable and no local fallback track is available.")

        self._last_fallback_file = selected_file
        source_path = os.path.join(self.fallback_dir, selected_file)
        logger.info(f"[MusicGenClient] Selected local fallback track: {selected_file}")

        # Decode using PyAV and write standard WAV format for the audio mixer pipeline
        import av
        import numpy as np
        import soundfile as sf

        container = av.open(source_path)
        stream = container.streams.audio[0]
        frames = [frame.to_ndarray() for frame in container.decode(stream)]
        container.close()

        if not frames:
            raise RuntimeError(f"Could not decode audio frames from fallback track: {selected_file}")

        audio_data = np.concatenate(frames, axis=1).T
        sf.write(output_path, audio_data, stream.rate)
        return True
