export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates frontmatter data extracted from a markdown file.
 * Returns a ValidationResult indicating whether the data is valid
 * and any errors found.
 */
export function validateFrontmatter(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (data === null || data === undefined || typeof data !== "object") {
    return { valid: false, errors: ["Frontmatter must be an object"] };
  }

  const record = data as Record<string, unknown>;

  // Validate title: required string, max 100 characters
  if (!("title" in record) || record.title === undefined || record.title === null) {
    errors.push('Missing required field "title"');
  } else if (typeof record.title !== "string") {
    errors.push('"title" must be a string');
  } else if (record.title.length > 100) {
    errors.push('"title" must be at most 100 characters');
  }

  // Validate description: required string, max 300 characters
  if (!("description" in record) || record.description === undefined || record.description === null) {
    errors.push('Missing required field "description"');
  } else if (typeof record.description !== "string") {
    errors.push('"description" must be a string');
  } else if (record.description.length > 300) {
    errors.push('"description" must be at most 300 characters');
  }

  // Validate tags: required array of strings
  if (!("tags" in record) || record.tags === undefined || record.tags === null) {
    errors.push('Missing required field "tags"');
  } else if (!Array.isArray(record.tags)) {
    errors.push('"tags" must be an array');
  } else if (!record.tags.every((tag: unknown) => typeof tag === "string")) {
    errors.push('"tags" must be an array of strings');
  }

  // Validate date: required string in YYYY-MM-DD format with valid date
  if (!("date" in record) || record.date === undefined || record.date === null) {
    errors.push('Missing required field "date"');
  } else if (typeof record.date !== "string") {
    errors.push('"date" must be a string');
  } else if (!DATE_REGEX.test(record.date)) {
    errors.push('"date" must be in YYYY-MM-DD format');
  } else {
    // Verify the date is actually valid (e.g., not 2025-02-30)
    const [year, month, day] = record.date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      errors.push('"date" is not a valid calendar date');
    }
  }

  return { valid: errors.length === 0, errors };
}
