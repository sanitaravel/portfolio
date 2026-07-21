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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function getFieldError(field: keyof ContactFormData): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Clear previous submit result
    setSubmitResult(null);
    setErrorMessage("");

    // Client-side validation
    const validationErrors = validateContactForm(values);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setSubmitResult("success");
        setValues({ name: "", email: "", message: "" });
        setErrors([]);
      } else {
        const data = await response.json();
        setSubmitResult("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitResult("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg mx-auto space-y-6">
      {submitResult === "success" && (
        <div className="p-4 rounded bg-accent/10 border border-accent text-accent text-sm">
          Your message has been sent successfully!
        </div>
      )}

      {submitResult === "error" && (
        <div className="p-4 rounded bg-red-500/10 border border-red-500 text-red-400 text-sm">
          {errorMessage}
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
          className="w-full px-4 py-3 rounded bg-bg border border-text/20 text-text placeholder:text-text/40 focus:outline-none focus:border-accent transition-colors resize-y min-h-11"
          placeholder="Your message..."
        />
        {getFieldError("message") && (
          <p className="text-sm text-red-400 mt-1">{getFieldError("message")}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-accent text-bg font-semibold rounded hover:bg-accent/90 transition-colors min-h-11 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
