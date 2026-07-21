"use client";

import { useState } from "react";
import {
  validateContactForm,
  type ContactFormData,
  type FieldError,
} from "@/lib/contact-validation";

export default function ContactForm() {
  const [values, setValues] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function getFieldError(field: keyof ContactFormData): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateContactForm(values);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      setSubmitted(false);
      return;
    }

    // Construct mailto link and open it
    const subject = encodeURIComponent(`Message from ${values.name}`);
    const body = encodeURIComponent(
      `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`
    );
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink, "_blank");

    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg mx-auto space-y-6">
      {submitted && (
        <div className="p-4 rounded bg-accent/10 border border-accent text-accent text-sm">
          Your message has been prepared. Your email client should open shortly.
        </div>
      )}

      {/* Name field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-name" className="text-sm text-text/80">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          maxLength={100}
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          className="w-full px-4 py-3 rounded bg-bg border border-text/20 text-text placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors min-h-11"
          placeholder="Your name"
        />
        {getFieldError("name") && (
          <p className="text-sm text-red-400 mt-1">{getFieldError("name")}</p>
        )}
      </div>

      {/* Email field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-email" className="text-sm text-text/80">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          maxLength={254}
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          className="w-full px-4 py-3 rounded bg-bg border border-text/20 text-text placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors min-h-11"
          placeholder="you@example.com"
        />
        {getFieldError("email") && (
          <p className="text-sm text-red-400 mt-1">{getFieldError("email")}</p>
        )}
      </div>

      {/* Message field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="text-sm text-text/80">
          Message
        </label>
        <textarea
          id="contact-message"
          maxLength={2000}
          rows={5}
          value={values.message}
          onChange={(e) => setValues({ ...values, message: e.target.value })}
          className="w-full px-4 py-3 rounded bg-bg border border-text/20 text-text placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors resize-y"
          placeholder="Your message..."
        />
        {getFieldError("message") && (
          <p className="text-sm text-red-400 mt-1">{getFieldError("message")}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-accent text-bg font-semibold rounded hover:bg-accent/90 transition-colors min-h-11"
      >
        Send Message
      </button>
    </form>
  );
}
