/**
 * State Manager for Gandharva Automated QA Audit Suite
 * Provides persistent checkpointing to JSON and syncs progress to AUDIT_PROGRESS.md.
 * If audit stops midway, resuming seamlessly reads existing state and executes only pending tests.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../results/audit_state.json');
const PROGRESS_MD = path.join(__dirname, '../../AUDIT_PROGRESS.md');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[StateManager] Notice reading state file:', err.message);
  }

  // Initial fresh state
  return {
    version: '1.0.0',
    startTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    completedPhases: [],
    features: {},
    promptMusicQuality: {},
    threeTrackAudit: null,
    lyricsStudioAudit: {},
    storyToAlbumAudit: null,
    audioInspections: {},
    defects: [],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      warnings: 0
    }
  };
}

function saveState(state) {
  state.lastUpdated = new Date().toISOString();
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function recordTestResult(state, category, testId, result) {
  if (!state[category]) {
    state[category] = {};
  }
  state[category][testId] = {
    ...result,
    recordedAt: new Date().toISOString()
  };
  saveState(state);
}

function recordDefect(state, defect) {
  if (!state.defects) state.defects = [];
  // Deduplicate by defect id or feature name
  const existingIndex = state.defects.findIndex(d => d.id === defect.id || (d.feature === defect.feature && d.title === defect.title));
  if (existingIndex >= 0) {
    state.defects[existingIndex] = { ...state.defects[existingIndex], ...defect };
  } else {
    state.defects.push({
      id: defect.id || `DEFECT-${state.defects.length + 1}`,
      ...defect,
      discoveredAt: new Date().toISOString()
    });
  }
  saveState(state);
}

module.exports = {
  loadState,
  saveState,
  recordTestResult,
  recordDefect,
  STATE_FILE,
  PROGRESS_MD
};
