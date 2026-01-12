export interface TimeRange {
  start: string;  // "9:00"
  end: string;    // "17:00"
}

export interface Schedule {
  days: number[] | null;      // [1,2,3,4,5] for Mon-Fri, null = all days
  timeRange: TimeRange | null; // null = all day
}

export interface ParsedEntry {
  path: string;              // "example.com"
  schedule: Schedule | null; // null = 24/7 blocking
}

const DAY_NAMES: Record<string, number> = {
  "Sun": 0,
  "Mon": 1,
  "Tue": 2,
  "Wed": 3,
  "Thu": 4,
  "Fri": 5,
  "Sat": 6,
};

/**
 * Validates if a time string is in valid HH:MM format
 */
export const isValidTime = (time: string): boolean => {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

/**
 * Parses a time range string like "9:00-17:00"
 * Returns null if invalid format
 */
export const parseTimeRange = (timeStr: string): TimeRange | null => {
  const match = timeStr.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
  if (!match) return null;

  const start = match[1];
  const end = match[2];

  if (!isValidTime(start) || !isValidTime(end)) {
    return null;
  }

  return { start, end };
};

/**
 * Parses a day range string like "Mon-Fri" or single day like "Mon"
 * Returns array of day numbers (0=Sunday, 1=Monday, etc.)
 * Returns null if invalid format
 */
export const parseDayRange = (dayStr: string): number[] | null => {
  // Check for single day
  if (DAY_NAMES[dayStr] !== undefined) {
    return [DAY_NAMES[dayStr]];
  }

  // Check for day range
  const match = dayStr.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)-(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
  if (!match) return null;

  const startDay = DAY_NAMES[match[1]];
  const endDay = DAY_NAMES[match[2]];

  // Special case: Sat-Sun (6-0) is valid
  if (startDay === 6 && endDay === 0) {
    return [6, 0];
  }

  // Don't allow other wrapping ranges like "Fri-Mon" or "Sun-Sat"
  if (startDay > endDay) {
    return null;
  }

  // Generate array of days from start to end (inclusive)
  const days: number[] = [];
  for (let i = startDay; i <= endDay; i++) {
    days.push(i);
  }

  return days;
};

/**
 * Parses a site entry with optional time interval and day range
 * Examples:
 *   - "example.com" → { path: "example.com", schedule: null }
 *   - "example.com 9:00-17:00" → { path: "example.com", schedule: { days: null, timeRange: {...} } }
 *   - "facebook.com Mon-Fri 9:00-17:00" → { path: "facebook.com", schedule: { days: [1,2,3,4,5], timeRange: {...} } }
 *   - "youtube.com Sat-Sun" → { path: "youtube.com", schedule: { days: [0,6], timeRange: null } }
 */
export const parseEntry = (entry: string): ParsedEntry => {
  // Strip comments (everything after #)
  const cleanEntry = entry.split("#")[0].trim();

  // Split by whitespace
  const parts = cleanEntry.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { path: "", schedule: null };
  }

  // First part is always the path
  const path = parts[0];

  // If only one part, no schedule
  if (parts.length === 1) {
    return { path, schedule: null };
  }

  // Try to parse remaining parts for days and time
  let days: number[] | null = null;
  let timeRange: TimeRange | null = null;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    // Try to parse as time range
    if (!timeRange) {
      const parsedTime = parseTimeRange(part);
      if (parsedTime) {
        timeRange = parsedTime;
        continue;
      }
    }

    // Try to parse as day range
    if (!days) {
      const parsedDays = parseDayRange(part);
      if (parsedDays) {
        days = parsedDays;
        continue;
      }
    }
  }

  // If we found either days or time, create a schedule
  if (days || timeRange) {
    return {
      path,
      schedule: {
        days,
        timeRange,
      },
    };
  }

  // No valid schedule found, fall back to 24/7
  return { path, schedule: null };
};
