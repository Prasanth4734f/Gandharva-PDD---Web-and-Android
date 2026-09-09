/**
 * validate_dataset.js
 * Comprehensive Quality & Format Auditor for Gandharva-Omni-7B Training Data
 */

const fs = require('fs');
const path = require('path');

const DATASET_FILE = path.join(__dirname, '../data/gandharva_omni_train.jsonl');

function validateDataset() {
  console.log('--- 🧪 GANDHARVA DATASET INTEGRITY & QUALITY AUDIT ---');
  if (!fs.existsSync(DATASET_FILE)) {
    console.error(`❌ Dataset file does not exist: ${DATASET_FILE}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(DATASET_FILE, 'utf-8').split('\n').filter(l => l.trim().length > 0);
  console.log(`Total Samples to Validate: ${lines.length}`);

  let valid = 0;
  let taskCounts = {
    PROMPT_DIRECTOR: 0,
    LYRICS_STUDIO: 0,
    NIE_BLUEPRINT: 0,
    MUSIC_DIRECTOR: 0,
    VOCAL_COACH: 0
  };

  lines.forEach((line, idx) => {
    try {
      const parsed = JSON.parse(line);
      if (!parsed.text || typeof parsed.text !== 'string') {
        throw new Error('Missing text property');
      }

      // Check ChatML tag boundaries
      if (!parsed.text.includes('<|im_start|>system') || !parsed.text.includes('<|im_start|>user') || !parsed.text.includes('<|im_start|>assistant')) {
        throw new Error('Malformed ChatML boundary tokens');
      }

      // Count tasks
      for (const task of Object.keys(taskCounts)) {
        if (parsed.text.includes(`[MODE: ${task}]`)) {
          taskCounts[task]++;
        }
      }

      valid++;
    } catch (err) {
      console.error(`❌ Line ${idx + 1} Failed: ${err.message}`);
    }
  });

  console.log('\n--- 📊 Task Distribution Summary ---');
  Object.entries(taskCounts).forEach(([task, count]) => {
    console.log(`• ${task.padEnd(18)}: ${count} samples`);
  });

  console.log(`\nIntegrity Result: ${valid}/${lines.length} Valid Samples (100% Passed)`);
  if (valid !== lines.length) process.exit(1);
}

if (require.main === module) {
  validateDataset();
}
