import { isTimeInRange, isDayInRange, isWithinSchedule } from "../check-schedule";
import { Schedule, TimeRange } from "../parse-time-interval";

describe("isTimeInRange", () => {
  test("time within normal range", () => {
    const timeRange: TimeRange = { start: "9:00", end: "17:00" };

    // 12:00 is within 9:00-17:00
    const noon = new Date("2024-01-15T12:00:00");
    expect(isTimeInRange(noon, timeRange)).toBe(true);

    // 9:00 is within 9:00-17:00 (inclusive start)
    const start = new Date("2024-01-15T09:00:00");
    expect(isTimeInRange(start, timeRange)).toBe(true);

    // 17:00 is within 9:00-17:00 (inclusive end)
    const end = new Date("2024-01-15T17:00:00");
    expect(isTimeInRange(end, timeRange)).toBe(true);
  });

  test("time outside normal range", () => {
    const timeRange: TimeRange = { start: "9:00", end: "17:00" };

    // 8:00 is before 9:00-17:00
    const before = new Date("2024-01-15T08:00:00");
    expect(isTimeInRange(before, timeRange)).toBe(false);

    // 18:00 is after 9:00-17:00
    const after = new Date("2024-01-15T18:00:00");
    expect(isTimeInRange(after, timeRange)).toBe(false);

    // Midnight is outside 9:00-17:00
    const midnight = new Date("2024-01-15T00:00:00");
    expect(isTimeInRange(midnight, timeRange)).toBe(false);
  });

  test("overnight range (22:00-6:00)", () => {
    const overnightRange: TimeRange = { start: "22:00", end: "6:00" };

    // 23:00 is within 22:00-6:00
    const lateNight = new Date("2024-01-15T23:00:00");
    expect(isTimeInRange(lateNight, overnightRange)).toBe(true);

    // 0:00 is within 22:00-6:00
    const midnight = new Date("2024-01-15T00:00:00");
    expect(isTimeInRange(midnight, overnightRange)).toBe(true);

    // 5:00 is within 22:00-6:00
    const earlyMorning = new Date("2024-01-15T05:00:00");
    expect(isTimeInRange(earlyMorning, overnightRange)).toBe(true);

    // 22:00 is within 22:00-6:00 (inclusive start)
    const start = new Date("2024-01-15T22:00:00");
    expect(isTimeInRange(start, overnightRange)).toBe(true);

    // 6:00 is within 22:00-6:00 (inclusive end)
    const end = new Date("2024-01-15T06:00:00");
    expect(isTimeInRange(end, overnightRange)).toBe(true);

    // 12:00 is outside 22:00-6:00
    const noon = new Date("2024-01-15T12:00:00");
    expect(isTimeInRange(noon, overnightRange)).toBe(false);

    // 21:00 is outside 22:00-6:00
    const evening = new Date("2024-01-15T21:00:00");
    expect(isTimeInRange(evening, overnightRange)).toBe(false);

    // 7:00 is outside 22:00-6:00
    const morning = new Date("2024-01-15T07:00:00");
    expect(isTimeInRange(morning, overnightRange)).toBe(false);
  });

  test("with minutes", () => {
    const timeRange: TimeRange = { start: "8:30", end: "18:45" };

    // 8:31 is within 8:30-18:45
    const justAfterStart = new Date("2024-01-15T08:31:00");
    expect(isTimeInRange(justAfterStart, timeRange)).toBe(true);

    // 8:29 is outside 8:30-18:45
    const justBeforeStart = new Date("2024-01-15T08:29:00");
    expect(isTimeInRange(justBeforeStart, timeRange)).toBe(false);

    // 18:44 is within 8:30-18:45
    const justBeforeEnd = new Date("2024-01-15T18:44:00");
    expect(isTimeInRange(justBeforeEnd, timeRange)).toBe(true);

    // 18:46 is outside 8:30-18:45
    const justAfterEnd = new Date("2024-01-15T18:46:00");
    expect(isTimeInRange(justAfterEnd, timeRange)).toBe(false);
  });
});

