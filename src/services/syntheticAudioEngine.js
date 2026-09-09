/**
 * Gandharva High-Fidelity Synthetic Audio Engine
 * Generates rich, distinct, multi-instrument audio (Chords, Basslines, Melodies, Percussion)
 * Works 100% client-side with 0 network latency, producing real 16-bit PCM WAV audio.
 */

// Note Frequency Table (Hz)
const NOTE_FREQS = {
  C2: 65.41, Cs2: 69.30, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, Ab2: 103.83, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Ab5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
  C6: 1046.50
};

// Act Themes for Multi-Act Story Albums
export const ACT_THEMES = [
  // Act 1: Atmospheric Mystery & Suspense (D Minor, 84 BPM)
  {
    name: 'Act 1: Suspenseful Prelude',
    root: NOTE_FREQS.D2,
    bpm: 84,
    scaleType: 'minor',
    chords: [
      [NOTE_FREQS.D3, NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.D4],
      [NOTE_FREQS.Bb2, NOTE_FREQS.D3, NOTE_FREQS.F3, NOTE_FREQS.Bb3],
      [NOTE_FREQS.G2, NOTE_FREQS.Bb2, NOTE_FREQS.D3, NOTE_FREQS.G3],
      [NOTE_FREQS.A2, NOTE_FREQS.Cs3, NOTE_FREQS.E3, NOTE_FREQS.A3]
    ],
    melodyA: [NOTE_FREQS.D4, NOTE_FREQS.F4, NOTE_FREQS.E4, NOTE_FREQS.D4, NOTE_FREQS.A4, NOTE_FREQS.G4, NOTE_FREQS.F4, NOTE_FREQS.E4, NOTE_FREQS.D4],
    melodyB: [NOTE_FREQS.D4, NOTE_FREQS.A4, NOTE_FREQS.F4, NOTE_FREQS.D5, NOTE_FREQS.Cs5, NOTE_FREQS.Bb4, NOTE_FREQS.A4, NOTE_FREQS.F4, NOTE_FREQS.D4]
  },
  // Act 2: Tense Investigation & Rising Momentum (G Minor, 98 BPM)
  {
    name: 'Act 2: Tense Investigation',
    root: NOTE_FREQS.G2,
    bpm: 98,
    scaleType: 'minor',
    chords: [
      [NOTE_FREQS.G3, NOTE_FREQS.Bb3, NOTE_FREQS.D4, NOTE_FREQS.G4],
      [NOTE_FREQS.Eb3, NOTE_FREQS.G3, NOTE_FREQS.Bb3, NOTE_FREQS.Eb4],
      [NOTE_FREQS.C3, NOTE_FREQS.Eb3, NOTE_FREQS.G3, NOTE_FREQS.C4],
      [NOTE_FREQS.D3, NOTE_FREQS.Fs3, NOTE_FREQS.A3, NOTE_FREQS.D4]
    ],
    melodyA: [NOTE_FREQS.G4, NOTE_FREQS.Bb4, NOTE_FREQS.D5, NOTE_FREQS.C5, NOTE_FREQS.Bb4, NOTE_FREQS.A4, NOTE_FREQS.G4, NOTE_FREQS.Fs4, NOTE_FREQS.G4],
    melodyB: [NOTE_FREQS.G4, NOTE_FREQS.D5, NOTE_FREQS.Eb5, NOTE_FREQS.D5, NOTE_FREQS.C5, NOTE_FREQS.Bb4, NOTE_FREQS.C5, NOTE_FREQS.D5, NOTE_FREQS.G4]
  },
  // Act 3: Fast-Paced Climax & Pursuit (A Minor, 126 BPM)
  {
    name: 'Act 3: The Climax',
    root: NOTE_FREQS.A2,
    bpm: 126,
    scaleType: 'minor',
    chords: [
      [NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.E4, NOTE_FREQS.A4],
      [NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.F4],
      [NOTE_FREQS.D3, NOTE_FREQS.F3, NOTE_FREQS.A3, NOTE_FREQS.D4],
      [NOTE_FREQS.E3, NOTE_FREQS.Ab3, NOTE_FREQS.B3, NOTE_FREQS.E4]
    ],
    melodyA: [NOTE_FREQS.A4, NOTE_FREQS.E5, NOTE_FREQS.D5, NOTE_FREQS.C5, NOTE_FREQS.B4, NOTE_FREQS.C5, NOTE_FREQS.D5, NOTE_FREQS.E5, NOTE_FREQS.A4],
    melodyB: [NOTE_FREQS.A4, NOTE_FREQS.C5, NOTE_FREQS.E5, NOTE_FREQS.A5, NOTE_FREQS.G5, NOTE_FREQS.F5, NOTE_FREQS.E5, NOTE_FREQS.D5, NOTE_FREQS.A4]
  },
  // Act 4: Emotional Revelation & Heartfelt Peak (C Minor / Ab Major, 88 BPM)
  {
    name: 'Act 4: Revelation',
    root: NOTE_FREQS.C2,
    bpm: 88,
    scaleType: 'minor',
    chords: [
      [NOTE_FREQS.C3, NOTE_FREQS.Eb3, NOTE_FREQS.G3, NOTE_FREQS.C4],
      [NOTE_FREQS.Ab2, NOTE_FREQS.C3, NOTE_FREQS.Eb3, NOTE_FREQS.Ab3],
      [NOTE_FREQS.F2, NOTE_FREQS.Ab2, NOTE_FREQS.C3, NOTE_FREQS.F3],
      [NOTE_FREQS.G2, NOTE_FREQS.B2, NOTE_FREQS.D3, NOTE_FREQS.G3]
    ],
    melodyA: [NOTE_FREQS.Eb4, NOTE_FREQS.G4, NOTE_FREQS.C5, NOTE_FREQS.Bb4, NOTE_FREQS.Ab4, NOTE_FREQS.G4, NOTE_FREQS.F4, NOTE_FREQS.Eb4, NOTE_FREQS.D4],
    melodyB: [NOTE_FREQS.C4, NOTE_FREQS.Eb4, NOTE_FREQS.G4, NOTE_FREQS.Bb4, NOTE_FREQS.C5, NOTE_FREQS.Eb5, NOTE_FREQS.D5, NOTE_FREQS.C5, NOTE_FREQS.G4]
  },
  // Act 5: Radiant Epilogue & Dawn Resolution (D Major, 80 BPM)
  {
    name: 'Act 5: Triumphant Epilogue',
    root: NOTE_FREQS.D2,
    bpm: 80,
    scaleType: 'major',
    chords: [
      [NOTE_FREQS.D3, NOTE_FREQS.Fs3, NOTE_FREQS.A3, NOTE_FREQS.D4],
      [NOTE_FREQS.G2, NOTE_FREQS.B2, NOTE_FREQS.D3, NOTE_FREQS.G3],
      [NOTE_FREQS.A2, NOTE_FREQS.Cs3, NOTE_FREQS.E3, NOTE_FREQS.A3],
      [NOTE_FREQS.D3, NOTE_FREQS.Fs3, NOTE_FREQS.A3, NOTE_FREQS.D4]
    ],
    melodyA: [NOTE_FREQS.Fs4, NOTE_FREQS.A4, NOTE_FREQS.D5, NOTE_FREQS.Cs5, NOTE_FREQS.B4, NOTE_FREQS.A4, NOTE_FREQS.G4, NOTE_FREQS.Fs4, NOTE_FREQS.D4],
    melodyB: [NOTE_FREQS.D4, NOTE_FREQS.Fs4, NOTE_FREQS.A4, NOTE_FREQS.D5, NOTE_FREQS.E5, NOTE_FREQS.Fs5, NOTE_FREQS.E5, NOTE_FREQS.D5, NOTE_FREQS.A4]
  }
];

