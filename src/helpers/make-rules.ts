import removeProtocol from "./remove-protocol";
import { parseEntry, Schedule } from "./parse-time-interval";

type RuleType = "allow" | "block"

export interface Rule {
  type: RuleType
  path: string
  schedule: Schedule | null
}

export default (blocked: string[]): Rule[] => {
  const processEntry = (item: string, isAllow: boolean): Rule => {
    // Strip comments
    const cleanItem = item.split("#")[0].trim();

    // Parse path and schedule
    const { path, schedule } = parseEntry(cleanItem);

    // Remove protocol from path
    const cleanPath = removeProtocol(path);

    return {
      type: isAllow ? "allow" : "block",
      path: cleanPath,
      schedule,
    };
  };

  const allowList = blocked
    .filter((item) => item.startsWith("!"))
    .map((item) => processEntry(item.substring(1), true));

  const blockList = blocked
    .filter((item) => !item.startsWith("!"))
    .map((item) => processEntry(item, false));

  return [...allowList, ...blockList];
};
