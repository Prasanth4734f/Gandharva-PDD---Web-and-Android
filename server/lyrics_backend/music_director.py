import os
import json
import logging
import requests
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class MusicDirector:
    """
    Music Director Engine (Phase 2)
    Ingests the Acoustic Emotion Probability Matrix and the Math data.
    Generates a highly detailed, evolving musical blueprint using Gandharva's internal DSP director.
    """
    
    @staticmethod
    def create_blueprint(vocal_data: dict, emotion_data: dict, user_genre: str = None, genre: str = None) -> dict:
        logger.info("[MusicDirector] Crafting intelligent music blueprint...")
        target_genre = user_genre or genre
        return MusicDirector._fallback_blueprint(vocal_data, emotion_data, target_genre)

    @staticmethod
    def _fallback_blueprint(vocal_data, emotion_data, user_genre):
        bpm = vocal_data.get("bpm", 120)
        primary_emotion = emotion_data.get("primary_emotion")
        if not primary_emotion and "emotions" in emotion_data and isinstance(emotion_data["emotions"], dict):
            emotions_dict = emotion_data["emotions"]
            if emotions_dict:
                primary_emotion = max(emotions_dict, key=emotions_dict.get).capitalize()
        if not primary_emotion:
            primary_emotion = "Neutral"

        target_genre = user_genre if user_genre else "Cinematic Pop"
        
        return {
            "genre": target_genre,
            "bpm": bpm,
            "primary_mood": primary_emotion,
            "arrangement_plan": f"Standard arrangement matching the primary emotion of {primary_emotion}.",
            "prompt": f"{target_genre}, {primary_emotion} mood, Piano, Strings, Drums, award-winning Billboard hit production, pristine studio quality, multi-platinum mixing, immersive 8k audio, perfectly mixed",
            "sections": {
                "intro": { "start": 0, "end": 15, "emotion": primary_emotion, "instruments": ["Piano"] },
                "verse": { "start": 15, "end": 45, "emotion": primary_emotion, "instruments": ["Piano", "Strings"] },
                "chorus": { "start": 45, "end": 75, "emotion": primary_emotion, "instruments": ["Piano", "Strings", "Drums"] },
                "outro": { "start": 75, "end": 90, "emotion": primary_emotion, "instruments": ["Piano"] }
            }
        }
