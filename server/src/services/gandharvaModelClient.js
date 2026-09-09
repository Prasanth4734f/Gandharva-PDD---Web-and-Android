/**
 * gandharvaModelClient.js
 * Universal High-Speed Client for Gandharva-Omni-7B Custom AI Engine
 * 
 * Multi-Tier Routing:
 * 1. Live Hugging Face Space (Free 24/7 ZeroGPU API)
 * 2. Local Ollama Instance (http://localhost:11434)
 * 3. Kaggle Cloud GPU Endpoint (AI_ENGINE_URL)
 * 4. High-Fidelity Procedural Studio Engine (Zero-Latency Guarantee)
 */

const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const { validateLyrics } = require('../utils/lyricsValidator');
const { generateFullLyrics } = require('./proceduralLyricsEngine');
const PromptEnhancer = require('./promptEnhancer');
const { extractStoryBlueprint } = require('./storyNarrativeEngine');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const HF_SPACE_URL = process.env.HF_OMNI_SPACE_URL || 'https://prasanthm4734f-gandharva-omni-model.hf.space';
const LOCAL_OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.GANDHARVA_MODEL_NAME || 'gandharva-omni-7b';

class GandharvaModelClient {
  /**
   * Execute task query on Gandharva-Omni-7B Model
   * @param {string} mode - 'PROMPT_DIRECTOR' | 'LYRICS_STUDIO' | 'NIE_BLUEPRINT' | 'MUSIC_DIRECTOR' | 'VOCAL_COACH'
   * @param {string|object} inputPayload - User input string or object
   * @param {object} options - Options { temperature, max_tokens, language, genre, mood }
   */
  static async generate(mode, inputPayload, options = {}) {
    const promptText = typeof inputPayload === 'string' ? inputPayload : JSON.stringify(inputPayload);
    const temperature = options.temperature || 0.75;
    const maxTokens = options.max_tokens || 1024;

    // -------------------------------------------------------------
    // TIER 1: Live Hugging Face Space ZeroGPU Endpoint
    // -------------------------------------------------------------
    if (HF_SPACE_URL) {
      try {
        let apiEndpoint = `${HF_SPACE_URL}/api/generate_lyrics`;
        let reqData = [promptText, options.language || "Telugu", options.mood || "Motivation & Energy", options.genre || "Mass Anthem"];

        if (mode === 'PROMPT_DIRECTOR') {
          apiEndpoint = `${HF_SPACE_URL}/api/enhance_prompt`;
          reqData = [promptText, options.genre || "Synthwave / Cyberpunk", options.mood || "Cinematic"];
        } else if (mode === 'NIE_BLUEPRINT') {
          apiEndpoint = `${HF_SPACE_URL}/api/generate_blueprint`;
          reqData = [promptText, options.genre || "Cinematic Drama", options.track_count || 4];
        } else if (mode === 'MUSIC_DIRECTOR') {
          apiEndpoint = `${HF_SPACE_URL}/api/music_director`;
          reqData = [promptText, options.mood || "Cinematic"];
        } else if (mode === 'VOCAL_COACH') {
          apiEndpoint = `${HF_SPACE_URL}/api/vocal_coach`;
          reqData = [promptText, options.target_style || "Tollywood High-Energy"];
        }

        const res = await axios.post(apiEndpoint, { data: reqData }, {
          timeout: 18000,
          headers: { 'Content-Type': 'application/json' }
        });

        if (res.data && res.data.data && res.data.data[0]) {
          logger.info(`[Gandharva-Omni] ✅ Served ${mode} via Hugging Face Space ZeroGPU!`);
          return this._cleanOutput(mode, res.data.data[0], options);
        }
      } catch (hfErr) {
        logger.warn(`[Gandharva-Omni] HF Space API busy or starting up (${hfErr.message}). Trying local/GPU tiers...`);
      }
    }

    const formattedPrompt = `<|im_start|>system\nYou are Gandharva-Omni AI Engine. You operate in 5 modes.<|im_end|>\n<|im_start|>user\n[MODE: ${mode}]\n${promptText}<|im_end|>\n<|im_start|>assistant\n`;

    // -------------------------------------------------------------
    // TIER 2: Local Ollama Instance (Sub-second speed if running)
    // -------------------------------------------------------------
    try {
      const res = await axios.post(`${LOCAL_OLLAMA_URL}/api/generate`, {
        model: MODEL_NAME,
        prompt: formattedPrompt,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: maxTokens,
          stop: ["<|im_end|>", "<|im_start|>"]
        }
      }, { timeout: 6000 });

      if (res.data && res.data.response && res.data.response.trim().length > 10) {
        logger.info(`[Gandharva-Omni] ✅ Served ${mode} locally via Ollama!`);
        return this._cleanOutput(mode, res.data.response.trim(), options);
      }
    } catch (ollamaErr) {}

    // -------------------------------------------------------------
    // TIER 3: Kaggle Cloud GPU Endpoint (AI_ENGINE_URL)
    // -------------------------------------------------------------
    const cloudGpuUrl = process.env.AI_ENGINE_URL || process.env.MUSICGEN_API_URL;
    if (cloudGpuUrl && !cloudGpuUrl.includes('your-url-here')) {
      try {
        const res = await axios.post(`${cloudGpuUrl}/generate_omni`, {
          mode: mode,
          prompt: promptText,
          temperature: temperature
        }, {
          timeout: 12000,
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (res.data && res.data.result) {
          logger.info(`[Gandharva-Omni] ✅ Served ${mode} via Kaggle Cloud GPU!`);
          return this._cleanOutput(mode, res.data.result.trim(), options);
        }
      } catch (gpuErr) {}
    }

    // -------------------------------------------------------------
    // TIER 4: Master Procedural Studio Fallback (Zero Downtime)
    // -------------------------------------------------------------
    logger.info(`[Gandharva-Omni] Serving ${mode} via high-precision procedural studio engine.`);
    return this._proceduralFallback(mode, promptText, options);
  }

  static _cleanOutput(mode, text, options) {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/<\|im_end\|>/g, '').replace(/<\|im_start\|>/g, '').trim();

    if (mode === 'NIE_BLUEPRINT' || mode === 'MUSIC_DIRECTOR') {
      try {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Return procedural structure if JSON is malformed
        return this._proceduralFallback(mode, text, options);
      }
    }
    return cleaned;
  }

  static _proceduralFallback(mode, promptText, options = {}) {
    if (mode === 'LYRICS_STUDIO') {
      return generateFullLyrics({
        prompt: promptText,
        genre: options.genre || 'Melody',
        mood: options.mood || 'Romantic',
        language: options.language || 'Telugu',
        variationIndex: options.variationIndex !== undefined ? options.variationIndex : 0
      });
    }

    if (mode === 'PROMPT_DIRECTOR') {
      return PromptEnhancer.enhance(promptText);
    }

    if (mode === 'NIE_BLUEPRINT') {
      return extractStoryBlueprint(promptText, options.language || 'English', options.track_count || 4, options.genre);
    }

    if (mode === 'MUSIC_DIRECTOR') {
      return {
        bpm: 110,
        key_signature: "D Minor",
        time_signature: "4/4",
        energy_level: "High",
        instruments: ["Acoustic Grand Piano", "Synthesizer Lead", "Punchy Drum Stems", "Sub-bass"]
      };
    }

    return "Vocal Execution: Focus on clean diaphragm support, stable pitch centering on sustained notes, and dynamic emotional phrasing.";
  }
}

module.exports = GandharvaModelClient;
