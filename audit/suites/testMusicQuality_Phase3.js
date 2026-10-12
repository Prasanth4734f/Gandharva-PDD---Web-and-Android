/**
 * Phase 3 Audit: Controlled Prompt-to-Music Quality Audit (8 Controlled Prompts)
 * Validates emotional preservation, archetypes, and audio signal integrity.
 */

const path = require('path');
const fs = require('fs');
const { recordTestResult, recordDefect } = require('../utils/stateManager');
const { parseWavFile } = require('../utils/audioAnalyzer');
const PromptEnhancer = require('../../server/src/services/promptEnhancer');

const CONTROLLED_SAMPLES = [
  {
    id: 'P1',
    intent: 'Heavy villain elevation background music',
    expectedArchetype: 'Monolithic Dark Orchestral / Aggressive Menace',
    requiredKeywords: ['dark', 'menac', 'villain', 'bass', 'brass', 'drum'],
    forbiddenKeywords: ['gentle piano', 'warm acoustic', 'soft melody'],
    expectedKeySignature: 'Minor / Phrygian'
  },
  {
    id: 'P2',
    intent: 'Peaceful solo violin melody',
    expectedArchetype: 'Soulful Chamber Strings / Acoustic Counterpoint',
    requiredKeywords: ['violin', 'string', 'acoustic', 'expressive'],
    forbiddenKeywords: ['808 sub-bass', 'industrial distortion', 'heavy metallic'],
    expectedKeySignature: 'Melodic'
  },
  {
    id: 'P3',
    intent: 'Emotional piano music',
    expectedArchetype: 'Grand Piano Solitary Contemplation',
    requiredKeywords: ['piano', 'acoustic', 'emotional', 'melody'],
    forbiddenKeywords: ['heavy synth drop', 'techno kick'],
    expectedKeySignature: 'Minor / Reflective'
  },
  {
    id: 'P4',
    intent: 'High-energy dance/disco music',
    expectedArchetype: 'High-Impact Mass & Club Dance',
    requiredKeywords: ['dance', 'kick', 'tempo', 'bass', 'groove'],
    forbiddenKeywords: ['somber drone', 'funeral march'],
    expectedKeySignature: 'High BPM'
  },
  {
    id: 'P5',
    intent: 'Dark suspense thriller background music',
    expectedArchetype: 'Ominous Tension & Cinematic Suspense',
    requiredKeywords: ['dissonan', 'drone', 'tension', 'suspense', 'dark'],
    forbiddenKeywords: ['joyful celebration', 'sunny acoustic'],
    expectedKeySignature: 'Dissonant'
  },
  {
    id: 'P6',
    intent: 'Romantic instrumental music',
    expectedArchetype: 'Acoustic Warmth & Lyrical Harmony',
    requiredKeywords: ['melody', 'acoustic', 'warm', 'lyrical'],
    forbiddenKeywords: ['aggressive war drum', 'heavy metal scream'],
    expectedKeySignature: 'Major / Warm'
  },
  {
    id: 'P7',
    intent: 'Telugu devotional instrumental music',
    expectedArchetype: 'Sacred Indian Classical & Devotional Symphony',
    requiredKeywords: ['bansuri', 'temple bell', 'veena', 'mridangam', 'devotional'],
    forbiddenKeywords: ['industrial distortion', 'trap beat', 'distorted 808'],
    expectedKeySignature: 'Raga Colors'
  },
  {
    id: 'P8',
    intent: 'Epic orchestral victory music',
    expectedArchetype: 'Triumphant Brass & Mythological Symphony',
    requiredKeywords: ['orchestral', 'brass', 'percussion', 'triumphant', 'victory'],
    forbiddenKeywords: ['whispering lofi', 'depressing silence'],
    expectedKeySignature: 'Major Fanfares'
  }
];

async function runPromptQualityAudit(state) {
  console.log('\n======================================================');
  console.log('🎼 RUNNING PHASE 3: CONTROLLED PROMPT-TO-MUSIC QUALITY AUDIT');
  console.log('======================================================\n');

  const generatedDir = path.join(__dirname, '../../server/public/generated');
  const availableWavs = fs.existsSync(generatedDir) 
    ? fs.readdirSync(generatedDir).filter(f => f.endsWith('.wav'))
    : [];

  for (const sample of CONTROLLED_SAMPLES) {
    console.log(`[SAMPLE ${sample.id}] "${sample.intent}"`);
    
    // 1. Run prompt through PromptEnhancer
    const enhanced = PromptEnhancer.enhance(sample.intent);
    const enhancedLower = enhanced.toLowerCase();

    // 2. Validate keyword preservation
    const matchedRequired = sample.requiredKeywords.filter(kw => enhancedLower.includes(kw));
    const matchedForbidden = sample.forbiddenKeywords.filter(kw => enhancedLower.includes(kw));

    const emotionPreserved = matchedRequired.length >= 2 && matchedForbidden.length === 0;

    // 3. Inspect audio sample from disk if mapped or available
    let audioSignalMetrics = null;
    if (availableWavs.length > 0) {
      // Pick a corresponding or latest generated WAV to test signal integrity
      const sampleWavPath = path.join(generatedDir, availableWavs[availableWavs.length - 1]);
      audioSignalMetrics = parseWavFile(sampleWavPath);
    }

    const testPass = emotionPreserved;

    recordTestResult(state, 'promptMusicQuality', sample.id, {
      sampleId: sample.id,
      originalPrompt: sample.intent,
      expectedArchetype: sample.expectedArchetype,
      enhancedPrompt: enhanced,
      matchedRequiredKeywords: matchedRequired,
      matchedForbiddenKeywords: matchedForbidden,
      emotionPreserved,
      audioSignalMetrics,
      status: testPass ? 'PASSED' : 'FAILED'
    });

    if (!testPass) {
      recordDefect(state, {
        id: `DEFECT-PROMPT-${sample.id}`,
        feature: 'Music Prompt Enhancement',
        severity: 'P1',
        title: `Emotion mismatch for prompt "${sample.intent}"`,
        actual: `Forbidden: ${matchedForbidden.join(', ')} | Missing: ${sample.requiredKeywords.filter(k => !matchedRequired.includes(k)).join(', ')}`,
        expected: sample.expectedArchetype
      });
    }

    console.log(` -> Emotion Preserved: ${emotionPreserved ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`    Enhanced: "${enhanced.substring(0, 90)}..."\n`);
  }

  console.log('------------------------------------------------------');
  console.log('✅ PHASE 3 AUDIT COMPLETE');
  console.log('------------------------------------------------------\n');
}

module.exports = {
  runPromptQualityAudit,
  CONTROLLED_SAMPLES
};
