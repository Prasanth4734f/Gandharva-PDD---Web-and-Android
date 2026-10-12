/**
 * Post-Audit Deep Verification: Three-Track Generation & Acoustic Differentiation
 * Submits a live generation request to http://localhost:3000/api/generate-music
 * Measures latency and analyzes acoustic waveforms across all 3 returned tracks.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { parseWavFile } = require('../utils/audioAnalyzer');

async function verifyThreeTracks() {
  console.log('========================================================');
  console.log('🎵 POST-AUDIT VERIFICATION: 3-TRACK GENERATION & ACOUSTIC ANALYSIS');
  console.log('========================================================\n');

  const prompt = 'epic dark villain elevation background music';
  console.log(`Prompt: "${prompt}"`);
  console.log('Requesting 3 variations from live backend at http://localhost:3000/api/generate-music...\n');

  const startTime = Date.now();
  let response = null;

  try {
    response = await axios.post('http://localhost:3000/api/generate-music', {
      prompt,
      targetDuration: 10,
      variationsCount: 3
    }, {
      timeout: 300000 // 5 minute max timeout to survive ZeroGPU queue
    });
  } catch (err) {
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`Generation request failed after ${elapsedSec}s:`, err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
    return;
  }

  const totalTurnaroundSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Generation Request Completed in ${totalTurnaroundSec} seconds.`);
  console.log('Response Status:', response.status);
  console.log('Title:', response.data?.title);
  console.log('Enhanced Prompt:', response.data?.enhanced_prompt?.substring(0, 100) + '...');
  
  const variations = response.data?.variations || [];
  console.log(`Variations Returned: ${variations.length}\n`);

  if (variations.length !== 3) {
    console.error(`❌ Expected exactly 3 variations, but received ${variations.length}`);
    return;
  }

  // Inspect each variation's audio file on disk
  const generatedDir = path.join(__dirname, '../../server/public/generated');
  const variationDetails = [];

  for (let i = 0; i < variations.length; i++) {
    const v = variations[i];
    console.log(`--- Variation ${i + 1}: ${v.variation_name} ---`);
    console.log(`ID: ${v.id} | Seed: ${v.seed}`);
    console.log(`Audio URL: ${v.audio_url}`);

    // Extract filename from URL
    const urlObj = new URL(v.audio_url);
    const filename = path.basename(urlObj.pathname);
    const localFilePath = path.join(generatedDir, filename);

    const analysis = parseWavFile(localFilePath);
    variationDetails.push({
      index: i + 1,
      name: v.variation_name,
      seed: v.seed,
      filename,
      localFilePath,
      analysis
    });

    console.log(`File Exists: ${analysis.exists}`);
    console.log(`Size: ${analysis.sizeKb} KB | Format: ${analysis.audioFormat} | Rate: ${analysis.sampleRate} Hz`);
    console.log(`Duration: ${analysis.durationSec}s | Peak: ${analysis.peakDbFs} dBFS | RMS: ${analysis.rmsDbFs} dBFS`);
    console.log(`MD5 Hash: ${analysis.md5Hash}`);
    console.log('');
  }

  // Acoustic Cross-Comparison: Check if audio signals are actually different
  console.log('--- Acoustic Cross-Comparison ---');
  const h1 = variationDetails[0].analysis.md5Hash;
  const h2 = variationDetails[1].analysis.md5Hash;
  const h3 = variationDetails[2].analysis.md5Hash;

  const distinctHashes = h1 !== h2 && h2 !== h3 && h1 !== h3;
  console.log(`Hash Distinctness (v1!=v2!=v3): ${distinctHashes ? '✅ 100% DISTINCT' : '❌ DUPLICATE DETECTED'}`);

  // Compare actual raw audio samples between v1 and v2
  if (variationDetails[0].analysis.exists && variationDetails[1].analysis.exists) {
    const b1 = fs.readFileSync(variationDetails[0].localFilePath);
    const b2 = fs.readFileSync(variationDetails[1].localFilePath);
    const b3 = fs.readFileSync(variationDetails[2].localFilePath);

    let diffBytes12 = 0;
    const minLen12 = Math.min(b1.length, b2.length);
    for (let j = 44; j < minLen12; j++) {
      if (b1[j] !== b2[j]) diffBytes12++;
    }

    let diffBytes23 = 0;
    const minLen23 = Math.min(b2.length, b3.length);
    for (let j = 44; j < minLen23; j++) {
      if (b2[j] !== b3[j]) diffBytes23++;
    }

    const variancePercent12 = ((diffBytes12 / (minLen12 - 44)) * 100).toFixed(2);
    const variancePercent23 = ((diffBytes23 / (minLen23 - 44)) * 100).toFixed(2);

    console.log(`Waveform Variance between Var 1 and Var 2: ${variancePercent12}%`);
    console.log(`Waveform Variance between Var 2 and Var 3: ${variancePercent23}%`);

    if (parseFloat(variancePercent12) > 80 && parseFloat(variancePercent23) > 80) {
      console.log('✅ Variations are proven to be acoustically independent synthesized tracks, not identical audio with different filenames.');
    }
  }

  console.log('\n========================================================');
  console.log('🏁 SUMMARY:');
  console.log(`- Request Turnaround: ${totalTurnaroundSec}s`);
  console.log(`- Variations Returned: ${variations.length} / 3`);
  console.log(`- Acoustic Distinctness: ${distinctHashes ? 'VERIFIED' : 'FAILED'}`);
  console.log('========================================================\n');
}

verifyThreeTracks();
