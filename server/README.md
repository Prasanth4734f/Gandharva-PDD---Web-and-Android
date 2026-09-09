# Gandharva Music Generation Backend

A high-performance AI music generation and local asset fallback engine designed for Anti Gravity AI projects. It processes natural language prompts via primary MusicGen AI generation, and provides an API-free local fallback music library containing pre-approved audio assets if AI GPUs are temporarily offline.

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Setup Environment**:
   Ensure you have a `.env` file in the `server` directory with the following content:
   ```env
   PORT=3000
   DEBUG=true
   ```

3. **Start the Server**:
   ```bash
   npm start
   ```

## 📡 API Endpoint

### POST `/api/generate-music`

**Request Body**:
```json
{
  "prompt": "Chill lofi calm music at forest",
  "duration": 10
}
```

**Successful Response (Primary AI)**:
```json
{
  "success": true,
  "title": "AI: Chill lofi calm music...",
  "audioUrl": "https://.../public/generated/gen_12345.wav",
  "source": "Kaggle AI (MusicGen Medium)",
  "isFallback": false
}
```

**Fallback Response (When AI GPU is Offline)**:
```json
{
  "success": true,
  "title": "Fallback: Forest Breeze",
  "audioUrl": "https://.../fallback/fallback_01.mp3",
  "source": "local_fallback",
  "isFallback": true
}
```

## 📁 Architecture
- `src/controllers`: Request handling and orchestration.
- `src/services`: Primary AI generators, prompt enhancers, and audio helpers.
- `assets/fallback_music`: API-free local fallback music library containing pre-approved audio assets.
- `src/utils`: Logging and helper utilities.
- `src/routes`: API endpoint definitions.
