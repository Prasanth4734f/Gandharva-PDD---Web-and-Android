/**
 * Gandharva High-Fidelity Synthetic Audio Engine (Node.js Backend & DSP Synthesizer)
 * Generates rich, distinct, multi-instrument audio tailored to Story Genre, Act Arc, Prompt Seed, and Variation.
 * Uses advanced DSP synthesis (Chords, Arpeggios, Basslines, Melodic Leads, and Drum Beats)
 * producing genuine 16-bit PCM stereo WAV audio buffers on the server.
 */

// Note Frequency Table (Hz)
const N = {
  A1: 55.00, Bb1: 58.27, B1: 61.74, C2: 65.41, Cs2: 69.30, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, Ab2: 103.83,
  A2: 110.00, Bb2: 116.54, B2: 123.47, C3: 130.81, Cs3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Ab3: 207.65,
  A3: 220.00, Bb3: 233.08, B3: 246.94, C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30,
  A4: 440.00, Bb4: 466.16, B4: 493.88, C5: 523.25, Cs5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Ab5: 830.61,
  A5: 880.00, Bb5: 932.33, B5: 987.77, C6: 1046.50, D6: 1174.66, E6: 1318.51
};

const GENRE_PROFILES = {
  romance: {
    name: 'College Romance & Melodic Love',
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
        bpm: 90, root: N.A2,
        chords: [[N.A3, N.Cs4, N.E4, N.A4], [N.Fs3, N.A3, N.Cs4, N.Fs4], [N.D3, N.Fs3, N.A3, N.D4], [N.E3, N.Gs3, N.B3, N.E4]],
        melodyA: [N.Cs5, N.E5, N.Fs5, N.E5, N.Cs5, N.B4, N.A4, N.B4, N.Cs5],
        melodyB: [N.A4, N.Cs5, N.E5, N.A5, N.Gs5, N.Fs5, N.E5, N.D5, N.Cs5],
        beatStyle: 'lofi_groove'
      },
      {
        name: 'Act 3: Festival Rain & Heartache',
        bpm: 76, root: N.Fs2,
        chords: [[N.Fs3, N.A3, N.Cs4, N.Fs4], [N.D3, N.Fs3, N.A3, N.D4], [N.B2, N.D3, N.Fs3, N.B3], [N.Cs3, N.Es3, N.Gs3, N.Cs4]],
        melodyA: [N.Fs4, N.A4, N.Cs5, N.B4, N.A4, N.Gs4, N.Fs4, N.Es4, N.Fs4],
        melodyB: [N.Cs5, N.D5, N.Cs5, N.B4, N.A4, N.B4, N.Cs5, N.A4, N.Fs4],
        beatStyle: 'rain_pulse'
      },
      {
        name: 'Act 4: Longing Across the Distance',
        bpm: 72, root: N.C2,
        chords: [[N.C3, N.Eb3, N.G3, N.C4], [N.Ab2, N.C3, N.Eb3, N.Ab3], [N.F2, N.Ab2, N.C3, N.F3], [N.G2, N.B2, N.D3, N.G3]],
        melodyA: [N.G4, N.C5, N.Eb5, N.D5, N.C5, N.Bb4, N.Ab4, N.G4, N.F4],
        melodyB: [N.Eb4, N.G4, N.C5, N.Eb5, N.D5, N.C5, N.Bb4, N.C5, N.G4],
        beatStyle: 'piano_ballad'
      },
      {
        name: 'Act 5: Graduation Reunion & Forever',
        bpm: 88, root: N.D2,
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
        bpm: 128, root: N.D2,
        chords: [[N.D3, N.F3, N.A3, N.D4], [N.Bb2, N.D3, N.F3, N.Bb3], [N.C3, N.E3, N.G3, N.C4], [N.A2, N.Cs3, N.E3, N.A3]],
        melodyA: [N.D4, N.D4, N.F4, N.D4, N.A4, N.Ab4, N.G4, N.F4, N.D4],
        melodyB: [N.D4, N.A4, N.D5, N.C5, N.Bb4, N.A4, N.G4, N.F4, N.D4],
        beatStyle: 'taiko_heavy'
      },
      {
        name: 'Act 2: Tactical Ambush & Pursuit',
        bpm: 132, root: N.E2,
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
        bpm: 112, root: N.G2,
        chords: [[N.G3, N.Bb3, N.D4, N.G4], [N.Eb3, N.G3, N.Bb3, N.Eb4], [N.F3, N.A3, N.C4, N.F4], [N.D3, N.Fs3, N.A3, N.D4]],
        melodyA: [N.G4, N.Bb4, N.D5, N.F5, N.Eb5, N.D5, N.C5, N.Bb4, N.G4],
        melodyB: [N.D5, N.Eb5, N.D5, N.C5, N.Bb4, N.A4, N.Bb4, N.C5, N.D5],
        beatStyle: 'heroic_surge'
      },
      {
        name: 'Act 5: Triumphant Coronation',
        bpm: 126, root: N.C2,
        chords: [[N.C3, N.E3, N.G3, N.C4], [N.F2, N.A2, N.C3, N.F3], [N.G2, N.B2, N.D3, N.G3], [N.C3, N.E3, N.G3, N.C4]],
        melodyA: [N.C4, N.E4, N.G4, N.C5, N.D5, N.E5, N.D5, N.C5, N.C5],
        melodyB: [N.G4, N.C5, N.E5, N.G5, N.F5, N.E5, N.D5, N.E5, N.C5],
        beatStyle: 'victory_anthem'
      }
    ]
  },
  sadness: {
    name: 'Soul-Stirring Heartbreak & Melancholy',
    acts: [
      {
        name: 'Act 1: Fragile Solitary Tears',
        bpm: 64, root: N.D2,
        chords: [[N.D3, N.F3, N.A3, N.D4], [N.Bb2, N.D3, N.F3, N.Bb3], [N.G2, N.Bb2, N.D3, N.G3], [N.A2, N.Cs3, N.E3, N.A3]],
        melodyA: [N.D4, N.F4, N.E4, N.D4, N.C4, N.Bb3, N.A3, N.D4],
        melodyB: [N.A4, N.F4, N.E4, N.D4, N.F4, N.E4, N.D4, N.Cs4],
        beatStyle: 'weeping_strings'
      },
      {
        name: 'Act 2: Sorrowful Echoes in the Rain',
        bpm: 66, root: N.C2,
        chords: [[N.C3, N.Eb3, N.G3, N.C4], [N.Ab2, N.C3, N.Eb3, N.Ab3], [N.F2, N.Ab2, N.C3, N.F3], [N.G2, N.B2, N.D3, N.G3]],
        melodyA: [N.G4, N.Eb4, N.D4, N.C4, N.Eb4, N.D4, N.C4, N.B3],
        melodyB: [N.C5, N.G4, N.Eb4, N.D4, N.C4, N.Ab3, N.G3, N.C4],
        beatStyle: 'rain_pulse'
      },
      {
        name: 'Act 3: Forgotten Letters & Faded Photos',
        bpm: 68, root: N.A2,
        chords: [[N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.D3, N.F3, N.A3], [N.E3, N.Gs3, N.B3]],
        melodyA: [N.E4, N.A4, N.C5, N.B4, N.A4, N.Gs4, N.F4, N.E4],
        melodyB: [N.A4, N.C5, N.E5, N.D5, N.C5, N.B4, N.A4, N.E4],
        beatStyle: 'piano_ballad'
      },
      {
        name: 'Act 4: Walking Through the Cold Night',
        bpm: 62, root: N.G2,
        chords: [[N.G3, N.Bb3, N.D4], [N.Eb3, N.G3, N.Bb3], [N.C3, N.Eb3, N.G3], [N.D3, N.Fs3, N.A3]],
        melodyA: [N.D4, N.G4, N.Bb4, N.A4, N.G4, N.Fs4, N.Eb4, N.D4],
        melodyB: [N.G4, N.Bb4, N.D5, N.C5, N.Bb4, N.A4, N.G4, N.D4],
        beatStyle: 'weeping_strings'
      },
      {
        name: 'Act 5: Healing Whisper & Peaceful Acceptance',
        bpm: 72, root: N.E2,
        chords: [[N.E3, N.G3, N.B3], [N.C3, N.E3, N.G3], [N.D3, N.Fs3, N.A3], [N.E3, N.G3, N.B3]],
        melodyA: [N.G4, N.B4, N.E5, N.D5, N.B4, N.A4, N.G4, N.E4],
        melodyB: [N.E4, N.G4, N.A4, N.B4, N.D5, N.B4, N.G4, N.E4],
        beatStyle: 'acoustic_ballad'
      }
    ]
  },
  lofi: {
    name: 'Warm Melodic Lo-Fi & Ambient Chill',
    acts: [
      {
        name: 'Act 1: Midnight Bedroom Vinyl',
        bpm: 74, root: N.Ab2,
        chords: [[N.Ab3, N.C4, N.Eb4, N.G4], [N.F3, N.Ab3, N.C4, N.Eb4], [N.Bb2, N.D3, N.F3, N.Ab3], [N.Eb3, N.G3, N.Bb3, N.Db4]],
        melodyA: [N.Eb4, N.G4, N.Ab4, N.C5, N.Bb4, N.Ab4, N.G4, N.Eb4],
        melodyB: [N.C5, N.Eb5, N.D5, N.Bb4, N.Ab4, N.G4, N.F4, N.Eb4],
        beatStyle: 'lofi_groove'
      },
      {
        name: 'Act 2: Cozy Rainy Cafe Study',
        bpm: 76, root: N.F2,
        chords: [[N.F3, N.A3, N.C4, N.E4], [N.D3, N.F3, N.A3, N.C4], [N.G2, N.Bb2, N.D3, N.F3], [N.C3, N.E3, N.G3, N.Bb3]],
        melodyA: [N.A4, N.C5, N.D5, N.F5, N.E5, N.C5, N.A4, N.F4],
        melodyB: [N.C5, N.D5, N.E5, N.D5, N.C5, N.A4, N.G4, N.F4],
        beatStyle: 'lofi_groove'
      },
      {
        name: 'Act 3: Sunset Rooftop Warmth',
        bpm: 78, root: N.Eb2,
        chords: [[N.Eb3, N.G3, N.Bb3, N.D4], [N.C3, N.Eb3, N.G3, N.Bb3], [N.Ab2, N.C3, N.Eb3, N.G3], [N.Bb2, N.D3, N.F3, N.Ab3]],
        melodyA: [N.G4, N.Bb4, N.C5, N.Eb5, N.D5, N.Bb4, N.Ab4, N.G4],
        melodyB: [N.Eb4, N.G4, N.Bb4, N.D5, N.C5, N.Bb4, N.G4, N.Eb4],
        beatStyle: 'lofi_groove'
      },
      {
        name: 'Act 4: Stargazing on the Balcony',
        bpm: 70, root: N.Db2,
        chords: [[N.Db3, N.F3, N.Ab3, N.C4], [N.Bb2, N.Db3, N.F3, N.Ab3], [N.Gb2, N.Bb2, N.Db3, N.F3], [N.Ab2, N.C3, N.Eb3, N.Gb3]],
        melodyA: [N.F4, N.Ab4, N.C5, N.Db5, N.C5, N.Ab4, N.F4, N.Db4],
        melodyB: [N.Ab4, N.C5, N.Eb5, N.Db5, N.C5, N.Ab4, N.F4, N.Db4],
        beatStyle: 'lofi_groove'
      },
      {
        name: 'Act 5: Gentle Morning Coffee Light',
        bpm: 80, root: N.C2,
        chords: [[N.C3, N.E3, N.G3, N.B3], [N.A2, N.C3, N.E3, N.G3], [N.F2, N.A2, N.C3, N.E3], [N.G2, N.B2, N.D3, N.F3]],
        melodyA: [N.E4, N.G4, N.B4, N.C5, N.B4, N.G4, N.E4, N.C4],
        melodyB: [N.G4, N.C5, N.E5, N.D5, N.C5, N.B4, N.A4, N.G4],
        beatStyle: 'lofi_groove'
      }
    ]
  },
  dance: {
    name: 'High-Energy Electronic Dance & EDM',
    acts: [
      {
        name: 'Act 1: Mainstage Festival Drop',
        bpm: 128, root: N.F2,
        chords: [[N.F3, N.A3, N.C4, N.F4], [N.Db3, N.F3, N.Ab3, N.Db4], [N.Eb3, N.G3, N.Bb3, N.Eb4], [N.C3, N.E3, N.G3, N.C4]],
        melodyA: [N.F4, N.F4, N.Ab4, N.C5, N.Eb5, N.F5, N.Eb5, N.C5],
        melodyB: [N.C5, N.Eb5, N.F5, N.Ab5, N.G5, N.F5, N.Eb5, N.C5],
        beatStyle: 'edm_drop'
      },
      {
        name: 'Act 2: Laser Nightclub Surge',
        bpm: 130, root: N.A2,
        chords: [[N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.G3, N.B3, N.D4], [N.E3, N.G3, N.B3]],
        melodyA: [N.A4, N.C5, N.E5, N.G5, N.E5, N.D5, N.C5, N.A4],
        melodyB: [N.E5, N.A5, N.G5, N.E5, N.D5, N.C5, N.D5, N.E5],
        beatStyle: 'edm_drop'
      },
      {
        name: 'Act 3: Future Bass Sunset',
        bpm: 134, root: N.D2,
        chords: [[N.D3, N.Fs3, N.A3], [N.B2, N.D3, N.Fs3], [N.G2, N.B2, N.D3], [N.A2, N.Cs3, N.E3]],
        melodyA: [N.Fs4, N.A4, N.D5, N.E5, N.Fs5, N.E5, N.D5, N.A4],
        melodyB: [N.D5, N.Fs5, N.A5, N.Fs5, N.E5, N.D5, N.Cs5, N.D5],
        beatStyle: 'edm_drop'
      },
      {
        name: 'Act 4: Euphoric Sunrise Rave',
        bpm: 132, root: N.C2,
        chords: [[N.C3, N.E3, N.G3], [N.G2, N.B2, N.D3], [N.A2, N.C3, N.E3], [N.F2, N.A2, N.C3]],
        melodyA: [N.C4, N.E4, N.G4, N.C5, N.D5, N.E5, N.D5, N.C5],
        melodyB: [N.G4, N.C5, N.E5, N.G5, N.F5, N.E5, N.D5, N.C5],
        beatStyle: 'edm_drop'
      },
      {
        name: 'Act 5: Midnight Strobe Climax',
        bpm: 136, root: N.E2,
        chords: [[N.E3, N.G3, N.B3], [N.C3, N.E3, N.G3], [N.D3, N.Fs3, N.A3], [N.B2, N.Ds3, N.Fs3]],
        melodyA: [N.E4, N.G4, N.B4, N.E5, N.D5, N.B4, N.A4, N.E4],
        melodyB: [N.B4, N.E5, N.G5, N.Fs5, N.E5, N.D5, N.B4, N.E5],
        beatStyle: 'edm_drop'
      }
    ]
  },
  rage: {
    name: 'Industrial Metal & Furious Battle Anthem',
    acts: [
      {
        name: 'Act 1: Crushing Vengeance Drop',
        bpm: 136, root: N.D2,
        chords: [[N.D2, N.A2, N.D3, N.F3], [N.C2, N.G2, N.C3, N.Eb3], [N.Bb1, N.F2, N.Bb2, N.D3], [N.A1, N.E2, N.A2, N.Cs3]],
        melodyA: [N.D3, N.D3, N.F3, N.D3, N.Ab3, N.G3, N.F3, N.D3],
        melodyB: [N.D4, N.Cs4, N.C4, N.B3, N.Bb3, N.A3, N.Ab3, N.G3],
        beatStyle: 'metal_riff'
      },
      {
        name: 'Act 2: Iron Clash & Screaming Guitars',
        bpm: 140, root: N.E2,
        chords: [[N.E2, N.B2, N.E3], [N.D2, N.A2, N.D3], [N.C2, N.G2, N.C3], [N.B1, N.Fs2, N.B2]],
        melodyA: [N.E3, N.G3, N.Bb3, N.B3, N.D4, N.B3, N.G3, N.E3],
        melodyB: [N.E4, N.D4, N.Bb3, N.G3, N.E3, N.G3, N.Bb3, N.E4],
        beatStyle: 'metal_riff'
      },
      {
        name: 'Act 3: Brutal Storm of Steel',
        bpm: 144, root: N.A1,
        chords: [[N.A2, N.E3, N.A3], [N.F2, N.C3, N.F3], [N.G2, N.D3, N.G3], [N.E2, N.B2, N.E3]],
        melodyA: [N.A3, N.C4, N.Eb4, N.E4, N.G4, N.E4, N.Eb4, N.A3],
        melodyB: [N.A4, N.G4, N.Eb4, N.C4, N.A3, N.C4, N.Eb4, N.A4],
        beatStyle: 'metal_riff'
      },
      {
        name: 'Act 4: Chaos in the Pit',
        bpm: 148, root: N.C2,
        chords: [[N.C2, N.G2, N.C3], [N.Ab1, N.Eb2, N.Ab2], [N.Bb1, N.F2, N.Bb2], [N.G1, N.D2, N.G2]],
        melodyA: [N.C3, N.Eb3, N.Gb3, N.G3, N.Bb3, N.G3, N.Gb3, N.C3],
        melodyB: [N.C4, N.Bb3, N.Gb3, N.Eb3, N.C3, N.Eb3, N.Gb3, N.C4],
        beatStyle: 'metal_riff'
      },
      {
        name: 'Act 5: Final Apocalyptic Breakdown',
        bpm: 142, root: N.D2,
        chords: [[N.D2, N.A2, N.D3], [N.Bb1, N.F2, N.Bb2], [N.G1, N.D2, N.G2], [N.A1, N.E2, N.A2]],
        melodyA: [N.D3, N.F3, N.Ab3, N.A3, N.C4, N.A3, N.Ab3, N.D3],
        melodyB: [N.D4, N.C4, N.Ab3, N.F3, N.D3, N.F3, N.Ab3, N.D4],
        beatStyle: 'metal_riff'
      }
    ]
  },
  phonk: {
    name: 'High-Octane Memphis Drift Phonk',
    acts: [
      {
        name: 'Act 1: Midnight Drift Cowbell',
        bpm: 142, root: N.Fs2,
        chords: [[N.Fs3, N.A3, N.Cs4], [N.D3, N.Fs3, N.A3], [N.E3, N.Gs3, N.B3], [N.Cs3, N.Es3, N.Gs3]],
        melodyA: [N.Cs5, N.E5, N.Fs5, N.A5, N.Gs5, N.Fs5, N.E5, N.Cs5],
        melodyB: [N.Fs5, N.Cs5, N.E5, N.D5, N.Cs5, N.B4, N.A4, N.Fs4],
        beatStyle: 'phonk_drop'
      },
      {
        name: 'Act 2: Tokyo Highway Sprint',
        bpm: 146, root: N.A2,
        chords: [[N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.D3, N.F3, N.A3], [N.E3, N.Gs3, N.B3]],
        melodyA: [N.E5, N.A5, N.C6, N.B5, N.A5, N.Gs5, N.E5, N.A4],
        melodyB: [N.A5, N.E5, N.F5, N.E5, N.D5, N.C5, N.B4, N.A4],
        beatStyle: 'phonk_drop'
      },
      {
        name: 'Act 3: Smoke & Neon Skids',
        bpm: 144, root: N.D2,
        chords: [[N.D3, N.F3, N.A3], [N.Bb2, N.D3, N.F3], [N.C3, N.E3, N.G3], [N.A2, N.Cs3, N.E3]],
        melodyA: [N.A4, N.D5, N.F5, N.E5, N.D5, N.Cs5, N.A4, N.D4],
        melodyB: [N.D5, N.F5, N.A5, N.G5, N.F5, N.E5, N.D5, N.A4],
        beatStyle: 'phonk_drop'
      },
      {
        name: 'Act 4: Underground Bass Rumble',
        bpm: 148, root: N.C2,
        chords: [[N.C3, N.Eb3, N.G3], [N.Ab2, N.C3, N.Eb3], [N.Bb2, N.D3, N.F3], [N.G2, N.B2, N.D3]],
        melodyA: [N.G4, N.C5, N.Eb5, N.D5, N.C5, N.B4, N.G4, N.C4],
        melodyB: [N.C5, N.Eb5, N.G5, N.F5, N.Eb5, N.D5, N.C5, N.G4],
        beatStyle: 'phonk_drop'
      },
      {
        name: 'Act 5: Midnight Legend Horizon',
        bpm: 150, root: N.E2,
        chords: [[N.E3, N.G3, N.B3], [N.C3, N.E3, N.G3], [N.D3, N.Fs3, N.A3], [N.B2, N.Ds3, N.Fs3]],
        melodyA: [N.B4, N.E5, N.G5, N.Fs5, N.E5, N.Ds5, N.B4, N.E4],
        melodyB: [N.E5, N.G5, N.B5, N.A5, N.G5, N.Fs5, N.E5, N.B4],
        beatStyle: 'phonk_drop'
      }
    ]
  },
  folk: {
    name: 'High-Energy Indian Folk & Teenmaar Celebration',
    acts: [
      {
        name: 'Act 1: Street Teenmaar & Dholak Groove',
        bpm: 134, root: N.G2,
        chords: [[N.G3, N.B3, N.D4], [N.C3, N.E3, N.G3], [N.D3, N.Fs3, N.A3], [N.G3, N.B3, N.D4]],
        melodyA: [N.G4, N.G4, N.B4, N.D5, N.E5, N.D5, N.B4, N.G4],
        melodyB: [N.D5, N.E5, N.D5, N.B4, N.A4, N.B4, N.D5, N.G4],
        beatStyle: 'teenmaar_dance'
      },
      {
        name: 'Act 2: Village Fair Dholak Beats',
        bpm: 138, root: N.D2,
        chords: [[N.D3, N.Fs3, N.A3], [N.G2, N.B2, N.D3], [N.A2, N.Cs3, N.E3], [N.D3, N.Fs3, N.A3]],
        melodyA: [N.D4, N.Fs4, N.A4, N.B4, N.A4, N.Fs4, N.E4, N.D4],
        melodyB: [N.A4, N.B4, N.D5, N.E5, N.D5, N.B4, N.A4, N.D4],
        beatStyle: 'teenmaar_dance'
      },
      {
        name: 'Act 3: Festival Urumi Blast',
        bpm: 142, root: N.C2,
        chords: [[N.C3, N.E3, N.G3], [N.F2, N.A2, N.C3], [N.G2, N.B2, N.D3], [N.C3, N.E3, N.G3]],
        melodyA: [N.C4, N.E4, N.G4, N.A4, N.G4, N.E4, N.D4, N.C4],
        melodyB: [N.G4, N.A4, N.C5, N.D5, N.C5, N.A4, N.G4, N.C4],
        beatStyle: 'teenmaar_dance'
      },
      {
        name: 'Act 4: Royal Procession Celebration',
        bpm: 136, root: N.A2,
        chords: [[N.A3, N.Cs4, N.E4], [N.D3, N.Fs3, N.A3], [N.E3, N.Gs3, N.B3], [N.A3, N.Cs4, N.E4]],
        melodyA: [N.A4, N.Cs5, N.E5, N.Fs5, N.E5, N.Cs5, N.B4, N.A4],
        melodyB: [N.E5, N.Fs5, N.A5, N.B5, N.A5, N.Fs5, N.E5, N.A4],
        beatStyle: 'teenmaar_dance'
      },
      {
        name: 'Act 5: Grand Teenmaar Fireworks Finish',
        bpm: 144, root: N.E2,
        chords: [[N.E3, N.Gs3, N.B3], [N.A2, N.Cs3, N.E3], [N.B2, N.Ds3, N.Fs3], [N.E3, N.Gs3, N.B3]],
        melodyA: [N.E4, N.Gs4, N.B4, N.Cs5, N.B4, N.Gs4, N.Fs4, N.E4],
        melodyB: [N.B4, N.Cs5, N.E5, N.Fs5, N.E5, N.Cs5, N.B4, N.E4],
        beatStyle: 'teenmaar_dance'
      }
    ]
  },
  cyberpunk: {
    name: 'Cyberpunk Neon Metropolis & Synthwave',
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
        name: 'Act 2: High-Speed Cyber Highway',
        bpm: 124, root: N.A2,
        chords: [[N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.G3, N.B3, N.D4], [N.E3, N.G3, N.B3]],
        melodyA: [N.A4, N.C5, N.E5, N.G5, N.F5, N.E5, N.D5, N.A4],
        melodyB: [N.E5, N.F5, N.E5, N.D5, N.C5, N.B4, N.C5, N.A4],
        beatStyle: 'synthwave_pulse'
      },
      {
        name: 'Act 3: Neon Alley Hackers',
        bpm: 120, root: N.D2,
        chords: [[N.D3, N.F3, N.A3], [N.Bb2, N.D3, N.F3], [N.C3, N.E3, N.G3], [N.A2, N.Cs3, N.E3]],
        melodyA: [N.D4, N.F4, N.A4, N.C5, N.Bb4, N.A4, N.G4, N.D4],
        melodyB: [N.A4, N.Bb4, N.A4, N.G4, N.F4, N.E4, N.F4, N.D4],
        beatStyle: 'synthwave_pulse'
      },
      {
        name: 'Act 4: Cybernetic Awakening',
        bpm: 116, root: N.C2,
        chords: [[N.C3, N.Eb3, N.G3], [N.Ab2, N.C3, N.Eb3], [N.Bb2, N.D3, N.F3], [N.G2, N.B2, N.D3]],
        melodyA: [N.C4, N.Eb4, N.G4, N.Bb4, N.Ab4, N.G4, N.F4, N.C4],
        melodyB: [N.G4, N.Ab4, N.G4, N.F4, N.Eb4, N.D4, N.Eb4, N.C4],
        beatStyle: 'synthwave_pulse'
      },
      {
        name: 'Act 5: Megacity Sunrise Grid',
        bpm: 122, root: N.E2,
        chords: [[N.E3, N.G3, N.B3], [N.C3, N.E3, N.G3], [N.D3, N.Fs3, N.A3], [N.B2, N.Ds3, N.Fs3]],
        melodyA: [N.E4, N.G4, N.B4, N.D5, N.C5, N.B4, N.A4, N.E4],
        melodyB: [N.B4, N.C5, N.B4, N.A4, N.G4, N.Fs4, N.G4, N.E4],
        beatStyle: 'synthwave_pulse'
      }
    ]
  },
  spiritual: {
    name: 'Spiritual Sacred Temples & Devotional Glow',
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
        name: 'Act 2: Vedic Chants & Sacred Fire',
        bpm: 72, root: N.D2,
        chords: [[N.D3, N.Fs3, N.A3], [N.G2, N.B2, N.D3], [N.A2, N.Cs3, N.E3], [N.D3, N.Fs3, N.A3]],
        melodyA: [N.A4, N.D5, N.E5, N.Fs5, N.E5, N.D5, N.B4, N.A4],
        melodyB: [N.D5, N.Fs5, N.A5, N.B5, N.A5, N.Fs5, N.E5, N.D5],
        beatStyle: 'temple_drone'
      },
      {
        name: 'Act 3: Sitar Reflections at Twilight',
        bpm: 65, root: N.C2,
        chords: [[N.C3, N.E3, N.G3], [N.F2, N.A2, N.C3], [N.G2, N.B2, N.D3], [N.C3, N.E3, N.G3]],
        melodyA: [N.G4, N.C5, N.D5, N.E5, N.D5, N.C5, N.A4, N.G4],
        melodyB: [N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.D5, N.C5],
        beatStyle: 'temple_drone'
      },
      {
        name: 'Act 4: Flute by the Divine River',
        bpm: 70, root: N.A2,
        chords: [[N.A3, N.Cs4, N.E4], [N.D3, N.Fs3, N.A3], [N.E3, N.Gs3, N.B3], [N.A3, N.Cs4, N.E4]],
        melodyA: [N.E4, N.A4, N.B4, N.Cs5, N.B4, N.A4, N.Fs4, N.E4],
        melodyB: [N.A4, N.Cs5, N.E5, N.Fs5, N.E5, N.Cs5, N.B4, N.A4],
        beatStyle: 'temple_drone'
      },
      {
        name: 'Act 5: Universal Peace & Transcendence',
        bpm: 66, root: N.E2,
        chords: [[N.E3, N.Gs3, N.B3], [N.A2, N.Cs3, N.E3], [N.B2, N.Ds3, N.Fs3], [N.E3, N.Gs3, N.B3]],
        melodyA: [N.B4, N.E5, N.Fs5, N.Gs5, N.Fs5, N.E5, N.Cs5, N.B4],
        melodyB: [N.E5, N.Gs5, N.B5, N.Cs6, N.B5, N.Gs5, N.Fs5, N.E5],
        beatStyle: 'temple_drone'
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
        name: 'Act 2: Dark Fog & Quiet Footsteps',
        bpm: 84, root: N.C2,
        chords: [[N.C3, N.Eb3, N.G3], [N.Ab2, N.C3, N.Eb3], [N.F2, N.Ab2, N.C3], [N.G2, N.B2, N.D3]],
        melodyA: [N.C4, N.Eb4, N.D4, N.C4, N.G4, N.F4, N.Eb4, N.D4, N.C4],
        melodyB: [N.C4, N.G4, N.Eb4, N.C5, N.B4, N.Ab4, N.G4, N.Eb4, N.C4],
        beatStyle: 'clock_tick'
      },
      {
        name: 'Act 3: The Secret Vault Revealed',
        bpm: 88, root: N.A2,
        chords: [[N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.D3, N.F3, N.A3], [N.E3, N.Gs3, N.B3]],
        melodyA: [N.A4, N.C5, N.B4, N.A4, N.E5, N.D5, N.C5, N.B4, N.A4],
        melodyB: [N.A4, N.E5, N.C5, N.A5, N.Gs5, N.F5, N.E5, N.C5, N.A4],
        beatStyle: 'clock_tick'
      },
      {
        name: 'Act 4: Clockwork Countdown',
        bpm: 92, root: N.G2,
        chords: [[N.G3, N.Bb3, N.D4], [N.Eb3, N.G3, N.Bb3], [N.C3, N.Eb3, N.G3], [N.D3, N.Fs3, N.A3]],
        melodyA: [N.G4, N.Bb4, N.A4, N.G4, N.D5, N.C5, N.Bb4, N.A4, N.G4],
        melodyB: [N.G4, N.D5, N.Bb4, N.G5, N.Fs5, N.Eb5, N.D5, N.Bb4, N.G4],
        beatStyle: 'clock_tick'
      },
      {
        name: 'Act 5: Truth Unmasked',
        bpm: 86, root: N.E2,
        chords: [[N.E3, N.G3, N.B3], [N.C3, N.E3, N.G3], [N.D3, N.Fs3, N.A3], [N.B2, N.Ds3, N.Fs3]],
        melodyA: [N.E4, N.G4, N.Fs4, N.E4, N.B4, N.A4, N.G4, N.Fs4, N.E4],
        melodyB: [N.E4, N.B4, N.G4, N.E5, N.Ds5, N.C5, N.B4, N.G4, N.E4],
        beatStyle: 'clock_tick'
      }
    ]
  }
};

