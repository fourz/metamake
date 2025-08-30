/*
 * MIT License
 * (c) 2025 fourz
 */

const { DateTime } = require('luxon');
const { parseCalendarEvents } = require('../integrations/calendar');
const { TimerManager } = require('../integrations/timers');

/**
 * Main reminder engine class
 */
class ReminderEngine {
  constructor(settings = {}) {
    this.settings = settings;
    this.timerManager = new TimerManager();
  }

  /**
   * Check if a reminder should trigger
   * @param {Object} reminder Reminder configuration
   * @returns {Object} { trigger: boolean, reason: string, ...additionalData }
   */
  async shouldTrigger(reminder) {
    switch (reminder.type) {
      case 'calendar_event':
        return this._checkCalendarEvent(reminder);
      case 'timer':
        return this._checkTimer(reminder);
      case 'open_ended':
        return this._checkOpenEnded(reminder);
      default:
        return { trigger: false, reason: `Unknown reminder type: ${reminder.type}` };
    }
  }

  /**
   * Render a template string with variables
   * @param {string} template Template string with {{variable}} placeholders
   * @param {Object} variables Variables to substitute
   * @returns {string} Rendered string
   */
  renderTemplate(template, variables) {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(pattern, String(value));
    }
    return rendered;
  }

  /**
   * Check if a calendar event reminder should trigger
   * @private
   */
  async _checkCalendarEvent(reminder) {
    try {
      const calendarSettings = this.settings.calendar || {};
      if (!calendarSettings.ics_file) {
        return { trigger: false, reason: 'No calendar ICS file configured' };
      }

      const events = await parseCalendarEvents(calendarSettings.ics_file);
      const now = DateTime.now();
      
      const lookAhead = reminder.look_ahead_minutes || 15;
      const lookBehind = reminder.look_behind_minutes || 5;
      const leadTime = reminder.lead_time_minutes || 10;

      for (const event of events) {
        const eventStart = DateTime.fromJSDate(event.start);
        const minutesUntil = eventStart.diff(now, 'minutes').minutes;

        // Check if event is within our window
        const inLookWindow = minutesUntil >= -lookBehind && minutesUntil <= lookAhead;
        const inLeadWindow = Math.abs(minutesUntil - leadTime) <= 1; // 1 minute tolerance

        if (inLookWindow && inLeadWindow) {
          // Check optional summary regex
          if (reminder.summary_regex) {
            const regex = new RegExp(reminder.summary_regex, 'i');
            if (!regex.test(event.summary || '')) {
              continue;
            }
          }

          return {
            trigger: true,
            reason: `Calendar event "${event.summary}" in ${Math.round(minutesUntil)} minutes`,
            minutesUntil: Math.round(minutesUntil),
            eventSummary: event.summary || 'Untitled Event',
            eventStartLocal: eventStart.toLocaleString(DateTime.DATETIME_FULL)
          };
        }
      }

      return { trigger: false, reason: 'No matching calendar events found' };
    } catch (error) {
      return { trigger: false, reason: `Calendar check failed: ${error.message}` };
    }
  }

  /**
   * Check if a timer reminder should trigger
   * @private
   */
  _checkTimer(reminder) {
    const intervalMinutes = reminder.interval_minutes || 60;
    const shouldFire = this.timerManager.shouldFire(reminder.name, intervalMinutes);
    
    if (shouldFire) {
      this.timerManager.recordFiring(reminder.name);
      return {
        trigger: true,
        reason: `Timer fired after ${intervalMinutes} minute interval`
      };
    }
    
    return {
      trigger: false,
      reason: `Timer not ready (interval: ${intervalMinutes} minutes)`
    };
  }

  /**
   * Check if an open-ended reminder should trigger
   * @private
   */
  _checkOpenEnded(reminder) {
    const everyMinutes = reminder.every_minutes || 5;
    const shouldFire = this.timerManager.shouldFire(reminder.name, everyMinutes);
    
    if (shouldFire) {
      this.timerManager.recordFiring(reminder.name);
      return {
        trigger: true,
        reason: `Open-ended reminder fired (every ${everyMinutes} minutes)`
      };
    }
    
    return {
      trigger: false,
      reason: `Open-ended reminder not ready (every: ${everyMinutes} minutes)`
    };
  }
}

module.exports = { ReminderEngine };