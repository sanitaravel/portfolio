import { describe, it, expect, beforeEach, vi } from "vitest";

const mockSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => {
  return {
    Resend: class {
      emails = { send: mockSend };
    },
  };
});

import { sendContactEmail } from "@/lib/email-sender";

describe("Email sender unit tests", () => {
  const validParams = {
    name: "Jane Doe",
    email: "jane@example.com",
    message: "Hello, I'd like to collaborate!",
    toAddress: "owner@portfolio.dev",
  };

  beforeEach(() => {
    mockSend.mockReset();
  });

  describe("success path", () => {
    it("returns { success: true } when resend.emails.send resolves", async () => {
      mockSend.mockResolvedValueOnce({ id: "msg_123" });

      const result = await sendContactEmail(validParams);

      expect(result).toEqual({ success: true });
    });
  });

  describe("failure path", () => {
    it("returns { success: false, error } when resend.emails.send rejects with an Error", async () => {
      mockSend.mockRejectedValueOnce(new Error("API rate limit exceeded"));

      const result = await sendContactEmail(validParams);

      expect(result).toEqual({
        success: false,
        error: "API rate limit exceeded",
      });
    });

    it("returns { success: false, error: 'Unknown error occurred' } when rejection is not an Error instance", async () => {
      mockSend.mockRejectedValueOnce("some string error");

      const result = await sendContactEmail(validParams);

      expect(result).toEqual({
        success: false,
        error: "Unknown error occurred",
      });
    });
  });

  describe("parameter mapping", () => {
    it("sets replyTo to the visitor's email address", async () => {
      mockSend.mockResolvedValueOnce({ id: "msg_456" });

      await sendContactEmail(validParams);

      expect(mockSend).toHaveBeenCalledOnce();
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.replyTo).toBe(validParams.email);
    });

    it("includes the visitor's name, email, and message in the email body", async () => {
      mockSend.mockResolvedValueOnce({ id: "msg_789" });

      await sendContactEmail(validParams);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.text).toContain(validParams.name);
      expect(callArgs.text).toContain(validParams.email);
      expect(callArgs.text).toContain(validParams.message);
    });

    it("sets the 'to' field to the toAddress param", async () => {
      mockSend.mockResolvedValueOnce({ id: "msg_abc" });

      await sendContactEmail(validParams);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe(validParams.toAddress);
    });
  });
});
