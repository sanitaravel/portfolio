export interface RateLimitEntry {
  count: number;
  resetTime: number; // Unix timestamp (ms)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

const store: Map<string, RateLimitEntry> = new Map();

const DEFAULT_MAX_REQUESTS = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(
  ip: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS,
  nowFn: () => number = Date.now
): RateLimitResult {
  const now = nowFn();
  const entry = store.get(ip);

  // If entry exists but window has expired, clean it up (lazy cleanup)
  if (entry && now >= entry.resetTime) {
    store.delete(ip);
  }

  const current = store.get(ip);

  if (!current) {
    // First request from this IP — create a new entry
    const resetTime = now + windowMs;
    store.set(ip, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  // Entry exists and window is still active
  if (current.count < maxRequests) {
    current.count += 1;
    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetTime: current.resetTime,
  };
}

/** Exposed for testing — clears all stored rate limit entries */
export function _resetStore(): void {
  store.clear();
}
