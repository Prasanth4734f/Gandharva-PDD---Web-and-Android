# 🚀 Gandharva AI Music Studio — Complete Production Deployment Guide

Deploy **Gandharva AI Music Studio** across **Web**, **Android Mobile (APK)**, and **Cloud Backend API** with full **Dual-Brain AI Engine** and **Admin Control**.

---

## 🌟 1. Architecture Overview

```
                                  ┌────────────────────────┐
                                  │   Supabase Postgres    │
                                  │   (Auth, RLS, Storage) │
                                  └───────────▲────────────┘
                                              │
  ┌───────────────────────┐          ┌────────┴───────────────┐          ┌────────────────────────┐
  │   Vercel / Netlify    │          │  Node.js Express API   │          │   HuggingFace / RunPod │
  │  Web App (React/Expo) ├─────────►│  (Render / Railway /   ├─────────►│   Dual-Brain Omni-7B   │
  └───────────────────────┘          │   Google Cloud Run)    │          │   32kHz Audio Engine   │
  ┌───────────────────────┐          └────────▲───────────────┘          └────────────────────────┘
  │   Android Mobile App  │                   │
  │   (.apk Standalone)   ├───────────────────┘
  └───────────────────────┘
```

---

## 🔑 2. Production Environment Variables Reference

### Backend (`server/.env` or Cloud Provider Secret Settings)
| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `PORT` | Optional | Port for Express server | `3000` or `5000` |
| `NODE_ENV` | Yes | Runtime environment | `production` |
| `ADMIN_PIN` | Yes | Master Security PIN for Admin Portal | `240899` |
| `JWT_SECRET` | Yes | Secret used to sign admin session tokens | *(Generate 32-char random string)* |
| `SMTP_USER` | Yes | Gmail address for sending verification OTPs | `your-email@gmail.com` |
| `SMTP_PASS` | Yes | 16-character Google App Password (without spaces) | `xxxx xxxx xxxx xxxx` |
| `SMTP_HOST` | Optional | SMTP Host | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP Port (SSL) | `465` |
| `SMTP_FROM` | Optional | Display name in outgoing OTP emails | `"Gandharva AI Studio" <your-email@gmail.com>` |
| `SUPABASE_URL` | Yes | Supabase Project URL | `https://rslvwhvcvvljzwhovkux.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Service Role Key (Server-side only) | *(Secret from Supabase dashboard)* |
| `SUPABASE_ANON_KEY` | Optional | Supabase Anon Key | *(Public key from Supabase dashboard)* |
| `GANDHARVA_OMNI_API_URL` | Optional | Primary AI Model Hugging Face Space / Endpoint | `https://prasanthm4734f-gandharva-omni-model.hf.space` |
| `AI_ENGINE_URL` | Optional | Dynamic GPU fallback or self-hosted endpoint | `https://your-gpu-instance.runpod.net` |

### Frontend (`.env` or Cloud Provider Environment Settings)
| Variable | Required | Description | Example |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | Yes | Full URL pointing to live Node.js Express backend | `https://gandharva-backend.onrender.com` |
| `EXPO_PUBLIC_SUPABASE_URL` | Optional | Client Supabase URL for direct auth | `https://rslvwhvcvvljzwhovkux.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`| Optional | Client Supabase Anon Key | *(Public anon key)* |

---

## 🤖 3. AI Backbone & GPU Deployment Guide

Gandharva leverages a Dual-Brain architecture:
1. **Semantic Prompt Director:** Analyzes user narrative, emotion, instruments, and pacing (in-memory execution with sub-millisecond latency).
2. **Omni-7B Audio Synthesis Model:** Synthesizes 32kHz studio-grade audio tracks.

### Option A: Free Hugging Face ZeroGPU (Default Public Tier)
- **Endpoint:** `https://prasanthm4734f-gandharva-omni-model.hf.space`
- **Gradio 5 SSE Route:** `/gradio_api/call/generate_music`
- **Queue Dynamics:**
  - Pure inference time per track is ~18–20 seconds.
  - ZeroGPU assigns compute on demand; during peak hours, queue contention introduces a 60–90s wait per track.
  - **ZeroGPU Concurrency Lock:** Free ZeroGPU rejects simultaneous requests from the same session (`event: error; data: null`). The Gandharva backend automatically sequences 3 variations with distinct seeds and targeted retries.
  - Backend and frontend timeouts are pre-configured to **120,000 ms** to survive public queue contention without connection drops.

