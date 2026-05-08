/**
 * Wall-clock milliseconds for server handlers (invite expiry, “pending” counts, etc.).
 * Kept outside React component modules so `react-hooks/purity` does not treat this as render-time impurity.
 */
export function requestTimeMs(): number {
  return Date.now();
}
