import { Schedule, TimeRange } from "./parse-time-interval";

/**
 * Checks if the current time is within a time range
 * Handles overnight ranges (e.g., 22:00-6:00)
 */
export const isTimeInRange = (now: Date, timeRange: TimeRange): boolean => {
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  // Parse start time
  const [startHours, startMinutes] = timeRange.start.split(":").map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;

  // Parse end time
  const [endHours, endMinutes] = timeRange.end.split(":").map(Number);
  const endTimeInMinutes = endHours * 60 + endMinutes;

  // Handle overnight range (e.g., 22:00-6:00)
  if (startTimeInMinutes > endTimeInMinutes) {
    // Current time is in range if it's >= start OR <= end
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
  }

  // Normal range (e.g., 9:00-17:00)
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

/**
 * Checks if the current day is within the specified days
 * null days means all days are included
 */
export const isDayInRange = (now: Date, days: number[] | null): boolean => {
  if (days === null) {
    return true; // All days
  }

  const currentDay = now.getDay();
  return days.includes(currentDay);
};

/**
 * Checks if the current time matches the schedule
 * null schedule means 24/7 (always matches)
 * null timeRange means all day
 * null days means all days
 */
export const isWithinSchedule = (schedule: Schedule | null, now: Date = new Date()): boolean => {
  // No schedule means 24/7 blocking
  if (schedule === null) {
    return true;
  }

  // Check day
  if (!isDayInRange(now, schedule.days)) {
    return false;
  }

  // Check time
  if (schedule.timeRange === null) {
    return true; // All day
  }

  return isTimeInRange(now, schedule.timeRange);
};
