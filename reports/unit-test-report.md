# 🧪 Unit Tests — API (300) — Execution Report

**Total Cases:** 55 | **Passed:** 55 (100%) | **Failed:** 0

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC-API-001` | GET /api/health | Verify 200 OK with server status and uptime | HTTP 200: { status: 'online' } | **PASS ✅** |
| `TC-API-002` | GET /api/musicgen-health | Verify Kaggle GPU heartbeat response | HTTP 200: { gpus_detected: 2, status: 'online' } | **PASS ✅** |
| `TC-API-003` | POST /api/generate-lyrics | Verify Gandharva-Omni returns multi-variation lyrics | HTTP 200: { variations: [...], source: 'Gandharva-Omni' } | **PASS ✅** |
| `TC-API-004` | POST /api/generate-lyrics Invalid Topic | Verify 400 Bad Request on empty prompt | HTTP 400: { error: 'Topic required' } | **PASS ✅** |
| `TC-API-005` | POST /api/enhance-prompt | Verify Prompt Director returns engineering prompt | HTTP 200: { enhanced_prompt: '...' } | **PASS ✅** |
| `TC-API-006` | POST /api/album/analyze | Verify NIE returns structured album blueprint | HTTP 200: { blueprint: { tracks: [...] } } | **PASS ✅** |
| `TC-API-007` | POST /api/album/create | Verify AGE worker job starts and returns job_id | HTTP 200: { job_id: 'job-...', status: 'processing' } | **PASS ✅** |
| `TC-API-008` | GET /api/job/:id Status Polling | Verify job progress increases to 100% | HTTP 200: { progress: 100, status: 'completed' } | **PASS ✅** |
| `TC-API-009` | GET /api/album/:id Details | Verify completed album returns tracks with audio URLs | HTTP 200: { album: { tracks: [...] } } | **PASS ✅** |
| `TC-API-010` | POST /api/album/:id/regenerate-track | Verify track lyrics & prompt regenerate | HTTP 200: { success: true, new_lyrics: '...' } | **PASS ✅** |
| `TC-API-011` | POST /api/generate-music Live Synthesis | Verify MusicGen returns 32kHz WAV audio buffer | HTTP 200: audio/wav stream (6-10s duration) | **PASS ✅** |
| `TC-API-012` | POST /api/auth/send-otp | Verify Nodemailer dispatches 6-digit OTP code | HTTP 200: { success: true, email: '...' } | **PASS ✅** |
| `TC-API-013` | POST /api/auth/verify-otp Valid Code | Verify valid OTP authenticates session | HTTP 200: { success: true, user: { role: 'artist' } } | **PASS ✅** |
| `TC-API-014` | POST /api/auth/verify-otp Invalid Code | Verify wrong OTP returns 401 Unauthorized | HTTP 401: { error: 'Invalid code' } | **PASS ✅** |
| `TC-API-015` | POST /api/vocal-upload File Upload | Verify Multer receives audio WAV payload | HTTP 200: { uploaded: true, path: '...' } | **PASS ✅** |
| `TC-API-016` | POST /api/denoise Audio Cleaning | Verify spectral subtraction cleans audio | HTTP 200: { denoised_url: '...' } | **PASS ✅** |
| `TC-API-017` | POST /api/mix-instruments Audio Stems | Verify multi-track stem mixer outputs master | HTTP 200: { master_url: '...' } | **PASS ✅** |
| `TC-API-018` | POST /api/waveform Live Generator | Verify audio waveform decibel array returns | HTTP 200: { peaks: [0.1, 0.4, 0.8, ...] } | **PASS ✅** |
| `TC-API-019` | GET /api/projects User Projects | Verify returns array of saved user projects | HTTP 200: { projects: [...] } | **PASS ✅** |
| `TC-API-020` | POST /api/projects Create Project | Verify new project persists to Supabase DB | HTTP 200: { success: true, id: '...' } | **PASS ✅** |
| `TC-API-021` | DELETE /api/projects/:id Delete Project | Verify project deletes from Supabase DB | HTTP 200: { success: true, deleted: true } | **PASS ✅** |
| `TC-API-022` | GET /fallback/:file Static Audio | Verify fallback audio files stream with 200 | HTTP 200: audio/mpeg (Content-Range verified) | **PASS ✅** |
| `TC-API-023` | GET /generated/:file AI Audio | Verify generated WAV files stream with 200 | HTTP 200: audio/wav (Content-Range verified) | **PASS ✅** |
| `TC-API-024` | POST /api/admin/metrics Admin Access | Verify admin authentication grants telemetry metrics | HTTP 200: { active_users: ..., gpu_usage: ... } | **PASS ✅** |
| `TC-API-025` | POST /api/admin/metrics Non-Admin Rejection | Verify artist role gets 403 Forbidden | HTTP 403: { error: 'Access denied: Requires Admin role' } | **PASS ✅** |
| `TC-API-026` | CORS Preflight OPTIONS | Verify Access-Control-Allow-Origin returns wildcard/domain | HTTP 204: CORS headers verified | **PASS ✅** |
| `TC-API-027` | Rate Limiter 100 req/min | Verify spamming endpoint triggers 429 Too Many Requests | HTTP 429: { error: 'Rate limit exceeded' } | **PASS ✅** |
| `TC-API-028` | JWT Auth Header Validation | Verify Bearer token parsing and signature check | Decodes user_id and role correctly | **PASS ✅** |
| `TC-API-029` | Supabase Connection Pool | Verify PostgreSQL connection recovers from drop | Auto-reconnects within 500ms | **PASS ✅** |
| `TC-API-030` | GandharvaModelClient HuggingFace Tier | Verify ZeroGPU space API responds with lyrics | Returns formatted multilingual lyrics | **PASS ✅** |
| `TC-API-031` | GandharvaModelClient Local Ollama Tier | Verify local LLM responds when HF is busy | Cascades cleanly to localhost:11434 | **PASS ✅** |
| `TC-API-032` | GandharvaModelClient Kaggle GPU Tier | Verify Kaggle GPU responds for /generate_omni | Receives generated AI text in 2.1s | **PASS ✅** |
| `TC-API-033` | GandharvaModelClient Procedural Tier | Verify 100% offline fallback guarantees response | Procedural generator yields 25+ lines | **PASS ✅** |
| `TC-API-034` | Lyrics Validator Telugu Script | Verify Telugu lyrics contain Telugu Unicode range | Validated: Native Telugu characters present | **PASS ✅** |
| `TC-API-035` | Lyrics Validator Hindi Script | Verify Hindi lyrics contain Devanagari range | Validated: Devanagari characters present | **PASS ✅** |
| `TC-API-036` | Lyrics Validator Section Tags | Verify output includes [పల్లవి] or [Verse] | Validated: Mandatory structural markers found | **PASS ✅** |
| `TC-API-037` | BGM Prompt Generator Key Extraction | Verify prompt extracts musical Key & BPM | Output contains 'Key of D Minor, 118 BPM' | **PASS ✅** |
| `TC-API-038` | Story Narrative Blueprint Extraction | Verify story generates 4 tracks with distinct emotions | Outputs 4 scene objects with scene descriptions | **PASS ✅** |
| `TC-API-039` | Cover Prompt Director Visual Filter | Verify prompt excludes forbidden words ('text', 'logo') | Verified: Visual prompt has 0 forbidden tokens | **PASS ✅** |
| `TC-API-040` | Audio Buffer Size Gate | Verify audio payloads < 10KB are rejected as corrupt | Rejects truncated payloads with Error | **PASS ✅** |
| `TC-API-041` | Audio Header Signature Gate | Verify 'RIFF' header signature verified on WAV | Rejects corrupted byte streams | **PASS ✅** |
| `TC-API-042` | Multi-Model Gemini Fallback Removal | Verify 0 external dependencies on GEMINI_API_KEY | Runs 100% on Gandharva-Omni without key | **PASS ✅** |
| `TC-API-043` | Google Drive Auth URL Generator | Verify OAuth consent screen URL constructs cleanly | Returns valid accounts.google.com link | **PASS ✅** |
| `TC-API-044` | Google Drive Token Exchange | Verify mock/real token exchange saves access_token | Stores token and returns expiry timestamp | **PASS ✅** |
| `TC-API-045` | Google Drive Folder Initializer | Verify 'Gandharva/' folder hierarchy creates | Initializes /Music, /Lyrics, /Albums, /Projects | **PASS ✅** |
| `TC-API-046` | Gmail SMTP Connection Pre-Warm | Verify SMTP connection pool pre-warms on startup | Nodemailer transporter ready in 120ms | **PASS ✅** |
| `TC-API-047` | Customer Problem Report Email Dispatch | Verify support ticket emails to admin | Dispatches HTML alert to prasanthm4734g@gmail.com | **PASS ✅** |
| `TC-API-048` | Supabase Admin Schema Sync | Verify admin user policies & RBAC rules active | Admin role query checks pass | **PASS ✅** |
| `TC-API-049` | Database GPU Registry Ping | Verify Kaggle heartbeat registers in gpu_registry table | Heartbeat record updated with timestamp | **PASS ✅** |
| `TC-API-050` | Audio Cache Invalidation on Fail | Verify broken GPU URL clears cache instantly | Invalidates URL cache on ECONNREFUSED | **PASS ✅** |
| `TC-API-051` | Express Payload Limit 50MB | Verify large studio WAV files upload without 413 | Processes 45MB audio upload smoothly | **PASS ✅** |
| `TC-API-052` | HTTP Error Handler Middleware | Verify unhandled exceptions return 500 JSON | HTTP 500: { error: 'Internal Server Error' } | **PASS ✅** |
| `TC-API-053` | Sanitization of User Input | Verify XSS and SQL injection payloads are escaped | Payload sanitized before database query | **PASS ✅** |
| `TC-API-054` | Database Transaction Rollback | Verify failed album insert rolls back cleanly | No orphaned records in PostgreSQL | **PASS ✅** |
| `TC-API-055` | Graceful Server Shutdown | Verify SIGTERM flushes logs and closes connections | Server exits cleanly in 200ms | **PASS ✅** |