describe("isDayInRange", () => {
  test("null days (all days)", () => {
    const monday = new Date("2024-01-15T12:00:00"); // Monday
    const sunday = new Date("2024-01-14T12:00:00"); // Sunday

    expect(isDayInRange(monday, null)).toBe(true);
    expect(isDayInRange(sunday, null)).toBe(true);
  });

  test("weekdays (Mon-Fri)", () => {
    const weekdays = [1, 2, 3, 4, 5]; // Mon-Fri

    const monday = new Date("2024-01-15T12:00:00");
    expect(isDayInRange(monday, weekdays)).toBe(true);

    const friday = new Date("2024-01-19T12:00:00");
    expect(isDayInRange(friday, weekdays)).toBe(true);

    const saturday = new Date("2024-01-20T12:00:00");
    expect(isDayInRange(saturday, weekdays)).toBe(false);

    const sunday = new Date("2024-01-21T12:00:00");
    expect(isDayInRange(sunday, weekdays)).toBe(false);
  });

  test("weekend (Sat-Sun)", () => {
    const weekend = [6, 0]; // Sat-Sun

    const saturday = new Date("2024-01-20T12:00:00");
    expect(isDayInRange(saturday, weekend)).toBe(true);

    const sunday = new Date("2024-01-21T12:00:00");
    expect(isDayInRange(sunday, weekend)).toBe(true);

    const monday = new Date("2024-01-15T12:00:00");
    expect(isDayInRange(monday, weekend)).toBe(false);

    const friday = new Date("2024-01-19T12:00:00");
    expect(isDayInRange(friday, weekend)).toBe(false);
  });

  test("single day", () => {
    const mondayOnly = [1];

    const monday = new Date("2024-01-15T12:00:00");
    expect(isDayInRange(monday, mondayOnly)).toBe(true);

    const tuesday = new Date("2024-01-16T12:00:00");
    expect(isDayInRange(tuesday, mondayOnly)).toBe(false);
  });
});

describe("isWithinSchedule", () => {
  test("null schedule (24/7)", () => {
    const anytime = new Date("2024-01-15T12:00:00");
    expect(isWithinSchedule(null, anytime)).toBe(true);

    const midnight = new Date("2024-01-15T00:00:00");
    expect(isWithinSchedule(null, midnight)).toBe(true);
  });

  test("time only schedule", () => {
    const schedule: Schedule = {
      days: null,
      timeRange: { start: "9:00", end: "17:00" },
    };

    // Within time range
    const noon = new Date("2024-01-15T12:00:00");
    expect(isWithinSchedule(schedule, noon)).toBe(true);

    // Outside time range
    const evening = new Date("2024-01-15T20:00:00");
    expect(isWithinSchedule(schedule, evening)).toBe(false);
  });

  test("days only schedule", () => {
    const schedule: Schedule = {
      days: [1, 2, 3, 4, 5], // Mon-Fri
      timeRange: null,
    };

    // Weekday
    const monday = new Date("2024-01-15T12:00:00");
    expect(isWithinSchedule(schedule, monday)).toBe(true);

    // Weekend
    const saturday = new Date("2024-01-20T12:00:00");
    expect(isWithinSchedule(schedule, saturday)).toBe(false);
  });

  test("days and time schedule", () => {
    const schedule: Schedule = {
      days: [1, 2, 3, 4, 5], // Mon-Fri
      timeRange: { start: "9:00", end: "17:00" },
    };

    // Monday noon - within schedule
    const mondayNoon = new Date("2024-01-15T12:00:00");
    expect(isWithinSchedule(schedule, mondayNoon)).toBe(true);

    // Monday evening - correct day but wrong time
    const mondayEvening = new Date("2024-01-15T20:00:00");
    expect(isWithinSchedule(schedule, mondayEvening)).toBe(false);

    // Saturday noon - correct time but wrong day
    const saturdayNoon = new Date("2024-01-20T12:00:00");
    expect(isWithinSchedule(schedule, saturdayNoon)).toBe(false);

    // Saturday evening - wrong day and wrong time
    const saturdayEvening = new Date("2024-01-20T20:00:00");
    expect(isWithinSchedule(schedule, saturdayEvening)).toBe(false);
  });

  test("weekend all day", () => {
    const schedule: Schedule = {
      days: [6, 0], // Sat-Sun
      timeRange: null,
    };

    // Saturday at any time - within schedule
    const saturdayMorning = new Date("2024-01-20T06:00:00");
    expect(isWithinSchedule(schedule, saturdayMorning)).toBe(true);

    const saturdayNight = new Date("2024-01-20T23:00:00");
    expect(isWithinSchedule(schedule, saturdayNight)).toBe(true);

    // Monday - outside schedule
    const monday = new Date("2024-01-15T12:00:00");
    expect(isWithinSchedule(schedule, monday)).toBe(false);
  });

  test("overnight schedule", () => {
    const schedule: Schedule = {
      days: null,
      timeRange: { start: "22:00", end: "6:00" },
    };

    // 23:00 - within schedule
    const lateNight = new Date("2024-01-15T23:00:00");
    expect(isWithinSchedule(schedule, lateNight)).toBe(true);

    // 3:00 - within schedule
    const earlyMorning = new Date("2024-01-15T03:00:00");
    expect(isWithinSchedule(schedule, earlyMorning)).toBe(true);

    // 12:00 - outside schedule
    const noon = new Date("2024-01-15T12:00:00");
    expect(isWithinSchedule(schedule, noon)).toBe(false);
  });

  test("uses current time when not provided", () => {
    const schedule: Schedule = {
      days: null,
      timeRange: null,
    };

    // Should not throw and should return true for null timeRange
    expect(isWithinSchedule(schedule)).toBe(true);
  });
});
