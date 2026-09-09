/**
 * Gandharva High-Fidelity Synthetic Audio Engine
 * Generates rich, distinct, multi-instrument audio tailored to Story Genre, Act Arc, and Variation.
 * Uses advanced DSP synthesis (Chords, Arpeggios, Bass, Leads, and Drum Beats)
 * with 0 network latency, producing real 16-bit PCM WAV audio and live Web Audio synthesis.
 */

// Note Frequency Table (Hz)
const N = {
  B1: 61.74, C2: 65.41, Cs2: 69.30, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, Ab2: 103.83, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Ab5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51
};

/**
 * Genre Profiles with customized scales, instruments, BPMs, and chord progressions
 */
export const GENRE_PROFILES = {
  romance: {
    name: 'College Romance & Melody',
    acts: [
      {
        name: 'Act 1: First Glance on Campus',
        bpm: 82, root: N.E2,
        chords: [[N.E3, N.G3, N.B3, N.E4], [N.C3, N.E3, N.G3, N.C4], [N.D3, N.Fs3, N.A3, N.D4], [N.B2, N.Ds3, N.Fs3, N.B3]],
        melodyA: [N.B4, N.G4, N.A4, N.B4, N.E5, N.D5, N.B4, N.A4, N.G4],
        melodyB: [N.E4, N.G4, N.B4, N.D5, N.C5, N.B4, N.A4, N.G4, N.E4],
        beatStyle: 'acoustic_ballad'
      },
      {
        name: 'Act 2: Shared Walks & Coffee Moments',
        bpm: 92, root: N.A2,
        chords: [[N.A3, N.Cs4, N.E4, N.A4], [N.Fs3, N.A3, N.Cs4, N.Fs4], [N.D3, N.Fs3, N.A3, N.D4], [N.E3, N.Gs3, N.B3, N.E4]],
        melodyA: [N.Cs5, N.E5, N.Fs5, N.E5, N.Cs5, N.B4, N.A4, N.B4, N.Cs5],
        melodyB: [N.A4, N.Cs5, N.E5, N.A5, N.Gs5, N.Fs5, N.E5, N.D5, N.Cs5],
        beatStyle: 'lofi_groove'
      },
      {
        name: 'Act 3: Festival Rain & Misunderstanding',
        bpm: 76, root: N.Fs2,
        chords: [[N.Fs3, N.A3, N.Cs4, N.Fs4], [N.D3, N.Fs3, N.A3, N.D4], [N.B2, N.D3, N.Fs3, N.B3], [N.Cs3, N.Es3, N.Gs3, N.Cs4]],
        melodyA: [N.Fs4, N.A4, N.Cs5, N.B4, N.A4, N.Gs4, N.Fs4, N.Es4, N.Fs4],
        melodyB: [N.Cs5, N.D5, N.Cs5, N.B4, N.A4, N.B4, N.Cs5, N.A4, N.Fs4],
        beatStyle: 'rain_pulse'
      },
      {
        name: 'Act 4: Longing Across the Distance',
        bpm: 70, root: N.C2,
        chords: [[N.C3, N.Eb3, N.G3, N.C4], [N.Ab2, N.C3, N.Eb3, N.Ab3], [N.F2, N.Ab2, N.C3, N.F3], [N.G2, N.B2, N.D3, N.G3]],
        melodyA: [N.G4, N.C5, N.Eb5, N.D5, N.C5, N.Bb4, N.Ab4, N.G4, N.F4],
        melodyB: [N.Eb4, N.G4, N.C5, N.Eb5, N.D5, N.C5, N.Bb4, N.C5, N.G4],
        beatStyle: 'piano_ballad'
      },
      {
        name: 'Act 5: Graduation Reunion & Forever',
        bpm: 86, root: N.D2,
        chords: [[N.D3, N.Fs3, N.A3, N.D4], [N.G2, N.B2, N.D3, N.G3], [N.A2, N.Cs3, N.E3, N.A3], [N.D3, N.Fs3, N.A3, N.D4]],
        melodyA: [N.Fs4, N.A4, N.D5, N.Cs5, N.B4, N.A4, N.B4, N.Cs5, N.D5],
        melodyB: [N.D4, N.Fs4, N.A4, N.D5, N.E5, N.Fs5, N.E5, N.D5, N.D5],
        beatStyle: 'acoustic_celebration'
      }
    ]
  },
  action: {
    name: 'High-Octane Cinematic Action / Mass',
    acts: [
      {
        name: 'Act 1: The Dark Challenger Arrives',
        bpm: 120, root: N.D2,
        chords: [[N.D3, N.F3, N.A3, N.D4], [N.Bb2, N.D3, N.F3, N.Bb3], [N.C3, N.E3, N.G3, N.C4], [N.A2, N.Cs3, N.E3, N.A3]],
        melodyA: [N.D4, N.D4, N.F4, N.D4, N.A4, N.Ab4, N.G4, N.F4, N.D4],
        melodyB: [N.D4, N.A4, N.D5, N.C5, N.Bb4, N.A4, N.G4, N.F4, N.D4],
        beatStyle: 'taiko_heavy'
      },
      {
        name: 'Act 2: Tactical Ambush & Pursuit',
        bpm: 130, root: N.E2,
        chords: [[N.E3, N.G3, N.B3, N.E4], [N.C3, N.E3, N.G3, N.C4], [N.D3, N.Fs3, N.A3, N.D4], [N.B2, N.Ds3, N.Fs3, N.B3]],
        melodyA: [N.E4, N.G4, N.B4, N.E5, N.Ds5, N.D5, N.Cs5, N.C5, N.B4],
        melodyB: [N.E5, N.D5, N.B4, N.G4, N.A4, N.B4, N.D5, N.B4, N.E4],
        beatStyle: 'fast_chase'
      },
      {
        name: 'Act 3: The Ultimate Clash of Titans',
        bpm: 138, root: N.A2,
        chords: [[N.A3, N.C4, N.E4, N.A4], [N.F3, N.A3, N.C4, N.F4], [N.D3, N.F3, N.A3, N.D4], [N.E3, N.Gs3, N.B3, N.E4]],
        melodyA: [N.A4, N.C5, N.E5, N.A5, N.G5, N.F5, N.E5, N.D5, N.A4],
        melodyB: [N.E5, N.A5, N.G5, N.F5, N.E5, N.D5, N.C5, N.B4, N.A4],
        beatStyle: 'phonk_drop'
      },
      {
        name: 'Act 4: Rising from the Ashes',
        bpm: 110, root: N.G2,
        chords: [[N.G3, N.Bb3, N.D4, N.G4], [N.Eb3, N.G3, N.Bb3, N.Eb4], [N.F3, N.A3, N.C4, N.F4], [N.D3, N.Fs3, N.A3, N.D4]],
        melodyA: [N.G4, N.Bb4, N.D5, N.F5, N.Eb5, N.D5, N.C5, N.Bb4, N.G4],
        melodyB: [N.D5, N.Eb5, N.D5, N.C5, N.Bb4, N.A4, N.Bb4, N.C5, N.D5],
        beatStyle: 'heroic_surge'
      },
      {
        name: 'Act 5: Triumphant Coronation',
        bpm: 125, root: N.C2,
        chords: [[N.C3, N.E3, N.G3, N.C4], [N.F2, N.A2, N.C3, N.F3], [N.G2, N.B2, N.D3, N.G3], [N.C3, N.E3, N.G3, N.C4]],
        melodyA: [N.C4, N.E4, N.G4, N.C5, N.D5, N.E5, N.D5, N.C5, N.C5],
        melodyB: [N.G4, N.C5, N.E5, N.G5, N.F5, N.E5, N.D5, N.E5, N.C5],
        beatStyle: 'victory_anthem'
      }
    ]
  },
  cyberpunk: {
    name: 'Cyberpunk Neon Metropolis',
    acts: [
      {
        name: 'Act 1: Midnight Rain & Glitch Beacon',
        bpm: 118, root: N.F2,
        chords: [[N.F3, N.Ab3, N.C4, N.F4], [N.Db3, N.F3, N.Ab3, N.Db4], [N.Eb3, N.G3, N.Bb3, N.Eb4], [N.C3, N.E3, N.G3, N.C4]],
        melodyA: [N.F4, N.Ab4, N.C5, N.Eb5, N.Db5, N.C5, N.Bb4, N.Ab4, N.F4],
        melodyB: [N.C5, N.Db5, N.C5, N.Bb4, N.Ab4, N.G4, N.Ab4, N.Bb4, N.C5],
        beatStyle: 'synthwave_pulse'
      },
      {
        name: 'Act 2: Infiltrating the Neural Grid',
        bpm: 124, root: N.Bb2,
        chords: [[N.Bb3, N.Db4, N.F4, N.Bb4], [N.Gb3, N.Bb3, N.Db4, N.Gb4], [N.Ab3, N.C4, N.Eb4, N.Ab4], [N.F3, N.A3, N.C4, N.F4]],
        melodyA: [N.Bb4, N.Db5, N.F5, N.Ab5, N.Gb5, N.F5, N.Eb5, N.Db5, N.Bb4],
        melodyB: [N.F5, N.Gb5, N.F5, N.Eb5, N.Db5, N.C5, N.Db5, N.Eb5, N.F5],
        beatStyle: 'cyber_arpeggio'
      },
      {
        name: 'Act 3: Rogue AI Core Awakening',
        bpm: 132, root: N.Eb2,
        chords: [[N.Eb3, N.Gb3, N.Bb3, N.Eb4], [N.B2, N.Eb3, N.Gb3, N.B3], [N.Db3, N.F3, N.Ab3, N.Db4], [N.Bb2, N.D3, N.F3, N.Bb3]],
        melodyA: [N.Eb5, N.Gb5, N.Bb5, N.Ab5, N.Gb5, N.F5, N.Eb5, N.D5, N.Eb5],
        melodyB: [N.Bb4, N.Eb5, N.Gb5, N.F5, N.Eb5, N.Db5, N.B4, N.Db5, N.Eb5],
        beatStyle: 'darksynth_drop'
      },
      {
        name: 'Act 4: High-Speed Skyway Escape',
        bpm: 128, root: N.Ab2,
        chords: [[N.Ab3, N.B3, N.Eb4, N.Ab4], [N.E3, N.Ab3, N.B3, N.E4], [N.Fs3, N.A3, N.Cs4, N.Fs4], [N.Eb3, N.G3, N.Bb3, N.Eb4]],
        melodyA: [N.Ab4, N.B4, N.Eb5, N.Fs5, N.E5, N.Eb5, N.Cs5, N.B4, N.Ab4],
        melodyB: [N.Eb5, N.E5, N.Eb5, N.Cs5, N.B4, N.Bb4, N.B4, N.Cs5, N.Eb5],
        beatStyle: 'electro_drive'
      },
      {
        name: 'Act 5: Neon Dawn Over the Skyline',
        bpm: 108, root: N.Db2,
        chords: [[N.Db3, N.F3, N.Ab3, N.Db4], [N.Gb2, N.Bb2, N.Db3, N.Gb3], [N.Ab2, N.C3, N.Eb3, N.Ab3], [N.Db3, N.F3, N.Ab3, N.Db4]],
        melodyA: [N.F4, N.Ab4, N.Db5, N.C5, N.Bb4, N.Ab4, N.Gb4, N.F4, N.Db4],
        melodyB: [N.Db4, N.F4, N.Ab4, N.Db5, N.Eb5, N.F5, N.Eb5, N.Db5, N.Db5],
        beatStyle: 'ambient_chillwave'
      }
    ]
  },
  spiritual: {
    name: 'Spiritual Sacred Temples',
    acts: [
      {
        name: 'Act 1: Sacred Morning Bells & River Mist',
        bpm: 68, root: N.G2,
        chords: [[N.G3, N.B3, N.D4, N.G4], [N.C3, N.E3, N.G3, N.C4], [N.D3, N.Fs3, N.A3, N.D4], [N.G3, N.B3, N.D4, N.G4]],
        melodyA: [N.D4, N.G4, N.A4, N.B4, N.D5, N.B4, N.A4, N.G4, N.D4],
        melodyB: [N.G4, N.B4, N.D5, N.E5, N.D5, N.B4, N.A4, N.G4, N.G4],
        beatStyle: 'temple_drone'
      },
      {
        name: 'Act 2: Ancient Sitar & Flute Resonance',
        bpm: 78, root: N.C2,
        chords: [[N.C3, N.E3, N.G3, N.C4], [N.F2, N.A2, N.C3, N.F3], [N.G2, N.B2, N.D3, N.G3], [N.C3, N.E3, N.G3, N.C4]],
        melodyA: [N.E4, N.G4, N.A4, N.C5, N.D5, N.C5, N.A4, N.G4, N.E4],
        melodyB: [N.C4, N.E4, N.G4, N.A4, N.C5, N.D5, N.E5, N.D5, N.C5],
        beatStyle: 'tabla_fusion'
      },
      {
        name: 'Act 3: Cosmic Dance of Devotion',
        bpm: 96, root: N.D2,
        chords: [[N.D3, N.Fs3, N.A3, N.D4], [N.G2, N.B2, N.D3, N.G3], [N.A2, N.Cs3, N.E3, N.A3], [N.D3, N.Fs3, N.A3, N.D4]],
        melodyA: [N.D4, N.Fs4, N.A4, N.B4, N.D5, N.Cs5, N.B4, N.A4, N.Fs4],
        melodyB: [N.A4, N.B4, N.D5, N.Fs5, N.E5, N.D5, N.B4, N.A4, N.D4],
        beatStyle: 'mridangam_pulse'
      },
      {
        name: 'Act 4: Meditative Tranquility',
        bpm: 60, root: N.A2,
        chords: [[N.A3, N.Cs4, N.E4, N.A4], [N.D3, N.Fs3, N.A3, N.D4], [N.E3, N.Gs3, N.B3, N.E4], [N.A3, N.Cs4, N.E4, N.A4]],
        melodyA: [N.Cs4, N.E4, N.Fs4, N.A4, N.B4, N.A4, N.Fs4, N.E4, N.Cs4],
        melodyB: [N.E4, N.A4, N.B4, N.Cs5, N.B4, N.A4, N.Fs4, N.E4, N.A4],
        beatStyle: 'bamboo_whisper'
      },
      {
        name: 'Act 5: Eternal Divine Light',
        bpm: 72, root: N.E2,
        chords: [[N.E3, N.Gs3, N.B3, N.E4], [N.A2, N.Cs3, N.E3, N.A3], [N.B2, N.Ds3, N.Fs3, N.B3], [N.E3, N.Gs3, N.B3, N.E4]],
        melodyA: [N.B4, N.Cs5, N.E5, N.Fs5, N.Gs5, N.Fs5, N.E5, N.Cs5, N.B4],
        melodyB: [N.E4, N.Gs4, N.B4, N.E5, N.Fs5, N.Gs5, N.Fs5, N.E5, N.E5],
        beatStyle: 'sacred_climax'
      }
    ]
  },
  mystery: {
    name: 'Suspenseful Mystery & Detective Thriller',
    acts: [
      {
        name: 'Act 1: The Midnight Call from the Void',
        bpm: 80, root: N.D2,
        chords: [[N.D3, N.F3, N.A3, N.D4], [N.Bb2, N.D3, N.F3, N.Bb3], [N.G2, N.Bb2, N.D3, N.G3], [N.A2, N.Cs3, N.E3, N.A3]],
        melodyA: [N.D4, N.F4, N.E4, N.D4, N.A4, N.G4, N.F4, N.E4, N.D4],
        melodyB: [N.D4, N.A4, N.F4, N.D5, N.Cs5, N.Bb4, N.A4, N.F4, N.D4],
        beatStyle: 'clock_tick'
      },
      {
        name: 'Act 2: Whispers in the Shadowed Alley',
        bpm: 90, root: N.G2,
        chords: [[N.G3, N.Bb3, N.D4, N.G4], [N.Eb3, N.G3, N.Bb3, N.Eb4], [N.C3, N.Eb3, N.G3, N.C4], [N.D3, N.Fs3, N.A3, N.D4]],
        melodyA: [N.G4, N.Bb4, N.D5, N.C5, N.Bb4, N.A4, N.G4, N.Fs4, N.G4],
        melodyB: [N.G4, N.D5, N.Eb5, N.D5, N.C5, N.Bb4, N.C5, N.D5, N.G4],
        beatStyle: 'tense_pizzicato'
      },
      {
        name: 'Act 3: Chasing the Phantom Clue',
        bpm: 116, root: N.A2,
        chords: [[N.A3, N.C4, N.E4, N.A4], [N.F3, N.A3, N.C4, N.F4], [N.D3, N.F3, N.A3, N.D4], [N.E3, N.Ab3, N.B3, N.E4]],
        melodyA: [N.A4, N.E5, N.D5, N.C5, N.B4, N.C5, N.D5, N.E5, N.A4],
        melodyB: [N.A4, N.C5, N.E5, N.A5, N.G5, N.F5, N.E5, N.D5, N.A4],
        beatStyle: 'fast_pursuit'
      },
      {
        name: 'Act 4: Face to Face with the Secret',
        bpm: 88, root: N.C2,
        chords: [[N.C3, N.Eb3, N.G3, N.C4], [N.Ab2, N.C3, N.Eb3, N.Ab3], [N.F2, N.Ab2, N.C3, N.F3], [N.G2, N.B2, N.D3, N.G3]],
        melodyA: [N.Eb4, N.G4, N.C5, N.Bb4, N.Ab4, N.G4, N.F4, N.Eb4, N.D4],
        melodyB: [N.C4, N.Eb4, N.G4, N.Bb4, N.C5, N.Eb5, N.D5, N.C5, N.G4],
        beatStyle: 'dramatic_strings'
      },
      {
        name: 'Act 5: Haunting Epilogue & Dawn',
        bpm: 76, root: N.D2,
        chords: [[N.D3, N.Fs3, N.A3, N.D4], [N.G2, N.B2, N.D3, N.G3], [N.A2, N.Cs3, N.E3, N.A3], [N.D3, N.Fs3, N.A3, N.D4]],
        melodyA: [N.Fs4, N.A4, N.D5, N.Cs5, N.B4, N.A4, N.G4, N.Fs4, N.D4],
        melodyB: [N.D4, N.Fs4, N.A4, N.D5, N.E5, N.Fs5, N.E5, N.D5, N.A4],
        beatStyle: 'quiet_dawn'
      }
    ]
  }
};

