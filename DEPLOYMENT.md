# 🚀 Gandharva AI Music Studio — Complete Production Deployment Guide

Deploy **Gandharva AI Music Studio** across **Web**, **Android Mobile (APK)**, and **Cloud Backend API** with full **Admin Control**.

---

## 🌟 Architecture Overview

```
                          ┌────────────────────────┐
                          │   Supabase Postgres    │
                          │   (Auth, RLS, Storage) │
                          └───────────▲────────────┘
                                      │
 ┌───────────────────────┐   ┌────────┴───────────────┐   ┌────────────────────────┐
 │   Vercel / Netlify    │   │  Node.js Express API   │   │   Kaggle / HuggingFace │
 │  Web App (React/Expo) ├──►│  (Render / Railway /   ├──►│   Dual-Brain Omni-7B   │
 └───────────────────────┘   │   Google Cloud Run)    │   │   32kHz Audio Engine   │
 ┌───────────────────────┐   └────────▲───────────────┘   └────────────────────────┘
 │   Android Mobile App  │            │
 │   (.apk Standalone)   ├────────────┘
 └───────────────────────┘
```

---

## 1. 🌐 Web Frontend Deployment (Vercel / Netlify)

### Option A: Vercel (Recommended - 2 Minutes)
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Connect your GitHub repository: `https://github.com/Prasanth4734f/Gandharva-PDD---Web-and-Android`.
3. Vercel will automatically detect `vercel.json`:
   * **Framework Preset**: Other
   * **Build Command**: `npx expo export --platform web`
   * **Output Directory**: `dist`
4. Add Environment Variable:
   * `EXPO_PUBLIC_API_URL` = `https://your-backend-api.onrender.com` (or your live backend URL)
5. Click **Deploy**. Your web app is live on `https://gandharva-studio.vercel.app`!

---

## 2. ⚙️ Backend API & Admin Dashboard Deployment (Render / Railway)

### Option A: Render (Free Tier)
1. Go to [render.com](https://render.com) and click **"New Web Service"**.
2. Connect the repository `Gandharva-PDD---Web-and-Android`.
3. Configure settings:
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server/index.js`
4. Set Environment Variables:
   * `NODE_ENV` = `production`
   * `ADMIN_PIN` = `240899`
   * `JWT_SECRET` = `(Generate a secure random string)`
   * `SUPABASE_URL` = `https://rslvwhvcvvljzwhovkux.supabase.co`
   * `SUPABASE_SERVICE_ROLE_KEY` = `(Your Supabase Service Key)`
5. Click **Create Web Service**. Your API is live at `https://gandharva-backend.onrender.com`!

---

## 3. 📱 Android APK Generation (EAS Build)

### Method 1: Cloud EAS Build (Generate `.apk` in 5 Minutes)
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Build the standalone Android APK:
   ```bash
   eas build -p android --profile preview
   ```
4. Once completed, EAS will provide a direct download link for the `.apk` file to install on any Android phone!

---

## 4. 🛡️ Admin Portal Access & Management

Once deployed, the Admin Portal is accessible directly from both the **Web Application** and the **Android Mobile App**:

1. Click on the **Security Shield Icon 🛡️** in the top-right corner of the Login Screen.
2. Enter the **Master Security PIN**: `240899`.
3. You will be authenticated with `adminToken` and redirected to `/admin-dashboard`.
4. From the **Admin Dashboard**, you can:
   * **Live Server Telemetry**: Monitor CPU load, memory utilization, and active socket connections.
   * **AI Backbone Switching**: Toggle between `Gandharva Omni-7B` and `MusicGen Local Engine`.
   * **Cache Purge**: Flush temporary audio latents and Redis/memory cache.
   * **Maintenance Mode**: Activate one-click maintenance banner across web and mobile clients.
   * **User Quota Control**: View generation stats and reset rate limits.
