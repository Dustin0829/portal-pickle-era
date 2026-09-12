import type { ActivityLogRecord } from "./types.js";
import { BUFFER_MAX } from "./types.js";

const items: ActivityLogRecord[] = [];

export function pushActivityRecord(record: ActivityLogRecord): boolean {
  let dropped = false;
  if (items.length >= BUFFER_MAX) {
    items.shift();
    dropped = true;
  }
  items.push(record);
  return dropped;
}

export function drainActivityRecords(max: number): ActivityLogRecord[] {
  const n = Math.min(max, items.length);
  if (n <= 0) return [];
  return items.splice(0, n);
}

export function activityBufferSize(): number {
  return items.length;
}

/** @internal tests */
export function resetActivityBufferForTests(): void {
  items.length = 0;
}
