import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import { checkRateLimit, _resetStore } from "@/lib/rate-limiter";

/**
 * Feature: contact-email-service, Property 4: Rate limiter enforces window-based request throttling
 *
 * For any IP address string and any sequence of requests, the rate limiter SHALL allow
 * exactly 5 requests within a 15-minute window and reject all subsequent requests with
 * `allowed: false`. After the 15-minute window elapses, the rate limiter SHALL reset
 * and allow another 5 requests.
 *
 * **Validates: Requirements 5.1, 5.2**
 */
describe("Property 4: Rate limiter enforces window-based request throttling", () => {
  beforeEach(() => {
    _resetStore();
  });

  /**
   * Arbitrary for generating valid IP address strings.
   */
  const ipArb = fc
    .tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    )
    .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);

  it("allows exactly 5 requests within a 15-minute window for any IP", () => {
    fc.assert(
      fc.property(ipArb, (ip) => {
        _resetStore();
        const now = 1000000;
        const nowFn = () => now;

        // First 5 requests should all be allowed
        for (let i = 0; i < 5; i++) {
          const result = checkRateLimit(ip, 5, 15 * 60 * 1000, nowFn);
          expect(result.allowed).toBe(true);
          expect(result.remaining).toBe(4 - i);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("rejects all requests beyond 5 within the same window", () => {
    fc.assert(
      fc.property(
        ipArb,
        fc.integer({ min: 1, max: 20 }),
        (ip, extraRequests) => {
          _resetStore();
          const now = 1000000;
          const nowFn = () => now;

          // Exhaust the 5 allowed requests
          for (let i = 0; i < 5; i++) {
            checkRateLimit(ip, 5, 15 * 60 * 1000, nowFn);
          }

          // All subsequent requests should be rejected
          for (let i = 0; i < extraRequests; i++) {
            const result = checkRateLimit(ip, 5, 15 * 60 * 1000, nowFn);
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("resets and allows requests again after the window elapses", () => {
    fc.assert(
      fc.property(ipArb, (ip) => {
        _resetStore();
        const windowMs = 15 * 60 * 1000;
        let currentTime = 1000000;
        const nowFn = () => currentTime;

        // Exhaust the 5 allowed requests
        for (let i = 0; i < 5; i++) {
          checkRateLimit(ip, 5, windowMs, nowFn);
        }

        // Confirm the 6th is rejected
        const rejected = checkRateLimit(ip, 5, windowMs, nowFn);
        expect(rejected.allowed).toBe(false);

        // Advance time past the window
        currentTime = 1000000 + windowMs;

        // After window reset, requests should be allowed again
        const afterReset = checkRateLimit(ip, 5, windowMs, nowFn);
        expect(afterReset.allowed).toBe(true);
        expect(afterReset.remaining).toBe(4);
      }),
      { numRuns: 100 }
    );
  });

  it("treats different IPs independently", () => {
    fc.assert(
      fc.property(
        ipArb,
        ipArb,
        (ip1, ip2) => {
          // Skip if both IPs happen to be the same
          fc.pre(ip1 !== ip2);

          _resetStore();
          const now = 1000000;
          const nowFn = () => now;
          const windowMs = 15 * 60 * 1000;

          // Exhaust rate limit for ip1
          for (let i = 0; i < 5; i++) {
            checkRateLimit(ip1, 5, windowMs, nowFn);
          }

          // ip1 should be rejected
          const ip1Result = checkRateLimit(ip1, 5, windowMs, nowFn);
          expect(ip1Result.allowed).toBe(false);

          // ip2 should still be allowed
          const ip2Result = checkRateLimit(ip2, 5, windowMs, nowFn);
          expect(ip2Result.allowed).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
