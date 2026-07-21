// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import ContactForm from "@/components/ContactForm";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  global.fetch = vi.fn();
});

function fillForm() {
  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: "John Doe" },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "john@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/message/i), {
    target: { value: "Hello, this is a test message." },
  });
}

describe("ContactForm", () => {
  // Requirement 2.4: Loading state shown and submit button disabled during submission
  describe("loading state during submission", () => {
    it("disables the submit button and shows 'Sending...' while submitting", async () => {
      // Create a fetch that never resolves so we can inspect the loading state
      let resolveFetch!: (value: Response) => void;
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise<Response>((resolve) => { resolveFetch = resolve; })
      );

      render(<ContactForm />);
      fillForm();

      const button = screen.getByRole("button", { name: /send message/i });
      expect(button).not.toBeDisabled();

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent("Sending...");
      });

      // Resolve to clean up
      resolveFetch(new Response(JSON.stringify({ success: true }), { status: 200 }));

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(button).toHaveTextContent("Send Message");
      });
    });

    it("prevents duplicate submissions by keeping button disabled during fetch", async () => {
      let fetchCallCount = 0;
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => {
          fetchCallCount++;
          return new Promise<Response>((resolve) => {
            setTimeout(() => resolve(new Response(JSON.stringify({ success: true }), { status: 200 })), 100);
          });
        }
      );

      render(<ContactForm />);
      fillForm();

      const button = screen.getByRole("button", { name: /send message/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });

      // Try clicking again while disabled - the button is disabled so the form won't resubmit
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });

      expect(fetchCallCount).toBe(1);
    });
  });

  // Requirement 2.2: Success message displayed on success response
  // Requirement 2.5: Form fields reset on success
  describe("success response", () => {
    it("displays success message and resets form fields on 200 response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      render(<ContactForm />);
      fillForm();

      const button = screen.getByRole("button", { name: /send message/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Your message has been sent successfully!")).toBeInTheDocument();
      });

      // Verify form fields are reset (Requirement 2.5)
      expect(screen.getByLabelText(/name/i)).toHaveValue("");
      expect(screen.getByLabelText(/email/i)).toHaveValue("");
      expect(screen.getByLabelText(/message/i)).toHaveValue("");
    });
  });

  // Requirement 2.3: Error message displayed on error response
  describe("error response", () => {
    it("displays error message from server on non-ok response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), { status: 429 })
      );

      render(<ContactForm />);
      fillForm();

      const button = screen.getByRole("button", { name: /send message/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Rate limit exceeded. Try again later.")).toBeInTheDocument();
      });
    });

    it("displays fallback error message when server provides no error field", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({}), { status: 500 })
      );

      render(<ContactForm />);
      fillForm();

      const button = screen.getByRole("button", { name: /send message/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
      });
    });

    it("displays network error message when fetch throws", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network failure"));

      render(<ContactForm />);
      fillForm();

      const button = screen.getByRole("button", { name: /send message/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Network error. Please check your connection and try again.")).toBeInTheDocument();
      });
    });
  });
});
