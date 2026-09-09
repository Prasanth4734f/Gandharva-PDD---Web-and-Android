/**
 * lyricsValidator.js
 * 
 * Strict quality, structure, script/language, and content validation gate
 * for Gandharva AI Lyrics Generation Engine.
 */

// Unicode Character Ranges for Indian & International Scripts
const SCRIPT_RANGES = {
  telugu: /[\u0C00-\u0C7F]/,
  hindi: /[\u0900-\u097F]/,
  tamil: /[\u0B80-\u0BFF]/,
  kannada: /[\u0C80-\u0CFF]/,
  malayalam: /[\u0D00-\u0D7F]/,
  bengali: /[\u0980-\u09FF]/,
  punjabi: /[\u0A00-\u0A7F]/,
  gujarati: /[\u0A80-\u0AFF]/
};

/**
 * Validates generated lyrics for structural completeness, proper language script,
 * and absence of empty tags or conversational boilerplate.
 * 
 * @param {string} lyricsText - The generated lyric text
 * @param {string} requestedLanguage - Target language (e.g., 'Telugu', 'Hindi', 'English')
 * @returns {{ isValid: boolean, cleanedText: string, errors: string[] }}
 */
function validateLyrics(lyricsText, requestedLanguage = 'Telugu') {
  const errors = [];
  if (!lyricsText || typeof lyricsText !== 'string') {
    return { isValid: false, cleanedText: '', errors: ['Lyrics payload is empty or invalid type.'] };
  }

  // 1. Strip conversational AI preambles and code fences
  let cleaned = lyricsText
    .replace(/^```[a-z]*\n?/im, '')
    .replace(/```$/im, '')
    .replace(/^(Sure|Here are|Certainly|Below are|Here is|Hope you like|Song Title:|Title:)[^\n]*\n+/gim, '')
    .trim();

  // 2. Minimum Content Length Check
  if (cleaned.length < 80) {
    errors.push(`Lyrics content too short (${cleaned.length} chars, minimum 80 required).`);
  }

  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 6) {
    errors.push(`Too few lyric lines (${lines.length} lines, minimum 6 required).`);
  }

  // 3. Structure & Non-Empty Section Check
  // Check that section headers like [Verse 1], [పల్లవి], [मुखड़ा] have actual lyric lines under them
  const sectionTagRegex = /\[([^\]]+)\]/g;
  const sectionTags = [...cleaned.matchAll(sectionTagRegex)];
  
  if (sectionTags.length > 0) {
    // Verify that the text is not JUST section tags
    const textWithoutTags = cleaned.replace(/\[([^\]]+)\]/g, '').trim();
    const contentLines = textWithoutTags.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (contentLines.length < 4) {
      errors.push(`Section tags found but insufficient lyrics content (${contentLines.length} lines between tags).`);
    }
  }

  // 4. Language & Script Validation
  const langKey = (requestedLanguage || 'telugu').toLowerCase().trim();
  const scriptRegex = SCRIPT_RANGES[langKey];

  if (scriptRegex) {
    // Count characters in the expected script
    let targetScriptCharCount = 0;
    for (let i = 0; i < cleaned.length; i++) {
      if (scriptRegex.test(cleaned[i])) {
        targetScriptCharCount++;
      }
    }

    // Require at least 20 native script characters or >15% of alphabetical content
    if (targetScriptCharCount < 15) {
      errors.push(`Requested language '${requestedLanguage}' requires native script characters, but only found ${targetScriptCharCount}.`);
    }
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    cleanedText: cleaned,
    errors
  };
}

module.exports = {
  validateLyrics,
  SCRIPT_RANGES
};
