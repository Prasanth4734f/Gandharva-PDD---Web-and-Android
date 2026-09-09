const GandharvaModelClient = require('./gandharvaModelClient');
const { validateLyrics } = require('../utils/lyricsValidator');

/**
 * Call Gandharva-Omni AI Engine for rapid multilingual songwriting
 */
async function callGeminiPrompt(systemPrompt, userPrompt, temperature = 0.85) {
  try {
    const omniResult = await GandharvaModelClient.generate('LYRICS_STUDIO', {
      topic: userPrompt,
      system_instructions: systemPrompt
    }, { temperature });

    if (omniResult && typeof omniResult === 'string' && omniResult.trim().length > 30) {
      return omniResult.trim();
    }
  } catch (err) {
    console.warn(`[Gandharva-Omni Lyrics Engine] Note: ${err.message}. Cascading to procedural engine...`);
  }

// Fallback to Gandharva Procedural Studio
  return GandharvaModelClient._proceduralFallback('LYRICS_STUDIO', userPrompt, { temperature });
}

/**
 * Generate 2 unique, full-length non-repeating variations + BGM prompt via Gandharva AI Engine
 */
async function generateAiLyricsWithVariations({ prompt, genre = 'Pop', mood = 'Inspiring', language = 'Telugu' }) {
  const cleanTopic = (prompt || 'Love and Life').trim();

  // Run in parallel for ultra-fast generation
  const [lyricsA, lyricsB, bgmText] = await Promise.all([
    GandharvaModelClient.generate('LYRICS_STUDIO', {
      topic: `${cleanTopic} (Soulful Poetic Melody)`,
      mood,
      genre,
      language
    }, { language, temperature: 0.82 }),

    GandharvaModelClient.generate('LYRICS_STUDIO', {
      topic: `${cleanTopic} (High Energy Rhythmic Catchy)`,
      mood,
      genre,
      language
    }, { language, temperature: 0.95 }),

    GandharvaModelClient.generate('PROMPT_DIRECTOR', `Master instrumental arrangement for a ${genre} ${mood} song titled "${cleanTopic}".`, { temperature: 0.7 })
  ]);

  // Validate quality, structure, and language script
  const valA = validateLyrics(lyricsA, language);
  const valB = validateLyrics(lyricsB, language);
  return {
    project_id: `gandharva-ai-${Date.now()}`,
    title: `${mood} ${genre}: ${cleanTopic.substring(0, 24)}`,
    variations: [
      {
        id: `gandharva-var-A-${Date.now()}`,
        version_name: 'Variation A',
        title: `${cleanTopic} - Variation A (Soulful Poetic)`,
        lyrics_text: valA.cleanedText || lyricsA,
        engine: 'Gandharva-Omni AI Engine',
        fallback_used: !valA.isValid
      },
      {
        id: `gandharva-var-B-${Date.now()}`,
        version_name: 'Variation B',
        title: `${cleanTopic} - Variation B (Rhythmic Dynamic)`,
        lyrics_text: valB.cleanedText || lyricsB,
        engine: 'Gandharva-Omni AI Engine',
        fallback_used: !valB.isValid
      },
      {
        id: `gandharva-var-bgm-${Date.now()}`,
        version_name: '🎶 BGM Prompt',
        title: `${cleanTopic} - AI BGM Arrangement`,
        lyrics_text: bgmText || `Master ${genre} instrumental arrangement with ${mood} atmosphere. 120 BPM, Key of C Major.`,
        engine: 'Gandharva AI BGM Prompt Engine',
        fallback_used: false
      }
    ],
    bgm_producer_prompt: bgmText || `Master ${genre} instrumental arrangement with ${mood} atmosphere. 120 BPM, Key of C Major.`,
    success: true,
    source: 'Gandharva-Omni AI Engine'
  };
}

module.exports = {
  generateAiLyricsWithVariations
};
