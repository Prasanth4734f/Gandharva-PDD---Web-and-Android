const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const PromptEnhancer = require('./promptEnhancer');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Load system prompt from system_prompt.txt
const SYSTEM_PROMPT_PATH = path.join(__dirname, 'system_prompt.txt');
let GANDHARVA_SYSTEM_PROMPT = '';
try {
  GANDHARVA_SYSTEM_PROMPT = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf-8');
} catch (e) {
  logger.warn(`[Prompt Director] Could not read system_prompt.txt: ${e.message}`);
}

const GandharvaModelClient = require('./gandharvaModelClient');

class PromptDirector {
  static async enhance(userPrompt) {
    if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
      return userPrompt || '';
    }

    const cleanPrompt = userPrompt.trim();
    try {
      const enhanced = await GandharvaModelClient.generate('PROMPT_DIRECTOR', cleanPrompt, { temperature: 0.75 });
      if (enhanced && enhanced.length > 20) {
        return enhanced;
      }
    } catch (e) {
      logger.warn(`[Prompt Director] Custom client fallback note: ${e.message}`);
    }

    return PromptEnhancer.enhance(cleanPrompt);
  }
}

module.exports = PromptDirector;
