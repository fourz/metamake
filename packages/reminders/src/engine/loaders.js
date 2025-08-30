/*
 * MIT License
 * (c) 2025 fourz
 */

const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Load reminders configuration from YAML file
 * @param {string} configPath Path to the reminders.yml file
 * @returns {Object} Parsed configuration object
 */
function loadReminders(configPath) {
  try {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents);
    
    // Validate required structure
    if (!config.reminders || !Array.isArray(config.reminders)) {
      throw new Error('Configuration must contain a "reminders" array');
    }
    
    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration from ${configPath}: ${error.message}`);
  }
}

module.exports = {
  loadReminders
};