/**
 * Synthesizes a real 16-bit PCM WAV ArrayBuffer mathematically
 */
export const createSyntheticWavBuffer = ({
  actIndex = 0,
  variationIndex = 0,
  bpm = 90,
  durationSec = 8
}) => {
  const sampleRate = 44100;
  const numChannels = 2;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const theme = ACT_THEMES[actIndex % ACT_THEMES.length];
  const isVarB = Number(variationIndex) === 1;
  const targetBpm = bpm || theme.bpm;
  const beatSec = 60 / targetBpm;

  // Float buffers for left and right channels
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  // Helper tone generator with envelopes
  const renderTone = (freq, startSec, durSec, gain, oscType, channelPan = 0) => {
    const startSample = Math.floor(startSec * sampleRate);
    const numSamp = Math.floor(durSec * sampleRate);
    const endSample = Math.min(totalSamples, startSample + numSamp);

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / sampleRate;
      const progress = t / durSec;

      // ADSR Envelope
      let env = 1.0;
      if (progress < 0.08) {
        env = progress / 0.08;
      } else if (progress > 0.7) {
        env = Math.max(0, 1.0 - (progress - 0.7) / 0.3);
      }

      // Waveform
      let sample = 0;
      const phase = 2 * Math.PI * freq * t;
      if (oscType === 'sine') {
        sample = Math.sin(phase);
      } else if (oscType === 'triangle') {
        sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
      } else if (oscType === 'sawtooth') {
        sample = 2 * ((freq * t) % 1) - 1;
      } else if (oscType === 'square') {
        sample = Math.sin(phase) >= 0 ? 0.7 : -0.7;
      }

      const val = sample * gain * env;
      const panL = 0.5 * (1 - channelPan);
      const panR = 0.5 * (1 + channelPan);

      left[i] += val * panL;
      right[i] += val * panR;
    }
  };

  // Helper Percussion Hit
  const renderDrumHit = (startSec, type = 'kick') => {
    const startSample = Math.floor(startSec * sampleRate);
    const durSec = type === 'kick' ? 0.25 : type === 'snare' ? 0.2 : 0.08;
    const numSamp = Math.floor(durSec * sampleRate);
    const endSample = Math.min(totalSamples, startSample + numSamp);

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / sampleRate;
      let val = 0;
      if (type === 'kick') {
        const kickFreq = 130 * Math.exp(-t * 28) + 42;
        val = Math.sin(2 * Math.PI * kickFreq * t) * Math.exp(-t * 14) * 0.45;
      } else if (type === 'snare') {
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 22) * 0.3;
        const tone = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 20) * 0.2;
        val = noise + tone;
      } else if (type === 'hihat') {
        val = (Math.random() * 2 - 1) * Math.exp(-t * 45) * 0.15;
      }

      left[i] += val * 0.5;
      right[i] += val * 0.5;
    }
  };

  // 1. Bassline Drone / Rhythm
  const bassFreq = theme.root;
  const bassOscType = isVarB ? 'sawtooth' : 'sine';
  renderTone(bassFreq, 0, durationSec * 0.95, isVarB ? 0.22 : 0.35, bassOscType, 0);

  // 2. Chords & Pad Harmonies
  theme.chords.forEach((chord, chordIdx) => {
    const chordStart = chordIdx * (beatSec * 2);
    if (chordStart < durationSec) {
      chord.forEach((note, noteIdx) => {
        const pan = (noteIdx % 2 === 0 ? -0.35 : 0.35);
        renderTone(note, chordStart, beatSec * 1.95, isVarB ? 0.12 : 0.16, isVarB ? 'sawtooth' : 'triangle', pan);
      });
    }
  });

  // 3. Melodic Solo Lead Lines
  const activeMelody = isVarB ? theme.melodyB : theme.melodyA;
  activeMelody.forEach((melNote, melIdx) => {
    const melStart = melIdx * (beatSec * 0.82);
    if (melStart < durationSec) {
      renderTone(melNote, melStart, beatSec * 0.78, isVarB ? 0.18 : 0.24, isVarB ? 'square' : 'triangle', 0.1);
    }
  });

  // 4. Percussion Beats (Kick, Snare, Hihat)
  const numBeats = Math.floor(durationSec / beatSec);
  for (let b = 0; b < numBeats; b++) {
    const beatTime = b * beatSec;
    // Kick on beat 0 and 2
    if (b % 2 === 0) {
      renderDrumHit(beatTime, 'kick');
    }
    // Snare on beat 1 and 3
    if (b % 2 === 1) {
      renderDrumHit(beatTime, 'snare');
    }
    // Hi-hats every 8th note
    renderDrumHit(beatTime, 'hihat');
    if (beatTime + beatSec * 0.5 < durationSec) {
      renderDrumHit(beatTime + beatSec * 0.5, 'hihat');
    }
  }

  // Build Standard 44-byte RIFF 16-bit PCM WAV Header
  const bytesPerSample = 2;
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // ByteRate
  view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write Interleaved 16-bit PCM Audio Samples
  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    // Left Channel Clamp
    const lSamp = Math.max(-1, Math.min(1, left[i]));
    const lInt = lSamp < 0 ? lSamp * 0x8000 : lSamp * 0x7FFF;
    view.setInt16(offset, lInt, true);
    offset += 2;

    // Right Channel Clamp
    const rSamp = Math.max(-1, Math.min(1, right[i]));
    const rInt = rSamp < 0 ? rSamp * 0x8000 : rSamp * 0x7FFF;
    view.setInt16(offset, rInt, true);
    offset += 2;
  }

  return arrayBuffer;
};

