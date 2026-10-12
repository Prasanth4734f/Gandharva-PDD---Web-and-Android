/**
 * Phase 5 Audit: Lyrics Studio Audit (6 Controlled Lyrical Samples)
 * Audits generation completeness, multilingual fidelity, section structure, and line count.
 */

const { generateFullLyrics } = require('../../server/src/services/proceduralLyricsEngine');
const { recordTestResult, recordDefect } = require('../utils/stateManager');

const LYRICS_SAMPLES = [
  {
    id: 'L1',
    title: 'Telugu Motivational Song',
    prompt: 'rising from poverty and hardship to victory in life',
    genre: 'Motivation',
    mood: 'Victorious',
    language: 'Telugu',
    expectedLanguageRegex: /[\u0C00-\u0C7F]/,
    minLines: 20
  },
  {
    id: 'L2',
    title: 'Romantic Song',
    prompt: 'whispering sweet memories under the starlight with true love',
    genre: 'Romantic',
    mood: 'Affectionate',
    language: 'Telugu',
    expectedLanguageRegex: /[\u0C00-\u0C7F]/,
    minLines: 20
  },
  {
    id: 'L3',
    title: 'Sad Song',
    prompt: 'silent heartbreak and loneliness in an empty room',
    genre: 'Melancholic',
    mood: 'Grief & Longing',
    language: 'Telugu',
    expectedLanguageRegex: /[\u0C00-\u0C7F]/,
    minLines: 20
  },
  {
    id: 'L4',
    title: 'Energetic Dance Song',
    prompt: 'mass celebration party beat with college friends',
    genre: 'Dance',
    mood: 'Celebration',
    language: 'Telugu',
    expectedLanguageRegex: /[\u0C00-\u0C7F]/,
    minLines: 20
  },
  {
    id: 'L5',
    title: 'Devotional Song',
    prompt: 'sacred prayer to Lord Shiva with temple bells',
    genre: 'Devotional',
    mood: 'Sacred Peace',
    language: 'Telugu',
    expectedLanguageRegex: /[\u0C00-\u0C7F]/,
    minLines: 20
  },
  {
    id: 'L6',
    title: 'English Cinematic Song',
    prompt: 'a lone traveler crossing the stormy sea towards home',
    genre: 'Cinematic',
    mood: 'Hopeful & Epic',
    language: 'English',
    expectedLanguageRegex: /[A-Za-z]/,
    minLines: 16
  }
];

async function runLyricsStudioAudit(state) {
  console.log('\n======================================================');
  console.log('📝 RUNNING PHASE 5: LYRICS STUDIO AUDIT (6 SAMPLES)');
  console.log('======================================================\n');

  for (const sample of LYRICS_SAMPLES) {
    console.log(`[AUDIT ${sample.id}] "${sample.title}" (${sample.language})`);
    
    const lyricsOutput = generateFullLyrics(sample.prompt, sample.genre, sample.mood, sample.language, 0);
    const lines = (lyricsOutput || '').split('\n').filter(l => l.trim().length > 0);
    const lineCount = lines.length;

    // Check language match
    const languageMatches = sample.expectedLanguageRegex.test(lyricsOutput);

    // Check structural sections
    const hasIntro = lyricsOutput.includes('[') && (lyricsOutput.includes('ఇంట్రో') || lyricsOutput.includes('Intro') || lyricsOutput.includes('హుక్'));
    const hasVerseOrChorus = lyricsOutput.includes('పల్లవి') || lyricsOutput.includes('చరణం') || lyricsOutput.includes('Verse') || lyricsOutput.includes('Chorus');
    const hasOutro = lyricsOutput.includes('ముగింపు') || lyricsOutput.includes('Outro') || lyricsOutput.includes('బ్రిడ్జ్') || lyricsOutput.includes('Bridge');
    const hasCompleteStructure = hasIntro && hasVerseOrChorus;

    // Repetition check (unique lines vs total lines)
    const uniqueLines = new Set(lines.map(l => l.trim()));
    const repetitionRatio = lines.length > 0 ? (lines.length - uniqueLines.size) / lines.length : 0;
    const excessiveRepetition = repetitionRatio > 0.40;

    const testPass = lineCount >= sample.minLines && languageMatches && hasCompleteStructure && !excessiveRepetition;

    recordTestResult(state, 'lyricsStudioAudit', sample.id, {
      sampleId: sample.id,
      title: sample.title,
      language: sample.language,
      genre: sample.genre,
      mood: sample.mood,
      lineCount,
      minRequiredLines: sample.minLines,
      languageMatches,
      hasCompleteStructure,
      excessiveRepetition,
      repetitionRatio: parseFloat(repetitionRatio.toFixed(2)),
      status: testPass ? 'PASSED' : 'FAILED',
      sampleSnippet: lines.slice(0, 5)
    });

    if (!testPass) {
      recordDefect(state, {
        id: `DEFECT-LYRICS-${sample.id}`,
        feature: 'Lyrics Studio',
        severity: 'P1',
        title: `Lyrical output defect for ${sample.title}`,
        actual: `Lines: ${lineCount} (Min: ${sample.minLines}), Struct: ${hasCompleteStructure}, Lang: ${languageMatches}`,
        expected: `Complete ${sample.language} song with > ${sample.minLines} lines and multi-section structure`
      });
    }

    console.log(` -> Result: ${testPass ? '✅ PASSED' : '❌ FAILED'} (Lines: ${lineCount}, Structure: ${hasCompleteStructure}, Lang: ${languageMatches})`);
  }

  console.log('------------------------------------------------------');
  console.log('✅ PHASE 5 AUDIT COMPLETE');
  console.log('------------------------------------------------------\n');
}

module.exports = {
  runLyricsStudioAudit,
  LYRICS_SAMPLES
};
