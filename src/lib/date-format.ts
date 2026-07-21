/**
 * Formats a YYYY-MM-DD date string into a human-readable format.
 * Example: "2025-01-15" → "January 15, 2025"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