const resolveGenreProfile = (genreOrStory = '') => {
  const str = (genreOrStory || '').toLowerCase();
  if (/(sad|cry|tear|alone|lonely|heartbreak|grief|sorrow|breakup|pain|loss|depress|melanchol)/i.test(str)) {
    return GENRE_PROFILES.sadness;
  }
  if (/(lofi|lo-fi|chill|relax|peace|sleep|study|cozy|quiet|ambient|calm|soft)/i.test(str)) {
    return GENRE_PROFILES.lofi;
  }
  if (/(angry|rage|furious|wrath|vengeance|revenge|metal|destruction|brutal|heavy metal|rock)/i.test(str)) {
    return GENRE_PROFILES.rage;
  }
  if (/(phonk|drift|workout|gym|adrenaline|speed|drift car|memphis)/i.test(str)) {
    return GENRE_PROFILES.phonk;
  }
  if (/(dance|edm|party|club|techno|electronic|festival|rave|house|dj|disco)/i.test(str)) {
    return GENRE_PROFILES.dance;
  }
  if (/(folk|village|teenmaar|dhol|marathi|bhangra|festival mass|desi|street drum)/i.test(str)) {
    return GENRE_PROFILES.folk;
  }
  if (/(romance|love|kiss|candlelight|sweet|intimate|wedding|date|couple|romantic|valentine)/i.test(str)) {
    return GENRE_PROFILES.romance;
  }
  if (/(temple|spiritual|sacred|god|divine|prayer|bhajan|chant|krishna|shiva|om|zen|meditation)/i.test(str)) {
    return GENRE_PROFILES.spiritual;
  }
  if (/(cyber|neon|future|futuristic|synthwave|sci-fi|robot|matrix|blade runner|retro)/i.test(str)) {
    return GENRE_PROFILES.cyberpunk;
  }
  if (/(mystery|detective|dark|thriller|suspense|secret|shadow|clue|crime|noir|puzzle)/i.test(str)) {
    return GENRE_PROFILES.mystery;
  }
  return GENRE_PROFILES.action;
};

