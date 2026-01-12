import makeRules, { Rule } from "../make-rules";

test("makeRules() - backward compatibility", () => {
  expect(
    makeRules([
      "www.facebook.com",
      "https://www.instagram.com/",

      "*.youtube.com",
      "!music.youtube.com",

      "reddit.com",
      "!reddit.com/r/MachineLearning",
    ]),
  ).toEqual<Rule[]>([
    { type: "allow", path: "music.youtube.com", schedule: null },
    { type: "allow", path: "reddit.com/r/MachineLearning", schedule: null },

    { type: "block", path: "www.facebook.com", schedule: null },
    { type: "block", path: "www.instagram.com/", schedule: null },

    { type: "block", path: "*.youtube.com", schedule: null },
    { type: "block", path: "reddit.com", schedule: null },
  ]);
});

test("makeRules() - with time intervals", () => {
  expect(
    makeRules([
      "example.com 9:00-17:00",
      "facebook.com Mon-Fri 9:00-17:00",
      "youtube.com Sat-Sun",
      "reddit.com",
    ]),
  ).toEqual<Rule[]>([
    {
      type: "block",
      path: "example.com",
      schedule: {
        days: null,
        timeRange: { start: "9:00", end: "17:00" },
      },
    },
    {
      type: "block",
      path: "facebook.com",
      schedule: {
        days: [1, 2, 3, 4, 5],
        timeRange: { start: "9:00", end: "17:00" },
      },
    },
    {
      type: "block",
      path: "youtube.com",
      schedule: {
        days: [6, 0],
        timeRange: null,
      },
    },
    {
      type: "block",
      path: "reddit.com",
      schedule: null,
    },
  ]);
});

test("makeRules() - with comments", () => {
  expect(
    makeRules([
      "example.com 9:00-17:00 # work hours",
      "facebook.com # blocked all day",
    ]),
  ).toEqual<Rule[]>([
    {
      type: "block",
      path: "example.com",
      schedule: {
        days: null,
        timeRange: { start: "9:00", end: "17:00" },
      },
    },
    {
      type: "block",
      path: "facebook.com",
      schedule: null,
    },
  ]);
});
