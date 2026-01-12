import { isValidTime, parseTimeRange, parseDayRange, parseEntry } from "../parse-time-interval";

describe("isValidTime", () => {
  test("valid times", () => {
    expect(isValidTime("9:00")).toBe(true);
    expect(isValidTime("17:00")).toBe(true);
    expect(isValidTime("0:00")).toBe(true);
    expect(isValidTime("23:59")).toBe(true);
    expect(isValidTime("08:30")).toBe(true);
  });

  test("invalid times", () => {
    expect(isValidTime("25:00")).toBe(false);
    expect(isValidTime("9:70")).toBe(false);
    expect(isValidTime("24:00")).toBe(false);
    expect(isValidTime("abc")).toBe(false);
    expect(isValidTime("9:0")).toBe(false); // minutes must be 2 digits
    expect(isValidTime("9")).toBe(false);
  });
});

describe("parseTimeRange", () => {
  test("valid time ranges", () => {
    expect(parseTimeRange("9:00-17:00")).toEqual({
      start: "9:00",
      end: "17:00",
    });

    expect(parseTimeRange("08:30-18:45")).toEqual({
      start: "08:30",
      end: "18:45",
    });

    expect(parseTimeRange("0:00-23:59")).toEqual({
      start: "0:00",
      end: "23:59",
    });

    // Overnight range
    expect(parseTimeRange("22:00-6:00")).toEqual({
      start: "22:00",
      end: "6:00",
    });
  });

  test("invalid time ranges", () => {
    expect(parseTimeRange("25:00-26:00")).toBeNull();
    expect(parseTimeRange("9:70-10:00")).toBeNull();
    expect(parseTimeRange("abc-def")).toBeNull();
    expect(parseTimeRange("9:00")).toBeNull(); // missing end time
    expect(parseTimeRange("9:00-")).toBeNull();
    expect(parseTimeRange("-17:00")).toBeNull();
  });
});

describe("parseDayRange", () => {
  test("valid day ranges", () => {
    expect(parseDayRange("Mon-Fri")).toEqual([1, 2, 3, 4, 5]);
    expect(parseDayRange("Sat-Sun")).toEqual([6, 0]);
    expect(parseDayRange("Mon-Wed")).toEqual([1, 2, 3]);
    expect(parseDayRange("Thu-Sat")).toEqual([4, 5, 6]);
  });

  test("single days", () => {
    expect(parseDayRange("Mon")).toEqual([1]);
    expect(parseDayRange("Tue")).toEqual([2]);
    expect(parseDayRange("Wed")).toEqual([3]);
    expect(parseDayRange("Thu")).toEqual([4]);
    expect(parseDayRange("Fri")).toEqual([5]);
    expect(parseDayRange("Sat")).toEqual([6]);
    expect(parseDayRange("Sun")).toEqual([0]);
  });

  test("Sun-Sat covers all days", () => {
    // Sun-Sat is valid and represents all 7 days
    expect(parseDayRange("Sun-Sat")).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  test("invalid day ranges", () => {
    // Wrapping ranges not allowed
    expect(parseDayRange("Fri-Mon")).toBeNull();
    expect(parseDayRange("Thu-Mon")).toBeNull();

    expect(parseDayRange("abc-def")).toBeNull();
    expect(parseDayRange("Monday")).toBeNull(); // Must use abbreviation
    expect(parseDayRange("Mon-")).toBeNull();
    expect(parseDayRange("-Fri")).toBeNull();
  });
});

describe("parseEntry", () => {
  test("entries without time intervals", () => {
    expect(parseEntry("example.com")).toEqual({
      path: "example.com",
      schedule: null,
    });

    expect(parseEntry("*.youtube.com")).toEqual({
      path: "*.youtube.com",
      schedule: null,
    });
  });

  test("entries with time only", () => {
    expect(parseEntry("example.com 9:00-17:00")).toEqual({
      path: "example.com",
      schedule: {
        days: null,
        timeRange: { start: "9:00", end: "17:00" },
      },
    });

    expect(parseEntry("facebook.com 08:30-18:45")).toEqual({
      path: "facebook.com",
      schedule: {
        days: null,
        timeRange: { start: "08:30", end: "18:45" },
      },
    });
  });

  test("entries with days only", () => {
    expect(parseEntry("youtube.com Sat-Sun")).toEqual({
      path: "youtube.com",
      schedule: {
        days: [6, 0],
        timeRange: null,
      },
    });

    expect(parseEntry("example.com Mon")).toEqual({
      path: "example.com",
      schedule: {
        days: [1],
        timeRange: null,
      },
    });
  });

  test("entries with both days and time", () => {
    expect(parseEntry("facebook.com Mon-Fri 9:00-17:00")).toEqual({
      path: "facebook.com",
      schedule: {
        days: [1, 2, 3, 4, 5],
        timeRange: { start: "9:00", end: "17:00" },
      },
    });

    expect(parseEntry("example.com Sat-Sun 10:00-22:00")).toEqual({
      path: "example.com",
      schedule: {
        days: [6, 0],
        timeRange: { start: "10:00", end: "22:00" },
      },
    });

    // Order shouldn't matter
    expect(parseEntry("example.com 9:00-17:00 Mon-Fri")).toEqual({
      path: "example.com",
      schedule: {
        days: [1, 2, 3, 4, 5],
        timeRange: { start: "9:00", end: "17:00" },
      },
    });
  });

  test("entries with comments", () => {
    expect(parseEntry("example.com 9:00-17:00 # work hours")).toEqual({
      path: "example.com",
      schedule: {
        days: null,
        timeRange: { start: "9:00", end: "17:00" },
      },
    });

    expect(parseEntry("facebook.com # blocked all day")).toEqual({
      path: "facebook.com",
      schedule: null,
    });
  });

  test("entries with wildcards and time", () => {
    expect(parseEntry("*.social.com Mon-Fri 9:00-17:00")).toEqual({
      path: "*.social.com",
      schedule: {
        days: [1, 2, 3, 4, 5],
        timeRange: { start: "9:00", end: "17:00" },
      },
    });
  });

  test("entries with invalid time fall back to 24/7", () => {
    expect(parseEntry("example.com 25:00-26:00")).toEqual({
      path: "example.com",
      schedule: null,
    });

    expect(parseEntry("example.com invalid")).toEqual({
      path: "example.com",
      schedule: null,
    });
  });

  test("empty entries", () => {
    expect(parseEntry("")).toEqual({
      path: "",
      schedule: null,
    });

    expect(parseEntry("   ")).toEqual({
      path: "",
      schedule: null,
    });
  });

  test("extra whitespace", () => {
    expect(parseEntry("  example.com  9:00-17:00  ")).toEqual({
      path: "example.com",
      schedule: {
        days: null,
        timeRange: { start: "9:00", end: "17:00" },
      },
    });
  });
});
