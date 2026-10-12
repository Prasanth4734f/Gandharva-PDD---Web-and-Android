/**
 * Post-Audit Deep Verification: Story-to-Album Project Generation & Scene Audio Integrity
 * Tests Items 6, 7, and 8:
 * - Generate a complete Story-to-Album project
 * - Verify every scene has its own valid, playable audio
 * - Check for accidental duplicate tracks and incorrect audio references
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';

async function verifyStoryToAlbum() {
  console.log('========================================================');
  console.log('📖 POST-AUDIT VERIFICATION: STORY-TO-ALBUM COMPLETE AUDIT');
  console.log('========================================================\n');

  const storyText = 
    "An ambitious young woman leaves her rural village in Andhra Pradesh to pursue computational astrophysics. " +
    "Facing financial strain and cultural isolation in a bustling metro, she almost gives up. " +
    "A mentor reignites her confidence, leading her team to detect a rare gravitational wave ripple. " +
    "She returns home to celebrate with her village, honored as a pioneering scientist.";

  console.log(`Story Narrative: "${storyText}"\n`);

  // Step 1: NIE Story Analysis
  console.log('Step 1: Calling NIE Analysis (POST /api/album/analyze)...');
  const tStartAnalyze = Date.now();
  let analyzeRes;
  try {
    analyzeRes = await axios.post(`${BASE_URL}/api/album/analyze`, {
      story: storyText,
      language: 'English',
      numLyrics: 5,
      numBgms: 5,
      preferredGenre: 'Cinematic'
    }, { timeout: 45000 });
  } catch (err) {
    console.error('❌ NIE Analysis Failed:', err.message, err.response?.data);
    return;
  }

  const analyzeDuration = ((Date.now() - tStartAnalyze) / 1000).toFixed(1);
  console.log(`✅ NIE Analysis Completed in ${analyzeDuration}s`);
  const blueprint = analyzeRes.data?.blueprint;
  if (!blueprint) {
    console.error('❌ No blueprint returned from NIE');
    return;
  }

  console.log(`Album Title: "${blueprint.title}"`);
  console.log(`Genre: ${blueprint.genre} | Subgenre: ${blueprint.subgenre}`);
  console.log(`Planned Tracks Count: ${blueprint.planned_tracks?.length}`);
  blueprint.planned_tracks?.forEach((t, i) => {
    console.log(`  Scene ${i + 1}: "${t.title}" | Emotion: ${t.emotion} | Instruments: ${(t.instruments || []).join(', ')}`);
  });

  // Step 2: AGE Job Worker Launch
  console.log('\nStep 2: Launching AGE Generation Job (POST /api/album/create)...');
  let createRes;
  try {
    createRes = await axios.post(`${BASE_URL}/api/album/create`, {
      blueprint
    }, { timeout: 15000 });
  } catch (err) {
    console.error('❌ AGE Job Launch Failed:', err.message, err.response?.data);
    return;
  }

  const jobId = createRes.data?.job_id;
  const albumId = createRes.data?.album_id;
  console.log(`✅ Job Created successfully! Job ID: ${jobId} | Album ID: ${albumId}`);

  // Step 3: Poll Job to Completion
  console.log('\nStep 3: Polling Job Status (GET /api/job/:id)...');
  const tStartJob = Date.now();
  let jobCompleted = false;
  let finalJobData = null;

  for (let poll = 0; poll < 60; poll++) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const jobPoll = await axios.get(`${BASE_URL}/api/job/${jobId}`);
      const job = jobPoll.data?.job;
      const progress = job?.progress || 0;
      const step = job?.current_step || '';
      console.log(`  [Poll ${poll + 1}] Progress: ${progress}% | Step: "${step}"`);

      if (job?.status === 'completed' || progress >= 100) {
        jobCompleted = true;
        finalJobData = job;
        break;
      }
      if (job?.status === 'failed') {
        console.error('❌ Job reported failed status');
        return;
      }
    } catch (pollErr) {
      console.warn(`  [Poll ${poll + 1}] Warning: ${pollErr.message}`);
    }
  }

  const jobDuration = ((Date.now() - tStartJob) / 1000).toFixed(1);
  if (!jobCompleted) {
    console.error(`❌ Job did not complete within timeout (${jobDuration}s)`);
    return;
  }

  console.log(`✅ AGE Job Completed successfully in ${jobDuration}s\n`);

  // Step 4: Fetch Album Details
  console.log(`Step 4: Fetching Generated Album (GET /api/album/${albumId})...`);
  let albumRes;
  try {
    albumRes = await axios.get(`${BASE_URL}/api/album/${albumId}`);
  } catch (err) {
    console.error('❌ Failed to fetch album:', err.message);
    return;
  }

  const album = albumRes.data?.album;
  if (!album) {
    console.error('❌ Album payload empty');
    return;
  }

  console.log(`Album Retrieved: "${album.title}"`);
  console.log(`Cover URL: ${album.cover_url}`);
  console.log(`Total Generated Scenes / Tracks: ${album.tracks?.length}\n`);

  // Step 5: Verify Every Scene Track and Audio Playability
  console.log('========================================================');
  console.log('🔍 SCENE-BY-SCENE VERIFICATION & AUDIO AUDIT');
  console.log('========================================================\n');

  const seenAudioUrls = new Map();
  const seenAudioHashes = new Map();
  let allTracksValid = true;

  for (let i = 0; i < album.tracks.length; i++) {
    const track = album.tracks[i];
    console.log(`--------------------------------------------------------`);
    console.log(`Track ${i + 1}: "${track.title}" (Scene ID: ${track.sceneId || i + 1})`);
    console.log(`Mood / Emotion: ${track.emotion}`);
    console.log(`Lyrics Snippet: "${(track.lyrics || '').substring(0, 80).replace(/\n/g, ' ')}..."`);
    console.log(`Audio URL: ${track.audioUrl || track.url}`);
    console.log(`Audio Variations Available: ${track.variations?.length || 0}`);

    const primaryAudioUrl = track.audioUrl || track.url;
    if (!primaryAudioUrl) {
      console.error(`❌ Track ${i + 1} has no audio URL!`);
      allTracksValid = false;
      continue;
    }

    // Check Duplicate URL References
    if (seenAudioUrls.has(primaryAudioUrl)) {
      console.warn(`⚠️ Warning: Duplicate Audio URL detected! Already used by Scene ${seenAudioUrls.get(primaryAudioUrl)}`);
    } else {
      seenAudioUrls.set(primaryAudioUrl, i + 1);
    }

    // Test Audio Stream & Playability
    try {
      const headRes = await axios.get(primaryAudioUrl, {
        headers: { Range: 'bytes=0-1024' },
        timeout: 10000
      });
      const contentLength = headRes.headers['content-length'] || headRes.headers['content-range'];
      const contentType = headRes.headers['content-type'];
      console.log(`Playability Check: HTTP ${headRes.status} | Content-Type: ${contentType} | Size Header: ${contentLength}`);
      if (headRes.status !== 200 && headRes.status !== 206) {
        console.error(`❌ Track ${i + 1} Audio returned non-OK status: ${headRes.status}`);
        allTracksValid = false;
      }
    } catch (streamErr) {
      console.error(`❌ Track ${i + 1} Audio Stream failed: ${streamErr.message}`);
      allTracksValid = false;
    }

    // Check local disk file if URL is relative or points to local server
    try {
      let localPath = null;
      if (primaryAudioUrl.includes('/public/generated/')) {
        const fname = path.basename(primaryAudioUrl);
        localPath = path.join(__dirname, '../../server/public/generated', fname);
      } else if (primaryAudioUrl.includes('/fallback/')) {
        const fname = path.basename(primaryAudioUrl);
        const p1 = path.join(__dirname, '../../server/assets/fallback_music', fname);
        const p2 = path.join(__dirname, '../../server/public/fallback', fname);
        if (fs.existsSync(p1)) localPath = p1;
        else if (fs.existsSync(p2)) localPath = p2;
      }

      if (localPath && fs.existsSync(localPath)) {
        const stat = fs.statSync(localPath);
        const buffer = fs.readFileSync(localPath);
        const hash = crypto.createHash('md5').update(buffer.subarray(0, Math.min(100000, buffer.length))).digest('hex');
        console.log(`Disk Verification: Exists (${(stat.size / 1024 / 1024).toFixed(2)} MB) | MD5 Head Hash: ${hash}`);

        if (seenAudioHashes.has(hash)) {
          console.log(`ℹ️ Track audio content matches Scene ${seenAudioHashes.get(hash)} (Pre-set fallback track reference)`);
        } else {
          seenAudioHashes.set(hash, i + 1);
        }
      } else if (localPath) {
        console.error(`❌ Local file not found at: ${localPath}`);
        allTracksValid = false;
      }
    } catch (fileErr) {
      console.warn(`File verification note: ${fileErr.message}`);
    }
  }

  console.log('\n========================================================');
  console.log('🏁 STORY-TO-ALBUM VERIFICATION SUMMARY:');
  console.log(`- NIE Analysis Latency: ${analyzeDuration}s`);
  console.log(`- AGE Total Job Latency: ${jobDuration}s`);
  console.log(`- Total Scenes Generated: ${album.tracks?.length}`);
  console.log(`- All Scenes Have Playable Audio: ${allTracksValid ? '✅ YES' : '❌ NO'}`);
  console.log(`- Distinct Audio References: ${seenAudioUrls.size} unique URLs across ${album.tracks?.length} scenes`);
  console.log('========================================================\n');
}

verifyStoryToAlbum();
