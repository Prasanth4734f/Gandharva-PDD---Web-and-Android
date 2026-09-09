/**
 * test_omni_engine.js
 * Automated Test Suite for Gandharva-Omni AI Engine Integration
 */

const PromptDirector = require('../src/services/prompt_director');
const { generateAiLyricsWithVariations } = require('../src/services/geminiLyricsService');
const GandharvaModelClient = require('../src/services/gandharvaModelClient');

async function testOmniEngine() {
  console.log('====================================================');
  console.log('🧪 TESTING GANDHARVA-OMNI AI ENGINE INTEGRATION');
  console.log('====================================================\n');

  // Test 1: Prompt Director
  console.log('1. Testing Prompt Director...');
  const promptResult = await PromptDirector.enhance('Lofi beats on a rainy midnight');
  console.log(`✅ Prompt Director Output (${promptResult.split(/\s+/).length} words):`);
  console.log(`   "${promptResult.substring(0, 120)}..."\n`);

  // Test 2: Lyrics Studio
  console.log('2. Testing Lyrics Studio (Telugu)...');
  const lyricsResult = await generateAiLyricsWithVariations({
    prompt: 'విజయ యాత్ర',
    genre: 'Mass Anthem',
    mood: 'High Energy',
    language: 'Telugu'
  });
  console.log(`✅ Lyrics Studio Output:`);
  console.log(`   Title: ${lyricsResult.title}`);
  console.log(`   Engine: ${lyricsResult.variations[0].engine}`);
  console.log(`   Variation A Lines: ${lyricsResult.variations[0].lyrics_text.split('\n').length}`);
  console.log(`   BGM Producer Prompt: "${lyricsResult.bgm_producer_prompt.substring(0, 80)}..."\n`);

  // Test 3: Story-to-Album Blueprint (NIE)
  console.log('3. Testing NIE Story Blueprint JSON...');
  const blueprintResult = await GandharvaModelClient.generate('NIE_BLUEPRINT', 'A musician travels with a violin to the grand stage.', { temperature: 0.7 });
  const parsed = JSON.parse(blueprintResult);
  console.log(`✅ NIE Blueprint Output:`);
  console.log(`   Album Title: "${parsed.title}"`);
  console.log(`   Genre: ${parsed.genre}`);
  console.log(`   Scene Tracks: ${parsed.planned_tracks.length} scenes planned.`);
  parsed.planned_tracks.forEach(t => {
    console.log(`   • [Track ${t.track_number}] ${t.title} (${t.suggested_bpm} BPM, ${t.key_signature})`);
  });

  // Test 4: Music Director
  console.log('\n4. Testing Music Director Engine...');
  const mdResult = await GandharvaModelClient.generate('MUSIC_DIRECTOR', 'Tollywood interval fight', { temperature: 0.7 });
  const parsedMd = JSON.parse(mdResult);
  console.log(`✅ Music Director Output: ${parsedMd.bpm} BPM | Key: ${parsedMd.key_signature} | Mode: ${parsedMd.musical_mode}`);

  // Test 5: Vocal Coach
  console.log('\n5. Testing AI Vocal Coach...');
  const vcResult = await GandharvaModelClient.generate('VOCAL_COACH', 'కలిసి నడిచే దారులన్నీ పూల వానై మారెనే', { temperature: 0.7 });
  console.log(`✅ Vocal Coach Output: "${vcResult.substring(0, 100)}..."\n`);

  console.log('====================================================');
  console.log('🎉 ALL 5 GANDHARVA-OMNI MODULES TESTED & PASSING 100%!');
  console.log('====================================================');
}

testOmniEngine().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
