/**
 * Audio Signal Analyzer for Gandharva Automated QA Suite
 * Analyzes RIFF WAV audio files for technical integrity, metrics, and defects.
 */

const fs = require('fs');
const crypto = require('crypto');

function parseWavFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { error: `File not found: ${filePath}`, exists: false };
  }

  const stats = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);

  // Basic RIFF / WAV validation
  if (buffer.length < 44) {
    return { error: 'File too small to be a valid WAV file (< 44 bytes)', exists: true, sizeBytes: stats.size };
  }

  const riffHeader = buffer.toString('ascii', 0, 4);
  const waveHeader = buffer.toString('ascii', 8, 12);

  if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
    return { 
      error: `Invalid header (Expected RIFF/WAVE, got ${riffHeader}/${waveHeader})`,
      exists: true,
      sizeBytes: stats.size,
      riffHeader,
      waveHeader
    };
  }

  // Parse fmt subchunk
  let offset = 12;
  let audioFormat = 1; // 1 = PCM, 3 = IEEE float
  let numChannels = 1;
  let sampleRate = 32000;
  let bitsPerSample = 16;
  let dataOffset = 44;
  let dataSize = 0;

  while (offset < buffer.length - 8) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    
    if (chunkId === 'fmt ') {
      audioFormat = buffer.readUInt16LE(offset + 8);
      numChannels = buffer.readUInt16LE(offset + 10);
      sampleRate = buffer.readUInt32LE(offset + 12);
      bitsPerSample = buffer.readUInt16LE(offset + 22);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
  }

  if (dataSize === 0) {
    dataSize = buffer.length - dataOffset;
  }

  const bytesPerSample = bitsPerSample / 8;
  const numSamples = Math.floor(dataSize / (bytesPerSample * numChannels));
  const durationSec = sampleRate > 0 ? numSamples / sampleRate : 0;

  // Signal processing & Amplitude measurement (16-bit PCM)
  let peakAmp = 0;
  let sumSquares = 0;
  let clippedSamples = 0;
  let silentSamples = 0;
  const totalAnalyzed = Math.min(numSamples, 500000); // Sample up to 500k samples

  if (bitsPerSample === 16 && buffer.length >= dataOffset + (totalAnalyzed * 2)) {
    for (let i = 0; i < totalAnalyzed; i++) {
      const sampleVal = buffer.readInt16LE(dataOffset + (i * 2));
      const absVal = Math.abs(sampleVal);
      if (absVal > peakAmp) peakAmp = absVal;
      sumSquares += (sampleVal * sampleVal);

      // Check clipping (32760+ on 16-bit)
      if (absVal >= 32760) clippedSamples++;
      if (absVal < 10) silentSamples++;
    }
  }

  const rms = totalAnalyzed > 0 ? Math.sqrt(sumSquares / totalAnalyzed) : 0;
  const peakDbFs = peakAmp > 0 ? 20 * Math.log10(peakAmp / 32768) : -100;
  const rmsDbFs = rms > 0 ? 20 * Math.log10(rms / 32768) : -100;
  const silenceRatio = totalAnalyzed > 0 ? silentSamples / totalAnalyzed : 0;
  const isSilent = silenceRatio > 0.95 || peakAmp < 50;
  const isClipping = clippedSamples > 10;

  // Hashes for duplicate detection
  const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');
  const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');

  return {
    exists: true,
    isValidWav: true,
    sizeBytes: stats.size,
    sizeKb: (stats.size / 1024).toFixed(1),
    audioFormat: audioFormat === 1 ? 'PCM' : (audioFormat === 3 ? 'IEEE Float' : `Format ${audioFormat}`),
    numChannels,
    sampleRate,
    bitsPerSample,
    durationSec: parseFloat(durationSec.toFixed(2)),
    peakDbFs: parseFloat(peakDbFs.toFixed(2)),
    rmsDbFs: parseFloat(rmsDbFs.toFixed(2)),
    isSilent,
    isClipping,
    silenceRatio: parseFloat(silenceRatio.toFixed(3)),
    clippedSamples,
    md5Hash,
    sha256Hash
  };
}

module.exports = {
  parseWavFile
};
