/**
 * Post-Audit Deep Verification: Complete Telugu Song Generation
 * Calls live http://localhost:3000/api/generate-lyrics and inspects the entire output.
 */

const axios = require('axios');

async function verifyTeluguLyrics() {
  console.log('========================================================');
  console.log('📜 POST-AUDIT VERIFICATION: COMPLETE TELUGU SONG LYRICS');
  console.log('========================================================\n');

  const payload = {
    prompt: 'an aspiring musician struggling against poverty and achieving victory',
    language: 'Telugu',
    genre: 'Inspirational',
    mood: 'Victorious'
  };

  console.log('Requesting lyrics from http://localhost:3000/api/generate-lyrics...');
  const t0 = Date.now();

  try {
    const res = await axios.post('http://localhost:3000/api/generate-lyrics', payload);
    const elapsedSec = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`Response received in ${elapsedSec}s. HTTP Status: ${res.status}\n`);

    const data = res.data;
    console.log('Title:', data?.title);
    const variations = data?.variations || [];
    console.log(`Variations Returned: ${variations.length}\n`);

    if (variations.length === 0) {
      console.error('❌ No variations returned in lyrics payload');
      return;
    }

    const var0 = variations[0];
    const rawLyrics = var0.lyrics_text || var0.lyrics || '';
    const lines = rawLyrics.split('\n').filter(l => l.trim().length > 0);

    console.log('----------------- FULL GENERATED LYRICS OUTPUT -----------------');
    console.log(rawLyrics);
    console.log('----------------------------------------------------------------\n');

    // Structural Analysis
    const hasIntro = rawLyrics.includes('ఇంట్రో') || rawLyrics.includes('హుక్') || rawLyrics.includes('Intro');
    const hasPallavi = rawLyrics.includes('పల్లవి') || rawLyrics.includes('Pallavi');
    const hasCharanam1 = rawLyrics.includes('చరణం 1') || rawLyrics.includes('చరణం');
    const hasCharanam2 = rawLyrics.includes('చరణం 2');
    const hasBridge = rawLyrics.includes('వంత') || rawLyrics.includes('బ్రిడ్జ్') || rawLyrics.includes('Bridge');
    const hasOutro = rawLyrics.includes('ముగింపు') || rawLyrics.includes('అవుట్రో') || rawLyrics.includes('Outro');

    const teluguChars = (rawLyrics.match(/[\u0C00-\u0C7F]/g) || []).length;
    const totalChars = rawLyrics.length;
    const teluguPercent = ((teluguChars / totalChars) * 100).toFixed(1);

    console.log('--- Lyrical Quality & Structural Inspection ---');
    console.log(`Total Non-Empty Lines: ${lines.length}`);
    console.log(`Telugu Script Ratio: ${teluguPercent}% (${teluguChars} characters)`);
    console.log(`Section [Intro / Hook]: ${hasIntro ? '✅ PRESENT' : '❌ MISSING'}`);
    console.log(`Section [Pallavi / Main Hook]: ${hasPallavi ? '✅ PRESENT' : '❌ MISSING'}`);
    console.log(`Section [Charanam 1 / Verse 1]: ${hasCharanam1 ? '✅ PRESENT' : '❌ MISSING'}`);
    console.log(`Section [Charanam 2 / Verse 2]: ${hasCharanam2 ? '✅ PRESENT' : '❌ MISSING'}`);
    console.log(`Section [Bridge / Modulation]: ${hasBridge ? '✅ PRESENT' : '❌ MISSING'}`);
    console.log(`Section [Outro / Resolution]: ${hasOutro ? '✅ PRESENT' : '❌ MISSING'}`);

    const isComplete = lines.length >= 20 && hasIntro && hasPallavi && hasCharanam1;
    console.log(`\nCompleteness Verdict: ${isComplete ? '✅ VERIFIED COMPLETE FULL SONG' : '❌ TRUNCATED'}`);

  } catch (err) {
    console.error('Lyrics generation error:', err.message);
  }
}

verifyTeluguLyrics();
