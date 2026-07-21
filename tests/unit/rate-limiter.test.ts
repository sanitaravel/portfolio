import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, _resetStore } from "@/lib/rate-limiter";

describe("Rate limiter unit tests", () => {
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  beforeEach(() => {
    _resetStore();
  });

  describe("first request behavior", () => {
    it("allows the first request from any IP with remaining=4", () => {
      const now = 1000000;
      const result = checkRateLimit("192.168.1.1", 5, WINDOW_MS, () => now);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBe(now + WINDOW_MS);
    });
  });

  describe("boundary at exactly 5 requests", () => {
    it("allows the 5th request with remaining=0", () => {
      const now = 1000000;
      const nowFn = () => now;

      for (let i = 0; i < 4; i++) {
        checkRateLimit("10.0.0.1", 5, WINDOW_MS, nowFn);
      }

      const fifth = checkRateLimit("10.0.0.1", 5, WINDOW_MS, nowFn);
      expect(fifth.allowed).toBe(true);
      expect(fifth.remaining).toBe(0);
    });

    it("rejects the 6th request", () => {
      const now = 1000000;
      const nowFn = () => now;

      for (let i = 0; i < 5; i++) {
        checkRateLimit("10.0.0.1", 5, WINDOW_MS, nowFn);
      }

      const sixth = checkRateLimit("10.0.0.1", 5, WINDOW_MS, nowFn);
      expect(sixth.allowed).toBe(false);
      expect(sixth.remaining).toBe(0);
    });
  });

  describe("different IPs are independent", () => {
    it("exhausting one IP does not affect another", () => {
      const now = 1000000;
      const nowFn = () => now;

      // Exhaust rate limit for IP A
      for (let i = 0; i < 5; i++) {
        checkRateLimit("1.1.1.1", 5, WINDOW_MS, nowFn);
      }

      // IP A is now rejected
      const ipAResult = checkRateLimit("1.1.1.1", 5, WINDOW_MS, nowFn);
      expect(ipAResult.allowed).toBe(false);

      // IP B should still be fully available
      const ipBResult = checkRateLimit("2.2.2.2", 5, WINDOW_MS, nowFn);
      expect(ipBResult.allowed).toBe(true);
      expect(ipBResult.remaining).toBe(4);
    });
  });

  describe("window reset behavior", () => {
    it("allows requests again after the window elapses", () => {
      let currentTime = 1000000;
      const nowFn = () => currentTime;

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit("10.0.0.5", 5, WINDOW_MS, nowFn);
      }

      // Confirm rejection
      const rejected = checkRateLimit("10.0.0.5", 5, WINDOW_MS, nowFn);
      expect(rejected.allowed).toBe(false);

      // Advance time past the window
      currentTime = 1000000 + WINDOW_MS;

      // Should be allowed again with a fresh window
      const afterReset = checkRateLimit("10.0.0.5", 5, WINDOW_MS, nowFn);
      expect(afterReset.allowed).toBe(true);
      expect(afterReset.remaining).toBe(4);
      expect(afterReset.resetTime).toBe(currentTime + WINDOW_MS);
    });
  });

  describe("remaining count decreases correctly", () => {
    it("decreases remaining from 4 to 0 across 5 requests", () => {
      const now = 1000000;
      const nowFn = () => now;

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit("172.16.0.1", 5, WINDOW_MS, nowFn);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });
  });

  describe("resetTime consistency within a window", () => {
    it("returns the same resetTime for all requests from same IP in same window", () => {
      const now = 1000000;
      const nowFn = () => now;
      const expectedResetTime = now + WINDOW_MS;

      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(checkRateLimit("10.10.10.10", 5, WINDOW_MS, nowFn));
      }

      // Even the rejected request should report the same resetTime
      results.push(checkRateLimit("10.10.10.10", 5, WINDOW_MS, nowFn));

      for (const result of results) {
        expect(result.resetTime).toBe(expectedResetTime);
      }
    });
  });
});
