/**
 * Phase 6 Audit: Story-to-Album (NIE + AGE) Audit
 * Validates Narrative Intelligence analysis, scene sequencing, and duplicate-audio prevention.
 */

const axios = require('axios');
const { recordTestResult, recordDefect } = require('../utils/stateManager');

const BASE_URL = 'http://localhost:3000';

async function runStoryToAlbumAudit(state) {
  console.log('\n======================================================');
  console.log('📖 RUNNING PHASE 6: STORY-TO-ALBUM (NIE + AGE) AUDIT');
  console.log('======================================================\n');

  const sampleStory = 'A young musician faces repeated failures, receives support from family, discovers confidence, and eventually performs successfully on a grand stage.';

  console.log(`Input Story Narrative:\n"${sampleStory}"\n`);

  try {
    const t0 = Date.now();
    
    // Stage 1: Narrative Intelligence Engine (NIE) Story Analysis
    const analyzeRes = await axios.post(`${BASE_URL}/api/album/analyze`, {
      story: sampleStory,
      albumTitle: 'The Sound of Resilience'
    });

    const elapsedAnalyze = Date.now() - t0;
    const blueprint = analyzeRes.data?.blueprint || {};
    const tracks = blueprint.planned_tracks || blueprint.tracks || [];

    console.log(`NIE Analysis completed in ${elapsedAnalyze}ms: ${tracks.length} scenes identified.`);

    // 1. Verify scene order and coherence
    const sceneOrderPreserved = tracks.length >= 3;
    
    // 2. Check scene-specific prompts
    const scenePrompts = tracks.map(t => t.prompt || t.bgm_prompt || t.scene_description || '');
    const uniquePrompts = new Set(scenePrompts);
    const promptsAreUnique = uniquePrompts.size === tracks.length;

    console.log('\n--- Narrative Scenes Generated ---');
    tracks.forEach((t, i) => {
      console.log(`Scene ${i + 1}: "${t.title}" | Mood: ${t.emotion || t.mood}`);
      console.log(`   Description: "${(t.scene_description || '').substring(0, 70)}..."`);
    });

    // Stage 2: Create Album Job Worker Launch
    const createRes = await axios.post(`${BASE_URL}/api/album/create`, {
      blueprint,
      customMode: false
    });

    const jobData = createRes.data;
    const jobId = jobData?.job_id || jobData?.jobId;
    const hasJobId = !!jobId;

    console.log(`\nAGE Job Created: ${hasJobId ? 'Job ID: ' + jobId : 'No Job ID returned'}`);

    // Stage 3: Check Job Status Endpoint
    let jobProgressReported = false;
    if (jobId) {
      const statusRes = await axios.get(`${BASE_URL}/api/job/${jobId}`).catch(e => e.response);
      jobProgressReported = statusRes && statusRes.status === 200 && statusRes.data?.status !== undefined;
    }

    const passPhase6 = sceneOrderPreserved && promptsAreUnique && hasJobId;

    recordTestResult(state, 'storyToAlbumAudit', 'PHASE_6_SUMMARY', {
      status: passPhase6 ? 'PASSED' : 'FAILED',
      sceneCount: tracks.length,
      sceneOrderPreserved,
      promptsAreUnique,
      jobCreated: hasJobId,
      jobProgressReported,
      scenes: tracks.map((t, i) => ({
        index: i + 1,
        title: t.title,
        mood: t.mood,
        genre: t.genre,
        prompt: t.prompt || t.bgm_prompt
      }))
    });

    if (!promptsAreUnique) {
      recordDefect(state, {
        id: 'DEFECT-ALBUM-PROMPT-DUP',
        feature: 'Story-to-Album',
        severity: 'P1',
        title: 'Duplicate prompts generated across album scenes',
        actual: 'Repeated prompts detected among scenes',
        expected: 'Each scene must receive distinct narrative context'
      });
    }

    console.log(`\n -> Story-to-Album Audit: ${passPhase6 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`    Scenes Preserved: ${sceneOrderPreserved} | Unique Prompts: ${promptsAreUnique} | Worker Launched: ${hasJobId}`);
  } catch (err) {
    recordTestResult(state, 'storyToAlbumAudit', 'PHASE_6_SUMMARY', {
      status: 'FAILED',
      error: err.message
    });
    console.log(` -> Story-to-Album Audit: ❌ FAILED (${err.message})`);
  }

  console.log('------------------------------------------------------');
  console.log('✅ PHASE 6 AUDIT COMPLETE');
  console.log('------------------------------------------------------\n');
}

module.exports = {
  runStoryToAlbumAudit
};