/**
 * Detects the best matching genre profile from story text, prompt, or title
 */
export const resolveGenreProfile = (genreOrStory = '') => {
  const str = (genreOrStory || '').toLowerCase();
  if (str.includes('romance') || str.includes('college') || str.includes('love') || str.includes('arjun') || str.includes('priya') || str.includes('sweet')) {
    return GENRE_PROFILES.romance;
  }
  if (str.includes('action') || str.includes('mass') || str.includes('hero') || str.includes('fight') || str.includes('war') || str.includes('titan') || str.includes('revenge')) {
    return GENRE_PROFILES.action;
  }
  if (str.includes('cyber') || str.includes('neon') || str.includes('future') || str.includes('hacker') || str.includes('robot') || str.includes('city')) {
    return GENRE_PROFILES.cyberpunk;
  }
  if (str.includes('temple') || str.includes('spiritual') || str.includes('sacred') || str.includes('god') || str.includes('flute') || str.includes('sitar') || str.includes('divine')) {
    return GENRE_PROFILES.spiritual;
  }
  return GENRE_PROFILES.mystery;
};

/**
 * Synthesizes a real 16-bit PCM WAV ArrayBuffer mathematically
 */
export const createSyntheticWavBuffer = ({
  actIndex = 0,
  variationIndex = 0,
  bpm = 0,
  durationSec = 8,
  genre = '',
  story = ''
}) => {
  const sampleRate = 44100;
  const numChannels = 2;
  const totalSamples = Math.floor(sampleRate * durationSec);
  
  const profile = resolveGenreProfile(genre || story);
  const act = profile.acts[actIndex % profile.acts.length];
  const isVarB = Number(variationIndex) === 1;
  const targetBpm = bpm || act.bpm || 90;
  const beatSec = 60 / targetBpm;

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const renderTone = (freq, startSec, durSec, gain, oscType, channelPan = 0) => {
    const startSample = Math.floor(startSec * sampleRate);
    const numSamp = Math.floor(durSec * sampleRate);
    const endSample = Math.min(totalSamples, startSample + numSamp);

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / sampleRate;
      const progress = t / durSec;

      let env = 1.0;
      if (progress < 0.08) env = progress / 0.08;
      else if (progress > 0.65) env = Math.max(0, 1.0 - (progress - 0.65) / 0.35);

      let sample = 0;
      const phase = 2 * Math.PI * freq * t;
      if (oscType === 'sine') sample = Math.sin(phase);
      else if (oscType === 'triangle') sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
      else if (oscType === 'sawtooth') sample = 2 * ((freq * t) % 1) - 1;
      else if (oscType === 'square') sample = Math.sin(phase) >= 0 ? 0.7 : -0.7;

      const val = sample * gain * env;
      left[i] += val * 0.5 * (1 - channelPan);
      right[i] += val * 0.5 * (1 + channelPan);
    }
  };

  const renderDrumHit = (startSec, type = 'kick') => {
    const startSample = Math.floor(startSec * sampleRate);
    const durSec = type === 'kick' ? 0.22 : type === 'snare' ? 0.18 : 0.06;
    const numSamp = Math.floor(durSec * sampleRate);
    const endSample = Math.min(totalSamples, startSample + numSamp);

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / sampleRate;
      let val = 0;
      if (type === 'kick') {
        const kickFreq = 140 * Math.exp(-t * 30) + 40;
        val = Math.sin(2 * Math.PI * kickFreq * t) * Math.exp(-t * 16) * 0.48;
      } else if (type === 'snare') {
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 24) * 0.32;
        const tone = Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 22) * 0.22;
        val = noise + tone;
      } else if (type === 'hihat') {
        val = (Math.random() * 2 - 1) * Math.exp(-t * 50) * 0.16;
      }
      left[i] += val * 0.5;
      right[i] += val * 0.5;
    }
  };

  // 1. Bassline Drone / Rhythm
  renderTone(act.root, 0, durationSec * 0.95, isVarB ? 0.24 : 0.35, isVarB ? 'sawtooth' : 'sine', 0);

  // 2. Chords & Pad Harmonies
  act.chords.forEach((chord, chordIdx) => {
    const chordStart = chordIdx * (beatSec * 2);
    if (chordStart < durationSec) {
      chord.forEach((note, noteIdx) => {
        const pan = (noteIdx % 2 === 0 ? -0.35 : 0.35);
        renderTone(note, chordStart, beatSec * 1.95, isVarB ? 0.11 : 0.15, isVarB ? 'sawtooth' : 'triangle', pan);
      });
    }
  });

  // 3. Melodic Solo Lead Lines
  const activeMelody = isVarB ? act.melodyB : act.melodyA;
  activeMelody.forEach((melNote, melIdx) => {
    const melStart = melIdx * (beatSec * 0.82);
    if (melStart < durationSec) {
      renderTone(melNote, melStart, beatSec * 0.78, isVarB ? 0.18 : 0.24, isVarB ? 'square' : 'triangle', 0.1);
    }
  });

  // 4. Percussion Beats
  const numBeats = Math.floor(durationSec / beatSec);
  for (let b = 0; b < numBeats; b++) {
    const beatTime = b * beatSec;
    if (b % 2 === 0) renderDrumHit(beatTime, 'kick');
    if (b % 2 === 1) renderDrumHit(beatTime, 'snare');
    renderDrumHit(beatTime, 'hihat');
    if (beatTime + beatSec * 0.5 < durationSec) {
      renderDrumHit(beatTime + beatSec * 0.5, 'hihat');
    }
  }

  // RIFF WAV Header
  const bytesPerSample = 2;
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const lSamp = Math.max(-1, Math.min(1, left[i]));
    view.setInt16(offset, lSamp < 0 ? lSamp * 0x8000 : lSamp * 0x7FFF, true);
    offset += 2;
    const rSamp = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, rSamp < 0 ? rSamp * 0x8000 : rSamp * 0x7FFF, true);
    offset += 2;
  }

  return arrayBuffer;
};

