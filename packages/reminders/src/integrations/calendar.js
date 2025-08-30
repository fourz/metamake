/*
 * MIT License
 * (c) 2025 fourz
 */

const fs = require('fs');
const ical = require('ical');

/**
 * Parse calendar events from an ICS file
 * @param {string} icsFilePath Path to the ICS file
 * @returns {Array} Array of calendar events
 */
async function parseCalendarEvents(icsFilePath) {
  try {
    if (!fs.existsSync(icsFilePath)) {
      console.warn(`Calendar file not found: ${icsFilePath}`);
      return [];
    }

    const data = await ical.parseFile(icsFilePath);
    const events = [];

    for (const key in data) {
      const event = data[key];
      if (event.type === 'VEVENT') {
        events.push({
          uid: event.uid,
          summary: event.summary,
          start: event.start,
          end: event.end,
          description: event.description,
          location: event.location
        });
      }
    }

    return events;
  } catch (error) {
    throw new Error(`Failed to parse calendar file ${icsFilePath}: ${error.message}`);
  }
}

/**
 * TODO: Future enhancement for remote calendar fetching
 * @param {string} url Remote calendar URL
 * @returns {Array} Array of calendar events
 */
async function fetchRemoteCalendar(url) {
  // Placeholder for future remote calendar fetching
  // This would use fetch/axios to retrieve remote ICS files
  throw new Error('Remote calendar fetching not yet implemented');
}

module.exports = {
  parseCalendarEvents,
  fetchRemoteCalendar
};