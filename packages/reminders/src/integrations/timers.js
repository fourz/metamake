/*
 * MIT License
 * (c) 2025 fourz
 */

/**
 * In-memory timer manager for tracking firing intervals
 * Note: This is a simple in-memory implementation.
 * For production use across multiple process instances,
 * consider using external storage (Redis, file system, etc.)
 */
class TimerManager {
  constructor() {
    this.lastFired = new Map();
  }

  /**
   * Check if a timer should fire based on its interval
   * @param {string} timerId Unique identifier for the timer
   * @param {number} intervalMinutes Interval in minutes
   * @returns {boolean} True if the timer should fire
   */
  shouldFire(timerId, intervalMinutes) {
    const now = Date.now();
    const lastTime = this.lastFired.get(timerId);
    
    if (!lastTime) {
      // First time firing
      return true;
    }
    
    const intervalMs = intervalMinutes * 60 * 1000;
    const timeSinceLast = now - lastTime;
    
    return timeSinceLast >= intervalMs;
  }

  /**
   * Record that a timer has fired
   * @param {string} timerId Unique identifier for the timer
   */
  recordFiring(timerId) {
    this.lastFired.set(timerId, Date.now());
  }

  /**
   * Get the last firing time for a timer
   * @param {string} timerId Unique identifier for the timer
   * @returns {number|null} Last firing timestamp or null if never fired
   */
  getLastFiredTime(timerId) {
    return this.lastFired.get(timerId) || null;
  }

  /**
   * Reset a timer (useful for testing)
   * @param {string} timerId Unique identifier for the timer
   */
  resetTimer(timerId) {
    this.lastFired.delete(timerId);
  }

  /**
   * Clear all timers
   */
  clearAll() {
    this.lastFired.clear();
  }
}

module.exports = { TimerManager };