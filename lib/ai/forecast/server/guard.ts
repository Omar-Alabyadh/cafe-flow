import type { ForecastComputationGuard } from "./types";

/** Process-local duplicate suppression for the MVP; A4 deliberately adds no durable limiter. */
export function createInMemoryForecastComputationGuard(): ForecastComputationGuard {
  const active = new Set<string>();
  return {
    tryAcquire(key) {
      if (active.has(key)) return false;
      active.add(key);
      return true;
    },
    release(key) {
      active.delete(key);
    },
  };
}
