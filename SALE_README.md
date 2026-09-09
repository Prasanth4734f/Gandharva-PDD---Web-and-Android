# ⚡ GANDHARVA — Integrated AI Music Studio & Production Suite
### Commercial Project Sale Document & Technical Specification

---

## 🌟 1. What is Gandharva?

**Gandharva** is an advanced, full-stack, cross-platform AI music creation and production studio built for mobile (**Android APK / iOS**) and desktop **Web browsers**. 

It enables music producers, songwriters, content creators, and independent artists to convert natural language prompts and narrative stories into release-ready musical compositions, multilingual lyrics, and multi-track audio arrangements in seconds.

The project is built with **zero external dependency on paid third-party APIs (no OpenAI or Gemini API keys needed)**, featuring a completely self-contained cascading AI model architecture with zero downtime guarantees.

---

## 🚀 2. Core Features & Capabilities

### 🎼 1. Prompt-to-Music Composition Engine
- Transforms natural language prompts (e.g., *"Cyberpunk synthwave with driving bass and analog arpeggios"*) into high-fidelity stereo audio tracks.
- Selectable genres (Pop, Lofi, EDM, Rock, Cinematic, Classical, Phonk) and emotional mood filters.
- Real-time audio waveform visualizer and direct WAV/MP3 export.

### 📖 2. Story-to-Album Engine (Narrative Intelligence - NIE)
- Analyzes complete user stories or screenplays and decomposes them into a cohesive 3-scene concept album.
- Generates scene-by-scene soundtracks with Dual-Brain GPU scores (Track 1: ACE-Step Master Score, Track 2: Neural MusicGen Score).

### 🔮 3. Multilingual AI Lyrics Studio
- Real-time native script songwriting in **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, and **English**.
- Automatic rhyme scheme verification and syllable meter analysis (8–10 syllables per line).
- Generates 2 distinct song variations (Soulful Poetic vs. Rhythmic High-Energy) plus a producer BGM master prompt.

### 🎛️ 4. Multi-Track Digital Audio Workstation (DAW)
- Interactive audio workstation with visual waveform trimming.
- Real-time pitch shifter (-12 to +12 semitones) and tempo scaler (0.5x to 2.0x speed).
- Multi-band Equalizer, studio reverb rack, and track bounce mixdown.

### 🎹 5. 10 Playground Virtual Instruments (<10ms Latency)
- Touch-responsive virtual instrument racks running on a high-speed WebAudio DSP sampler:
  - 🎹 **88-Key Synthesizer Piano** (Octave switching & sustain pedal)
  - 🥁 **8-Pad Studio Drum Machine** (Kick, Snare, Hi-Hat, Toms, Clap)
  - 🎸 **Acoustic & Electric Guitar Chord Strummer**
  - 🪈 **Bansuri Flute Studio**
  - 🎻 **Violin**, 🎷 **Saxophone**, 🪕 **Sitar**, 🎸 **Slap Bass**, 🎹 **Organ** & 🎛️ **Synth Lead**

### 🎤 6. AI Vocal Studio & Stem Demixing
- Vocal stem separation using Demucs V4 (separates Vocals, Drums, Bass, and Other).
- Spectral subtraction noise gate for clean microphone recording.
- Real-time pitch tracking and key scale detection.

### 🛡️ 7. Master Admin Portal & Telemetry Dashboard
- Security PIN-protected admin portal (`PIN: 240899`).
- Live server CPU/memory telemetry, AI engine switching, cache purge, and maintenance controls.

---

## 🏛️ 3. Full System Architecture

