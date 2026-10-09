const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { supabase } = require('./supabase');
const { createSyntheticWavBuffer } = require('./syntheticAudioEngine');

const DEFAULT_HF_GPU_URL = 'https://prasanthm4734f-gandharva-omni-model.hf.space';

// Track last successful GPU contact timestamp (0 = initial cold state)
let lastGpuContactTime = 0;

const getLastGpuContactTime = () => lastGpuContactTime;
const recordGpuSuccess = () => { lastGpuContactTime = Date.now(); };
const recordGpuFailure = () => { 
  lastGpuContactTime = 0; 
  invalidateGpuUrlCache(); 
};

// ============================================================
// DYNAMIC GPU URL RESOLVER (Supabase Registry + Cache + HF Space + Fallback)
// ============================================================
let _cachedGpuUrl = null;
let _cachedGpuUrlTimestamp = 0;
const GPU_URL_CACHE_TTL_MS = 20000; // Cache for 20 seconds

const getActiveGpuUrl = async () => {
  // 1. Check in-memory cache
  if (_cachedGpuUrl && (Date.now() - _cachedGpuUrlTimestamp) < GPU_URL_CACHE_TTL_MS) {
    return _cachedGpuUrl;
  }

  // 2. Query Supabase gpu_registry for the latest live heartbeat
  try {
    const { data, error } = await supabase
      .from('gpu_registry')
      .select('ngrok_url, status, updated_at')
      .eq('id', 'kaggle-primary')
      .single();

    if (!error && data && data.ngrok_url && data.ngrok_url !== 'none') {
      const updatedAt = new Date(data.updated_at).getTime();
      const isFresh = (Date.now() - updatedAt) < 90000;

      if (data.status === 'online' && isFresh) {
        _cachedGpuUrl = data.ngrok_url.replace(/\/$/, '');
        _cachedGpuUrlTimestamp = Date.now();
        logger.info(`[GPU Registry] Resolved live URL from Supabase: ${_cachedGpuUrl}`);
        return _cachedGpuUrl;
      }
    }
  } catch (supaErr) {
    logger.warn(`[GPU Registry] Supabase query notice: ${supaErr.message}`);
  }

  // 3. Check .env value
  const envUrl = process.env.AI_ENGINE_URL || process.env.MUSICGEN_API_URL || process.env.MAGIC_BOX_API_URL;
  if (envUrl && !envUrl.includes('your-url-here')) {
    _cachedGpuUrl = envUrl.replace(/\/$/, '');
    _cachedGpuUrlTimestamp = Date.now();
    return _cachedGpuUrl;
  }

  // 4. Default to live Gandharva Hugging Face Space
  _cachedGpuUrl = DEFAULT_HF_GPU_URL;
  _cachedGpuUrlTimestamp = Date.now();
  return _cachedGpuUrl;
};

const invalidateGpuUrlCache = () => {
  _cachedGpuUrl = null;
  _cachedGpuUrlTimestamp = 0;
};

