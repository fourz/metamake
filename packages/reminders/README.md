# Metamake Reminders Engine

A GitHub Actions based reminder system that runs every 5 minutes to post reminder comments on tracking issues based on calendar (ICS) events, interval timers, and open-ended repeating tasks.

## Features

- **Calendar Integration**: Parse local ICS files for event-based reminders with configurable lead times
- **Interval Timers**: Fire reminders at specified minute intervals  
- **Open-ended Reminders**: Repeating reminders that fire every N minutes
- **Template Variables**: Dynamic message rendering with context-aware variables
- **GitHub Integration**: Automatic issue commenting with auto-creation of tracking issues
- **Dry-run Mode**: Test reminders without actual posting

## Usage

The reminders engine runs automatically via GitHub Actions every 5 minutes. You can also trigger it manually:

```bash
# Manual run (from repository root)
node packages/reminders/scripts/run-reminders.js

# With environment variables
GITHUB_TOKEN=your_token DRY_RUN=true node packages/reminders/scripts/run-reminders.js
```

## Configuration

Configure reminders in `.github/reminders.yml`:

```yaml
settings:
  calendar:
    ics_file: "packages/reminders/calendar/events.ics"

reminders:
  - name: "daily-standup"
    type: "calendar_event"
    tracking_issue: 1
    template: "📅 Daily standup in {{minutes_until}} minutes!"
    look_ahead_minutes: 30
    lead_time_minutes: 10
```

### Reminder Types

#### Calendar Events (`calendar_event`)
Triggers based on calendar events in ICS files.

**Configuration:**
- `look_ahead_minutes`: How far ahead to look for events (default: 15)
- `look_behind_minutes`: How far behind to still trigger (default: 5) 
- `lead_time_minutes`: Minutes before event to trigger (default: 10)
- `summary_regex`: Optional regex to match event summaries

#### Timers (`timer`)
Triggers at fixed intervals.

**Configuration:**
- `interval_minutes`: Minutes between triggers (default: 60)

#### Open-ended (`open_ended`)
Triggers repeatedly at regular intervals.

**Configuration:**
- `every_minutes`: Minutes between triggers (default: 5)

## Template Variables

All reminder templates support these variables:

- `{{prefix}}`: Configured prefix (e.g., emoji)
- `{{minutes_until}}`: Minutes until event (calendar events only)
- `{{event_summary}}`: Event title (calendar events only)
- `{{event_start_local}}`: Formatted event start time (calendar events only)  
- `{{timestamp}}`: Current ISO timestamp

## Environment Variables

- `GITHUB_TOKEN`: Required for posting comments
- `DRY_RUN`: Set to `true` to log actions without posting
- `AUTO_CREATE_TRACKING`: Set to `1` to auto-create tracking issues

## Development Notes

### Architecture

```
src/
├── engine/
│   ├── index.js          # Main ReminderEngine class
│   ├── loaders.js        # Configuration loading
│   └── actions.js        # GitHub API interactions
├── integrations/
│   ├── calendar.js       # ICS file parsing
│   └── timers.js         # In-memory timer management
└── metamake-embed/
    └── core.js           # Metamake framework integration
```

### Testing

Test individual components:

```bash
cd packages/reminders

# Test configuration loading
node -e "console.log(require('./src/engine/loaders').loadReminders('../../.github/reminders.yml'))"

# Test calendar parsing  
node -e "require('./src/integrations/calendar').parseCalendarEvents('calendar/events.ics').then(console.log)"
```

### Adding New Reminder Types

1. Add type handling in `src/engine/index.js` `shouldTrigger()` method
2. Implement type-specific logic as private method
3. Add integration files in `src/integrations/` if needed
4. Update configuration documentation

## Metamake Integration

The reminders engine integrates with Metamake's document-based workflow:

- Uses Metamake's project structure conventions
- Implements task registry pattern for solution tracking
- Follows documentation-as-code principles
- Supports feature documentation and validation checklists

For Metamake-specific usage patterns, see the main repository documentation and the `src/metamake-embed/core.js` adapter.

## License

MIT License (c) 2025 fourz