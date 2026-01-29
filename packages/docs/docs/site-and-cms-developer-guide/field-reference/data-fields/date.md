---
sidebar_position: 4
---

# Date Field

The `date` field generates a date picker for selecting dates and times.

![Date field](/img/fields/date1.png)

![Date field with time](/img/fields/date2.png)

## Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `key` | string | Yes | - | Unique identifier for the field |
| `title` | string | No | - | Display label |
| `tip` | string | No | null | Help text with markdown support |
| `default` | string | No | null | Default value (ISO 8601 format or 'now') |
| `autoSave` | boolean | No | false | Auto-save form after changing value |
| `date` | boolean | No | true | Enable date selection |
| `time` | boolean | No | false | Enable time selection |

## Examples

### Example 1: Date Only

**Configuration:**

```yaml
key: publish_date
title: Publish Date
type: date
default: now
date: true
time: false
```

**Output:**

```yaml
publish_date: 2026-01-29
```

### Example 2: Date and Time

**Configuration:**

```yaml
key: event_datetime
title: Event Date & Time
type: date
date: true
time: true
tip: When will this event take place?
```

**Output:**

```yaml
event_datetime: 2026-01-29T14:30:00Z
```

### Example 3: Time Only

**Configuration:**

```yaml
key: meeting_time
title: Meeting Time
type: date
date: false
time: true
```

**Output:**

```yaml
meeting_time: 14:30:00
```

## Output Formats

The field outputs dates in ISO 8601 format:

- **Date only**: `YYYY-MM-DD` (e.g., `2026-01-29`)
- **Date and time**: `YYYY-MM-DDTHH:MM:SSZ` (e.g., `2026-01-29T14:30:00Z`)
- **Time only**: `HH:MM:SS` (e.g., `14:30:00`)

## Use Cases

- **Publishing**: Publish dates, expiration dates
- **Events**: Event dates, deadlines, milestones
- **Scheduling**: Meeting times, appointment slots
- **Metadata**: Created dates, modified dates

## Special Values

- `now` - Sets default to current date/time
- Empty/null - No default value

## Related Fields

- [String](./string.md) - For custom date formats as text
- [Hidden](./hidden.md) - For system-managed dates
