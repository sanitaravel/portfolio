export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface FieldError {
  field: keyof ContactFormData;
  message: string;
}

/**
 * Validates contact form data and returns an array of field errors.
 * Returns an empty array if all fields are valid.
 */
export function validateContactForm(data: ContactFormData): FieldError[] {
  const errors: FieldError[] = [];

  // Name validation: min 1 non-whitespace character, max 100 chars total
  if (data.name.length > 100) {
    errors.push({ field: "name", message: "Name must be 100 characters or fewer." });
  } else if (!/\S/.test(data.name)) {
    errors.push({ field: "name", message: "Name is required." });
  }

  // Email validation: max 254 chars, must match local-part@domain pattern
  if (data.email.length > 254) {
    errors.push({ field: "email", message: "Email must be 254 characters or fewer." });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address." });
  }

  // Message validation: min 1 non-whitespace character, max 2000 chars total
  if (data.message.length > 2000) {
    errors.push({ field: "message", message: "Message must be 2000 characters or fewer." });
  } else if (!/\S/.test(data.message)) {
    errors.push({ field: "message", message: "Message is required." });
  }

  return errors;
}
