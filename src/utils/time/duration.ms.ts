import { DurationMs } from "./duration";

export const Duration = {
  seconds: (n: number) => n * 1000 as DurationMs,
  minutes: (n: number) => n * 60 * 1000 as DurationMs,
  hours: (n: number) => n * 60 * 60 * 1000 as DurationMs,
  days: (n: number) => n * 24 * 60 * 60 * 1000 as DurationMs,
  
  ONE_MINUTE: 60 * 1000 as DurationMs,
  FIVE_MINUTES: 5 * 60 * 1000 as DurationMs,
  ONE_HOUR: 60 * 60 * 1000 as DurationMs,
  ONE_DAY: 24 * 60 * 60 * 1000 as DurationMs,
} as const;
