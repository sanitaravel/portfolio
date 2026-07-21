import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatDate } from "@/lib/date-format";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Feature: developer-portfolio, Property 7: Date formatting produces valid human-readable output
 *
 * For any valid date string in YYYY-MM-DD format, the date formatting function
 * shall produce a string containing the full month name, numeric day, and four-digit year
 * (e.g., "January 15, 2025"), and parsing that output back should correspond to the same
 * calendar date.
 *
 * **Validates: Requirements 5.3**
 */
describe("Property 7: Date formatting produces valid human-readable output", () => {
  /**
   * Generate valid YYYY-MM-DD date strings with proper day ranges per month.
   */
  const validDateArb = fc
    .record({
      year: fc.integer({ min: 1970, max: 2099 }),
      month: fc.integer({ min: 1, max: 12 }),
    })
    .chain(({ year, month }) => {
      const maxDay = new Date(year, month, 0).getDate();
      return fc.record({
        year: fc.constant(year),
        month: fc.constant(month),
        day: fc.integer({ min: 1, max: maxDay }),
      });
    })
    .map(({ year, month, day }) => {
      const mm = String(month).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      return { dateStr: `${year}-${mm}-${dd}`, year, month, day };
    });

  it("output contains the full month name", () => {
    fc.assert(
      fc.property(validDateArb, ({ dateStr, month }) => {
        const result = formatDate(dateStr);
        const expectedMonth = MONTH_NAMES[month - 1];
        expect(result).toContain(expectedMonth);
      }),
      { numRuns: 100 }
    );
  });

  it("output contains the numeric day", () => {
    fc.assert(
      fc.property(validDateArb, ({ dateStr, day }) => {
        const result = formatDate(dateStr);
        // The day should appear as a number in the output
        expect(result).toContain(String(day));
      }),
      { numRuns: 100 }
    );
  });

  it("output contains the four-digit year", () => {
    fc.assert(
      fc.property(validDateArb, ({ dateStr, year }) => {
        const result = formatDate(dateStr);
        expect(result).toContain(String(year));
      }),
      { numRuns: 100 }
    );
  });

  it("round-trips to the same calendar date", () => {
    fc.assert(
      fc.property(validDateArb, ({ dateStr, year, month, day }) => {
        const result = formatDate(dateStr);
        // Parse the formatted output back to a date
        const parsed = new Date(result);
        expect(parsed.getFullYear()).toBe(year);
        expect(parsed.getMonth() + 1).toBe(month);
        expect(parsed.getDate()).toBe(day);
      }),
      { numRuns: 100 }
    );
  });
});