/**
 * Creates an in-memory Blob URL or Data URI for instant playback and downloads
 */
export const getSyntheticWavUri = (options) => {
  const wavBuffer = createSyntheticWavBuffer(options);
  if (typeof window !== 'undefined' && window.Blob && window.URL && window.URL.createObjectURL) {
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return window.URL.createObjectURL(blob);
  }

  // Base64 Data URI Fallback
  const bytes = new Uint8Array(wavBuffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa !== 'undefined' ? btoa(binary) : '';
  return `data:audio/wav;base64,${base64}`;
};

/**
 * Real-time Web Audio Synthesizer with immediate instant sound feedback
 */
export const playLiveSyntheticTrack = (options) => {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const actIdx = options.actIndex || 0;
    const varIdx = options.variationIndex || 0;
    const theme = ACT_THEMES[actIdx % ACT_THEMES.length];
    const isVarB = Number(varIdx) === 1;
    const beat = 60 / (options.bpm || theme.bpm || 90);
    const duration = options.durationSec || 8;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.35, now);
    master.connect(ctx.destination);

    // Bass
    const bass = ctx.createOscillator();
    const bGain = ctx.createGain();
    bass.type = isVarB ? 'sawtooth' : 'sine';
    bass.frequency.setValueAtTime(theme.root, now);
    bGain.gain.setValueAtTime(0.01, now);
    bGain.gain.linearRampToValueAtTime(isVarB ? 0.25 : 0.35, now + 0.1);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + (duration - 0.2));
    bass.connect(bGain);
    bGain.connect(master);
    bass.start(now);
    bass.stop(now + duration);

    // Chords
    theme.chords.forEach((chord, cIdx) => {
      const cTime = now + cIdx * (beat * 2);
      if (cTime < now + duration) {
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = isVarB ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, cTime);
          g.gain.setValueAtTime(0.001, cTime);
          g.gain.linearRampToValueAtTime(isVarB ? 0.08 : 0.12, cTime + beat * 0.3);
          g.gain.exponentialRampToValueAtTime(0.001, cTime + beat * 1.9);
          osc.connect(g);
          g.connect(master);
          osc.start(cTime);
          osc.stop(cTime + beat * 2);
        });
      }
    });

    // Melody
    const mel = isVarB ? theme.melodyB : theme.melodyA;
    mel.forEach((freq, mIdx) => {
      const mTime = now + mIdx * (beat * 0.82);
      if (mTime < now + duration) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = isVarB ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, mTime);
        g.gain.setValueAtTime(0.001, mTime);
        g.gain.linearRampToValueAtTime(isVarB ? 0.12 : 0.18, mTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, mTime + beat * 0.75);
        osc.connect(g);
        g.connect(master);
        osc.start(mTime);
        osc.stop(mTime + beat * 0.8);
      }
    });

    return {
      pause: () => {
        try {
          master.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          setTimeout(() => ctx.close(), 150);
        } catch (_) {}
      }
    };
  } catch (e) {
    console.warn('[Live Synthesizer Warning]', e);
    return null;
  }
};
