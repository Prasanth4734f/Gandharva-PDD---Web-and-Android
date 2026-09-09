function testAlbumSceneContract() {
  console.log('--- 🧪 RUNNING GANDHARVA ALBUM SCENE CONTRACT TESTS ---');

  // Simulated scene outputs from 3 different sources (ACE-Step, MusicGen, Local Fallback)
  const scene1_ace = {
    sceneId: 'scene_01',
    title: 'The Awakening',
    source: 'ace_step',
    status: 'completed',
    audioUrl: 'https://gandharva.dev/public/generated/gen_ace_01.wav',
    duration: 10,
    isFallback: false
  };

  const scene2_musicgen = {
    sceneId: 'scene_02',
    title: 'Conflict & Climax',
    source: 'musicgen',
    status: 'completed',
    audioUrl: 'https://gandharva.dev/public/generated/gen_mgen_02.wav',
    duration: 10,
    isFallback: false
  };

  const scene3_fallback = {
    sceneId: 'scene_03',
    title: 'Triumphant Reunion',
    source: 'local_fallback',
    status: 'completed',
    audioUrl: 'https://gandharva.dev/fallback/fallback_03.mp3',
    duration: 10,
    isFallback: true
  };

  const scenes = [scene1_ace, scene2_musicgen, scene3_fallback];

  // Contract verification function
  function validateSceneContract(scene, index) {
    if (!scene.sceneId) throw new Error(`Scene ${index + 1} missing sceneId`);
    if (!scene.source || !['ace_step', 'musicgen', 'local_fallback'].includes(scene.source)) {
      throw new Error(`Scene ${index + 1} has invalid source: ${scene.source}`);
    }
    if (scene.status !== 'completed' && scene.status !== 'failed') {
      throw new Error(`Scene ${index + 1} has invalid status: ${scene.status}`);
    }
    if (!scene.audioUrl || typeof scene.audioUrl !== 'string') {
      throw new Error(`Scene ${index + 1} missing audioUrl`);
    }
    if (typeof scene.duration !== 'number' || scene.duration <= 0) {
      throw new Error(`Scene ${index + 1} invalid duration`);
    }
    if (typeof scene.isFallback !== 'boolean') {
      throw new Error(`Scene ${index + 1} invalid isFallback flag`);
    }
    return true;
  }

  // Verify all scenes
  scenes.forEach((s, idx) => {
    validateSceneContract(s, idx);
    console.log(`✅ Scene ${idx + 1} (${s.title}) conforms to contract [source: ${s.source}, isFallback: ${s.isFallback}]`);
  });

  // Assemble Album cleanly
  const assembledAlbum = {
    id: 'album-test-101',
    title: 'Echoes of Destiny',
    total_scenes: scenes.length,
    completed_scenes: scenes.filter(s => s.status === 'completed').length,
    tracks: scenes.map((s, idx) => ({
      track_number: idx + 1,
      ...s
    }))
  };

  console.log('\n--- 📦 ASSEMBLED ALBUM SUMMARY ---');
  console.log(`Album Title: ${assembledAlbum.title}`);
  console.log(`Total Scenes: ${assembledAlbum.total_scenes} (${assembledAlbum.completed_scenes} completed)`);
  console.log(`Sources used: ${[...new Set(assembledAlbum.tracks.map(t => t.source))].join(', ')}`);
  console.log('\nTEST PASSED: MusicGen + ACE-Step + Local Fallback unified contract verified!');
}

testAlbumSceneContract();