### Option B: Dedicated GPU Space (Recommended for Production Sub-30s Generation)
For commercial deployments requiring instant multi-track parallel generation:
1. On Hugging Face Spaces, navigate to `prasanthm4734f-gandharva-omni-model` -> **Settings** -> **Space Hardware**.
2. Upgrade from ZeroGPU to **Nvidia T4 (Small)** or **Nvidia A10G (Large)**.
3. With dedicated VRAM, the backend can process all 3 variations in parallel batch mode, reducing total turnaround to **under 25 seconds**.
4. Set `GANDHARVA_OMNI_API_URL` in your backend environment to your dedicated space URL.

---

## 📧 4. Production Mail & OTP Configuration

Gandharva uses real 6-digit OTP delivery via `nodemailer` with high-priority transactional headers.

### Step-by-Step Gmail SMTP Setup:
1. Enable **2-Step Verification** on your Google Account: [myaccount.google.com/security](https://myaccount.google.com/security).
2. Generate an **App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   - Enter App Name: `Gandharva Studio`.
   - Copy the generated 16-character code (e.g. `abcd efgh ijkl mnop`).
3. Set in your server environment:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_PORT=465
   ```
4. **Network Precaution Handled:** Node.js v20+ on certain residential and cloud networks defaults to IPv6 DNS queries for `smtp.gmail.com`, causing `connect ENETUNREACH`. Gandharva includes automatic IPv4 socket resolution (`dns.setDefaultResultOrder('ipv4first')`) to ensure 100% reliable delivery.
5. **No Demo Fallback:** If SMTP credentials fail, the server rejects requests with actionable HTTP 500 error instructions rather than exposing dummy codes or compromising security.

---

## 💾 5. Audio File Persistence & Static Assets

Generated AI audio files are written to:
```
server/public/generated/gen_<timestamp>_<variation>_<salt>.wav
```
Served publicly via Express at `/public/generated/*.wav`.

- **On Single-Instance Clouds (Render / Railway with Persistent Volume):**
  Mount a persistent disk to `server/public/generated` to retain tracks across container restarts.
- **On Ephemeral Clouds (Vercel Serverless / Google Cloud Run):**
  Configure Supabase Storage bucket upload in `aiGeneratorService.js` to persist audio buffers to object storage.

---

## 🌐 6. Web Frontend Deployment (Vercel / Netlify)

### Option A: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Connect your GitHub repository: `Prasanth4734f/Gandharva-PDD---Web-and-Android`.
3. Configure build settings:
   - **Framework Preset**: Other
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
4. Configure Environment Variables:
   - `EXPO_PUBLIC_API_URL` = `https://your-backend-api.onrender.com`
5. Click **Deploy**.

---

## ⚙️ 7. Backend API Deployment (Render / Railway / Cloud Run)

### Option A: Render
1. Go to [render.com](https://render.com) and click **"New Web Service"**.
2. Connect the repository `Gandharva-PDD---Web-and-Android`.
3. Configure:
   - **Root Directory**: Leave blank or set to `.`
   - **Build Command**: `npm install && cd server && npm install`
   - **Start Command**: `node server/index.js`
4. Add all environment variables from Section 2.
5. Click **Create Web Service**.

---

## 📱 8. Android Standalone APK Build (EAS CLI)

Build a production or preview `.apk` for direct installation on Android devices:

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Ensure `eas.json` is configured with `buildType: "apk"`:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         },
         "env": {
           "EXPO_PUBLIC_API_URL": "https://your-live-backend.onrender.com"
         }
       }
     }
   }
   ```
4. Build the standalone Android APK:
   ```bash
   eas build -p android --profile preview
   ```
5. Download and install the `.apk` directly onto any Android device.

---

## 🛡️ 9. Admin Portal Access & Management

1. Access the login screen on Web or Mobile.
2. Tap the **Security Shield Icon 🛡️** in the top navigation bar.
3. Enter Master Security PIN: `240899`.
4. The Admin Dashboard provides:
   - **Live Telemetry:** Server memory, CPU, uptime, and active connections.
   - **AI Backbone Switching:** Switch between live Omni-7B and fallback models.
   - **Audio Purge:** Flush old cached WAV files from `server/public/generated/`.
   - **Maintenance Mode:** Instant platform-wide maintenance banner toggle.

---

## 🧪 10. Smoke Testing & Verification

Run the automated verification suite to validate all recovery priorities:
```bash
node server/test_verification.js
```
Expected output:
```
====================================================
📊 VERIFICATION SUMMARY RESULTS:
====================================================
TEST A (Authentication Integrity):  ✅ PASS
TEST B (Three Music Variations):    ✅ PASS
TEST C (Generation Performance):     ✅ PASS
TEST D (Emotional Preservation):    ✅ PASS
TEST E (Complete Song Lyrics):      ✅ PASS
TEST F (No Fallback / Real Errors):  ✅ PASS
TEST G (Route Regression Safety):   ✅ PASS
====================================================
```