function getPromptHash(str = '') {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const createSyntheticWavBuffer = ({
  actIndex = 0,
  variationIndex = 0,
  bpm = 0,
  durationSec = 8,
  genre = '',
  story = ''
}) => {
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * durationSec);
  
  const textSeed = `${genre}_${story}_${actIndex}_${variationIndex}`;
  const promptHash = getPromptHash(textSeed);
  
  const profile = resolveGenreProfile(genre || story);
  const act = profile.acts[Math.abs(actIndex + Math.floor(promptHash % 3)) % profile.acts.length];
  const isVarB = Number(variationIndex) === 1;
  const isVarC = Number(variationIndex) === 2;
  
  const semitoneShift = ((promptHash % 8) - 3);
  const pitchMultiplier = Math.pow(2, semitoneShift / 12);
  
  const targetBpm = bpm || act.bpm || (90 + (promptHash % 20));
  const beatSec = 60 / (targetBpm + (isVarB ? 4 : isVarC ? -4 : 0));

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const renderTone = (freq, startSec, durSec, gain, oscType, channelPan = 0) => {
    if (!freq || freq <= 0) return;
    const transposedFreq = freq * pitchMultiplier;
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
      const phase = 2 * Math.PI * transposedFreq * t;
      if (oscType === 'sine') sample = Math.sin(phase);
      else if (oscType === 'triangle') sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
      else if (oscType === 'sawtooth') sample = 2 * ((transposedFreq * t) % 1) - 1;
      else if (oscType === 'square') sample = Math.sin(phase) >= 0 ? 0.65 : -0.65;

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
  renderTone(act.root, 0, durationSec * 0.96, isVarB ? 0.28 : 0.35, isVarB ? 'sawtooth' : 'sine', 0);

  // 2. Chords & Pad Harmonies with Prompt Voicing
  act.chords.forEach((chord, chordIdx) => {
    const chordStart = chordIdx * (beatSec * 2);
    if (chordStart < durationSec) {
      chord.forEach((note, noteIdx) => {
        const pan = (noteIdx % 2 === 0 ? -0.35 : 0.35);
        renderTone(note, chordStart, beatSec * 1.95, isVarB ? 0.12 : 0.16, isVarB ? 'sawtooth' : 'triangle', pan);
      });
    }
  });

  // 3. Melodic Solo Lead Lines (Variation A vs Variation B vs Variation C)
  const activeMelody = isVarB ? act.melodyB : act.melodyA;
  activeMelody.forEach((melNote, melIdx) => {
    const melStart = melIdx * (beatSec * (isVarB ? 0.75 : isVarC ? 0.9 : 0.82));
    if (melStart < durationSec) {
      renderTone(melNote, melStart, beatSec * 0.8, isVarB ? 0.16 : 0.22, isVarB ? 'square' : 'triangle', isVarB ? 0.2 : -0.2);
    }
  });

  // 4. Dynamic Rhythm & Drum Pattern
  const totalBeats = Math.floor(durationSec / beatSec);
  for (let b = 0; b < totalBeats; b++) {
    const bTime = b * beatSec;
    if (b % 2 === 0) {
      renderDrumHit(bTime, 'kick');
    } else {
      renderDrumHit(bTime, 'snare');
    }
    renderDrumHit(bTime + beatSec * 0.5, 'hihat');
  }

  // 5. Build 16-bit PCM RIFF WAV Buffer
  const buffer = Buffer.alloc(44 + totalSamples * 4);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + totalSamples * 4, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(2, 22); // Stereo
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(totalSamples * 4, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const lSamp = Math.max(-1, Math.min(1, left[i]));
    const lInt = lSamp < 0 ? Math.round(lSamp * 0x8000) : Math.round(lSamp * 0x7FFF);
    buffer.writeInt16LE(lInt, offset);
    offset += 2;

    const rSamp = Math.max(-1, Math.min(1, right[i]));
    const rInt = rSamp < 0 ? Math.round(rSamp * 0x8000) : Math.round(rSamp * 0x7FFF);
    buffer.writeInt16LE(rInt, offset);
    offset += 2;
  }

  return buffer;
};

module.exports = {
  createSyntheticWavBuffer,
  resolveGenreProfile,
  GENRE_PROFILES
};
