/*
 * MIT License
 * (c) 2025 fourz
 */

/**
 * Simple task registry adapter for integrating with Metamake workflow
 * This provides a bridge between the reminders engine and Metamake's
 * document-based solution implementation framework.
 */
class MetamakeTaskRegistry {
  constructor() {
    this.tasks = new Map();
    this.categories = ['reminders', 'calendar', 'timers'];
  }

  /**
   * Register a reminder task with the Metamake system
   * @param {string} id Unique task identifier
   * @param {Object} task Task configuration
   */
  registerTask(id, task) {
    const metamakeTask = {
      id,
      name: task.name,
      type: task.type,
      category: 'reminders',
      description: task.description || `${task.type} reminder: ${task.name}`,
      metadata: {
        reminderType: task.type,
        trackingIssue: task.tracking_issue,
        template: task.template,
        settings: { ...task }
      },
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.tasks.set(id, metamakeTask);
    return metamakeTask;
  }

  /**
   * Get all registered tasks
   * @returns {Array} Array of registered tasks
   */
  getTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a specific task by ID
   * @param {string} id Task identifier
   * @returns {Object|null} Task object or null if not found
   */
  getTask(id) {
    return this.tasks.get(id) || null;
  }

  /**
   * Update task status
   * @param {string} id Task identifier
   * @param {string} status New status
   */
  updateTaskStatus(id, status) {
    const task = this.tasks.get(id);
    if (task) {
      task.status = status;
      task.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Generate a task summary for Metamake documentation
   * @returns {string} Markdown formatted summary
   */
  generateTaskSummary() {
    const tasks = this.getTasks();
    const tasksByType = tasks.reduce((acc, task) => {
      const type = task.metadata.reminderType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(task);
      return acc;
    }, {});

    let summary = '# Reminders Engine Task Registry\n\n';
    summary += `Total registered tasks: ${tasks.length}\n\n`;

    for (const [type, typeTasks] of Object.entries(tasksByType)) {
      summary += `## ${type.charAt(0).toUpperCase() + type.slice(1)} Reminders (${typeTasks.length})\n\n`;
      for (const task of typeTasks) {
        summary += `- **${task.name}** (${task.status}): ${task.description}\n`;
      }
      summary += '\n';
    }

    return summary;
  }
}

// Export a singleton instance for global use
const taskRegistry = new MetamakeTaskRegistry();

module.exports = {
  MetamakeTaskRegistry,
  taskRegistry
};