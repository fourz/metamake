#!/usr/bin/env node
/*
 * MIT License
 * (c) 2025 fourz
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { Octokit } = require('octokit');
const { DateTime } = require('luxon');

// Import our modules
const { loadReminders } = require('../src/engine/loaders');
const { ReminderEngine } = require('../src/engine/index');
const { createIssueComment, createTrackingIssue } = require('../src/engine/actions');

async function main() {
  try {
    // Environment variables
    const isDryRun = process.env.DRY_RUN === 'true';
    const autoCreateTracking = process.env.AUTO_CREATE_TRACKING === '1';
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.error('ERROR: GITHUB_TOKEN environment variable is required');
      process.exit(1);
    }

    console.log(`Starting reminders engine (DRY_RUN: ${isDryRun})`);
    console.log(`Timestamp: ${DateTime.now().toISO()}`);

    // Initialize GitHub client
    const octokit = new Octokit({ auth: githubToken });

    // Load configuration
    const configPath = path.join(process.cwd(), '.github', 'reminders.yml');
    if (!fs.existsSync(configPath)) {
      console.error(`ERROR: Configuration file not found: ${configPath}`);
      process.exit(1);
    }

    const config = loadReminders(configPath);
    console.log(`Loaded ${config.reminders.length} reminder(s) from configuration`);

    // Initialize reminder engine
    const engine = new ReminderEngine(config.settings || {});

    // Process each reminder
    for (const reminder of config.reminders) {
      try {
        console.log(`\nProcessing reminder: ${reminder.name} (type: ${reminder.type})`);
        
        const shouldTrigger = await engine.shouldTrigger(reminder);
        
        if (shouldTrigger.trigger) {
          console.log(`✓ Reminder triggered: ${shouldTrigger.reason}`);
          
          // Render the message template
          const message = engine.renderTemplate(reminder.template, {
            prefix: reminder.prefix || '',
            minutes_until: shouldTrigger.minutesUntil || 0,
            event_summary: shouldTrigger.eventSummary || '',
            event_start_local: shouldTrigger.eventStartLocal || '',
            timestamp: DateTime.now().toISO()
          });

          console.log(`Rendered message: ${message}`);

          if (!isDryRun) {
            // Get repository info from GitHub context
            const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'fourz/metamake').split('/');
            
            // Check if tracking issue exists, create if needed
            let issueNumber = reminder.tracking_issue;
            if (!issueNumber && autoCreateTracking) {
              console.log('Auto-creating tracking issue...');
              issueNumber = await createTrackingIssue(octokit, owner, repo);
            }

            if (issueNumber) {
              await createIssueComment(octokit, owner, repo, issueNumber, message);
              console.log(`✓ Comment posted to issue #${issueNumber}`);
            } else {
              console.log('⚠ No tracking issue specified and auto-create disabled');
            }
          } else {
            console.log('📝 DRY_RUN: Would post comment to tracking issue');
          }
        } else {
          console.log(`⏭ Skipping: ${shouldTrigger.reason}`);
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.name}:`, error.message);
      }
    }

    console.log('\n✓ Reminders processing complete');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}