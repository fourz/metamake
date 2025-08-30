/*
 * MIT License
 * (c) 2025 fourz
 */

/**
 * Create a comment on a GitHub issue
 * @param {Octokit} octokit GitHub client
 * @param {string} owner Repository owner
 * @param {string} repo Repository name
 * @param {number} issueNumber Issue number
 * @param {string} body Comment body
 */
async function createIssueComment(octokit, owner, repo, issueNumber, body) {
  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body
    });
  } catch (error) {
    throw new Error(`Failed to create issue comment: ${error.message}`);
  }
}

/**
 * Create a tracking issue for reminders
 * @param {Octokit} octokit GitHub client
 * @param {string} owner Repository owner
 * @param {string} repo Repository name
 * @returns {number} Created issue number
 */
async function createTrackingIssue(octokit, owner, repo) {
  try {
    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title: 'Reminders Log',
      body: `This issue tracks automated reminders from the reminders engine.

## About
This issue is automatically created by the reminders engine to track calendar events, timers, and open-ended reminders.

All reminder comments will be posted to this issue automatically.`
    });
    
    return response.data.number;
  } catch (error) {
    throw new Error(`Failed to create tracking issue: ${error.message}`);
  }
}

module.exports = {
  createIssueComment,
  createTrackingIssue
};