```
                                  GANDHARVA ECOSYSTEM
                                  
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 📱 CLIENT TIER (React Native / Expo 54)                 │
  │   - Story-to-Album Screen    - Multilingual Lyrics Studio              │
  │   - Multi-Track DAW Editor   - 10 Virtual Instrument Playgrounds       │
  │   - Expo AV Native Player    - Low-Latency WebAudio Sampler (<10ms)    │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ REST API / WebSocket
  ┌───────────────────────────────────▼────────────────────────────────────┐
  │                 🟢 API GATEWAY (Node.js / Express.js)                  │
  │   - Unified Route Controller  - Fail-Safe Asset Fallback Engine        │
  │   - Auth & Session Validation - Static WAV/MP3 Streaming Engine        │
  └──────────────────┬─────────────────────────────────┬───────────────────┘
                     │                                 │
  ┌──────────────────▼───────────────┐ ┌───────────────▼───────────────────┐
  │  🔮 GANDHARVA-OMNI AI ENGINE     │ │  🐍 PYTHON DUAL-BRAIN & DSP SERVER│
  │   (Lyrics, NIE & Music Director) │ │   (FastAPI / PyTorch / Demucs)    │
  │  - Tier 1: HF Space ZeroGPU 24/7 │ │  - Meta MusicGen 3.3B Engine      │
  │  - Tier 2: Local Ollama Model    │ │  - ACE-Step 8.0 Neural Engine     │
  │  - Tier 3: Zero-Downtime DSP     │ │  - Demucs V4 Stem Separation      │
  └──────────────────────────────────┘ └───────────────────────────────────┘
                     │                                 │
  ┌──────────────────▼─────────────────────────────────▼───────────────────┐
  │                   ☁️ CLOUD DATABASE (Supabase PostgreSQL)               │
  │   - User Auth & RBAC         - Audio Track History & Cloud Storage     │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 4. AI Models & Audio Engines Used

| AI Engine / Model | Purpose | Execution Mode |
| :--- | :--- | :--- |
| **Gandharva-Omni-7B** | Multilingual Lyrics, Story Blueprints (NIE), Prompt Enhancer | Hugging Face ZeroGPU / Local Ollama / Procedural |
| **Meta MusicGen 3.3B** | Text-to-Music Generation & Neural Audio Composition | PyTorch / GPU Cloud / Local LoRA weights |
| **ACE-Step 8.0** | Cinematic Concept Album Soundtrack Generation | PyTorch Dual-Brain GPU |
| **Demucs V4 (Meta)** | AI Source Separation (Vocal, Bass, Drums demixing) | Python DSP Engine |
| **WebAudio Sampler DSP** | Sub-10ms virtual instrument soundfont synthesizer | Client-side Native Browser / Mobile Audio |

---

## 💻 5. How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python 3.10+ (optional, for local GPU server)

### Quick Start in 3 Steps:

```bash
# 1. Clone the repository and install root dependencies
git clone https://github.com/Prasanth4734f/Gandharva-PDD---Web-and-Android.git
cd Gandharva-PDD---Web-and-Android
npm install

# 2. Install server dependencies
cd server
npm install
cd ..

# 3. Launch the application
# Terminal 1: Start Node.js API Server (Port 3000)
node server/index.js

# Terminal 2: Start Expo Web / Mobile Frontend (Port 8081)
npx expo start --web
```

> Open **`http://localhost:8081`** in your browser to start creating music!

---

## 🚀 6. How to Deploy to Production

### 🌐 A. Web Frontend (Vercel / Netlify)
1. Import repository into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Build Command: `npx expo export --platform web` (or `npm run vercel-build`).
3. Set Output Directory: `dist`.
4. Deploy — live with instant global CDN!

### ⚙️ B. Backend API (Render / Railway / Cloud Run)
1. Create a Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set Build Command: `npm install`.
3. Set Start Command: `node server/index.js`.
4. Add environment variables (`PORT=3000`, `SUPABASE_URL`, `SUPABASE_KEY`).

### 📱 C. Standalone Android APK (EAS Cloud Build)
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
*Generates an installable `.apk` file for any Android device in under 5 minutes.*

---

## 📦 7. What is Included in the Sale

Upon purchase, the buyer receives 100% full, exclusive ownership of:

1. **Complete Frontend Source Code**: Full React Native / Expo SDK 54 mobile and web DAW application.
2. **Complete Backend Source Code**: Node.js / Express API gateway + Python FastAPI DSP audio engine.
3. **AI Weights & Model Configurations**: Fine-tuned LoRA weights (`adapter_model.safetensors`), dataset JSONs, and tokenizer configurations.
4. **Complete Sample Soundfont Library**: High-fidelity sound banks for all 10 virtual instruments (Piano, Drums, Flute, Guitar, Strings, etc.).
5. **Database Schemas & SQL Scripts**: Production PostgreSQL schemas with RBAC and GPU registry tables.
6. **Master QA & Test Suite**: Complete E2E automated test reports (Appium Mobile, Selenium Web, Load Testing, Security & Vulnerability reports).
7. **Production Deployment Configurations**: Pre-configured `vercel.json`, `eas.json`, `render.yaml`, `Dockerfile`, and `netlify.toml`.

---

## ⚠️ 8. Known Limitations & Specifications

1. **Heavy Audio GPU Generation**: Real-time neural audio synthesis via 3.3B parameter models requires connection to a GPU instance (Hugging Face ZeroGPU, Kaggle, RunPod, or local NVIDIA GPU). In offline mode, the app seamlessly uses its internal sound bank and procedural engines.
2. **Web Audio Autoplay Policies**: In web browsers, audio playback requires at least one initial user interaction (click/touch) in accordance with standard browser security policies.

---

## 📜 9. License & Commercial Ownership Transfer

- **100% Commercial IP Ownership**: Full intellectual property rights, copyright, and commercial licensing are transferred to the buyer upon completion of the sale.
- **Royalty-Free**: Zero recurring license fees, royalties, or required attribution.
- **Self-Contained**: No required external subscriptions or ongoing API billing dependencies.

---

<div align="center">
  <b>GANDHARVA AI MUSIC STUDIO</b><br/>
  <i>The Ultimate Turnkey AI Music Creation Suite</i>
</div>