/**
 * Creates in-memory Blob URL or Data URI for instant playback and downloads
 */
export const getSyntheticWavUri = (options) => {
  const wavBuffer = createSyntheticWavBuffer(options);
  if (typeof window !== 'undefined' && window.Blob && window.URL && window.URL.createObjectURL) {
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return window.URL.createObjectURL(blob);
  }

  const bytes = new Uint8Array(wavBuffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
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

    const profile = resolveGenreProfile(options.genre || options.story || '');
    const actIdx = options.actIndex || 0;
    const varIdx = options.variationIndex || 0;
    const act = profile.acts[actIdx % profile.acts.length];
    const isVarB = Number(varIdx) === 1;
    const targetBpm = options.bpm || act.bpm || 90;
    const beat = 60 / targetBpm;
    const duration = options.durationSec || 8;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.36, now);
    master.connect(ctx.destination);

    // 1. Bassline (Sub-bass or Sawtooth Synth Bass)
    const bass = ctx.createOscillator();
    const bGain = ctx.createGain();
    bass.type = isVarB ? 'sawtooth' : 'sine';
    bass.frequency.setValueAtTime(act.root, now);
    bGain.gain.setValueAtTime(0.01, now);
    bGain.gain.linearRampToValueAtTime(isVarB ? 0.24 : 0.35, now + 0.1);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + (duration - 0.2));
    bass.connect(bGain);
    bGain.connect(master);
    bass.start(now);
    bass.stop(now + duration);

    // 2. Chords & Harmony Pads
    act.chords.forEach((chord, cIdx) => {
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

    // 3. Melodic Lead Solo
    const mel = isVarB ? act.melodyB : act.melodyA;
    mel.forEach((freq, mIdx) => {
      const mTime = now + mIdx * (beat * 0.82);
      if (mTime < now + duration) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = isVarB ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, mTime);
        g.gain.setValueAtTime(0.001, mTime);
        g.gain.linearRampToValueAtTime(isVarB ? 0.14 : 0.20, mTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, mTime + beat * 0.75);
        osc.connect(g);
        g.connect(master);
        osc.start(mTime);
        osc.stop(mTime + beat * 0.8);
      }
    });

    // 4. Drums (Kick & Snare pulses)
    const numBeats = Math.floor(duration / beat);
    for (let b = 0; b < numBeats; b++) {
      const bTime = now + b * beat;
      if (b % 2 === 0) {
        // Kick
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.frequency.setValueAtTime(140, bTime);
        kickOsc.frequency.exponentialRampToValueAtTime(42, bTime + 0.18);
        kickGain.gain.setValueAtTime(0.35, bTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.2);
        kickOsc.connect(kickGain);
        kickGain.connect(master);
        kickOsc.start(bTime);
        kickOsc.stop(bTime + 0.22);
      } else {
        // Snare
        const snareOsc = ctx.createOscillator();
        const snareGain = ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(180, bTime);
        snareGain.gain.setValueAtTime(0.22, bTime);
        snareGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.15);
        snareOsc.connect(snareGain);
        snareGain.connect(master);
        snareOsc.start(bTime);
        snareOsc.stop(bTime + 0.18);
      }
    }

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