const probeGpuHealth = async (url) => {
  try {
    const probe = await axios.get(`${url}/musicgen-health`, {
      timeout: 3000,
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    return probe.status === 200;
  } catch (e) {
    try {
      const probe2 = await axios.get(`${url}/`, {
        timeout: 3000,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      return probe2.status < 400;
    } catch (e2) {
      return false;
    }
  }
};

/**
 * AI Generation Service - Standard Prompt to Music (MusicGen / Gradio 5 ZeroGPU / DSP Fallback)
 */
const generateCinematicMusic = async (userPrompt, duration = 10, variationIndex = 0) => {
  const targetDuration = Math.min(30, Math.max(5, parseInt(duration) || 10));
  const filename = `gen_${Date.now()}_${variationIndex}_${Math.floor(Math.random() * 1000)}.wav`;
  const localDir = path.join(__dirname, '../../public/generated');
  
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  const localPath = path.join(localDir, filename);
  const randomSeed = Math.floor(Math.random() * 2147483647);
  const enhancedPrompt = `${userPrompt}, variation ${variationIndex + 1}, studio master audio`;

  // Step 1: Try Remote GPU
  try {
    const AI_ENGINE_URL = await getActiveGpuUrl();
    if (AI_ENGINE_URL) {
      // Try Gradio 5 Call API first
      try {
        const callResp = await axios.post(`${AI_ENGINE_URL}/gradio_api/call/generate_music`, {
          data: [enhancedPrompt, targetDuration]
        }, {
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          timeout: 45000
        });

        if (callResp.data && callResp.data.event_id) {
          const eventId = callResp.data.event_id;
          const streamResp = await axios.get(`${AI_ENGINE_URL}/gradio_api/call/generate_music/${eventId}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
            timeout: 60000
          });

          const lines = (streamResp.data || '').split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.replace(/^data:\s*/, '').trim();
              if (jsonStr && jsonStr !== 'null') {
                const dataArr = JSON.parse(jsonStr);
                const fileObj = Array.isArray(dataArr) ? dataArr[0] : dataArr;
                let fileUrl = fileObj?.path 
                  ? `${AI_ENGINE_URL}/gradio_api/file=${fileObj.path}`
                  : (fileObj?.url ? fileObj.url.replace('/gradio_a/gradio_api/', '/gradio_api/') : null);
                if (fileUrl && fileUrl.startsWith('/')) fileUrl = `${AI_ENGINE_URL}${fileUrl}`;

                if (fileUrl) {
                  const down = await axios.get(fileUrl, {
                    responseType: 'arraybuffer',
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                  });
                  if (down.data && down.data.length > 1024) {
                    fs.writeFileSync(localPath, Buffer.from(down.data));
                    recordGpuSuccess();
                    return {
                      success: true,
                      filename,
                      promptUsed: enhancedPrompt,
                      seed: randomSeed,
                      source: 'Gradio 5 ZeroGPU'
                    };
                  }
                }
              }
            }
          }
        }
      } catch (gErr) {
        logger.warn(`[Gradio 5 ZeroGPU Notice] ${gErr.message}`);
      }

      // Try Direct REST API
      try {
        const response = await axios.post(`${AI_ENGINE_URL}/generate`, {
          prompt: enhancedPrompt,
          duration: targetDuration,
          seed: randomSeed
        }, {
          timeout: 45000,
          responseType: 'arraybuffer',
          headers: {
            'ngrok-skip-browser-warning': '69420',
            'User-Agent': 'Mozilla/5.0'
          }
        });

        if (response.data && response.data.length > 10240) {
          fs.writeFileSync(localPath, Buffer.from(response.data));
          recordGpuSuccess();
          return {
            success: true,
            filename,
            promptUsed: enhancedPrompt,
            seed: randomSeed,
            source: 'Gandharva Kaggle GPU'
          };
        }
      } catch (rErr) {
        logger.warn(`[Direct REST Notice] ${rErr.message}`);
      }
    }
  } catch (gpuErr) {
    logger.warn(`[AI Engine Remote Note] ${gpuErr.message}`);
  }

  // Step 2: High-Fidelity Prompt-Seeded Procedural DSP Synthesizer
  logger.info(`[Gandharva DSP Engine] Synthesizing custom studio audio for: "${userPrompt}" (Variation ${variationIndex + 1})`);
  const dspBuffer = createSyntheticWavBuffer({
    actIndex: variationIndex,
    variationIndex: variationIndex,
    durationSec: targetDuration,
    genre: userPrompt,
    story: userPrompt
  });

  fs.writeFileSync(localPath, dspBuffer);
  return {
    success: true,
    filename,
    promptUsed: enhancedPrompt,
    seed: randomSeed,
    source: 'Gandharva Studio DSP Synthesizer'
  };
};

/**
 * ACE-Step 8.0 AI Generation Engine for Story-to-Album & Cinematic BGMs
 * Connects the Story-to-Album pipeline to GPU and Procedural DSP Engine.
 */
const generateAceStepMusic = async (acePrompt, duration = 10, variationIndex = 0) => {
  const targetDuration = Math.min(30, Math.max(5, parseInt(duration) || 10));
  const filename = `ace_${Date.now()}_${variationIndex}_${Math.floor(Math.random() * 1000)}.wav`;
  const localDir = path.join(__dirname, '../../public/generated');
  
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  const localPath = path.join(localDir, filename);
  const randomSeed = Math.floor(Math.random() * 2147483647);

  try {
    const AI_ENGINE_URL = await getActiveGpuUrl();
    if (AI_ENGINE_URL) {
      try {
        const response = await axios.post(`${AI_ENGINE_URL}/generate_ace`, {
          prompt: acePrompt,
          duration: targetDuration,
          seed: randomSeed
        }, {
          timeout: 45000,
          responseType: 'arraybuffer',
          headers: { 'ngrok-skip-browser-warning': '69420', 'User-Agent': 'Mozilla/5.0' }
        });

        if (response.data && response.data.length > 10240) {
          fs.writeFileSync(localPath, Buffer.from(response.data));
          recordGpuSuccess();
          return {
            success: true,
            filename,
            promptUsed: acePrompt,
            seed: randomSeed,
            source: 'ACE-Step GPU'
          };
        }
      } catch (_) {}
    }
  } catch (_) {}

  // Fallback to prompt-tailored DSP synthesis
  logger.info(`[ACE-Step DSP Engine] Synthesizing custom story BGM for: "${acePrompt.substring(0, 60)}..."`);
  const dspBuffer = createSyntheticWavBuffer({
    actIndex: variationIndex,
    variationIndex: variationIndex,
    durationSec: targetDuration,
    genre: acePrompt,
    story: acePrompt
  });

  fs.writeFileSync(localPath, dspBuffer);
  return {
    success: true,
    filename,
    promptUsed: acePrompt,
    seed: randomSeed,
    source: 'Gandharva ACE DSP Synthesizer'
  };
};

module.exports = { generateCinematicMusic, generateAceStepMusic, getLastGpuContactTime, recordGpuSuccess, recordGpuFailure, getActiveGpuUrl, invalidateGpuUrlCache };
