import { describe, it, expect } from "vitest";
import { validateContactForm } from "@/lib/contact-validation";

describe("validateContactForm", () => {
  it("returns no errors for valid input", () => {
    const errors = validateContactForm({
      name: "Alice",
      email: "alice@example.com",
      message: "Hello there!",
    });
    expect(errors).toEqual([]);
  });

  it("rejects empty name", () => {
    const errors = validateContactForm({
      name: "",
      email: "alice@example.com",
      message: "Hello",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
  });

  it("rejects whitespace-only name", () => {
    const errors = validateContactForm({
      name: "   \t\n  ",
      email: "alice@example.com",
      message: "Hello",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
  });

  it("rejects name exceeding 100 characters", () => {
    const errors = validateContactForm({
      name: "a".repeat(101),
      email: "alice@example.com",
      message: "Hello",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
    expect(errors[0].message).toContain("100");
  });

  it("accepts name with exactly 100 characters", () => {
    const errors = validateContactForm({
      name: "a".repeat(100),
      email: "alice@example.com",
      message: "Hello",
    });
    expect(errors).toEqual([]);
  });

  it("rejects invalid email - missing @", () => {
    const errors = validateContactForm({
      name: "Alice",
      email: "aliceexample.com",
      message: "Hello",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
  });

  it("rejects invalid email - missing domain dot", () => {
    const errors = validateContactForm({
      name: "Alice",
      email: "alice@example",
      message: "Hello",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
  });

  it("rejects email exceeding 254 characters", () => {
    const longEmail = "a".repeat(246) + "@test.com";
    const errors = validateContactForm({
      name: "Alice",
      email: longEmail,
      message: "Hello",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
    expect(errors[0].message).toContain("254");
  });

  it("rejects empty message", () => {
    const errors = validateContactForm({
      name: "Alice",
      email: "alice@example.com",
      message: "",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("message");
  });

  it("rejects whitespace-only message", () => {
    const errors = validateContactForm({
      name: "Alice",
      email: "alice@example.com",
      message: "   \n\t  ",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("message");
  });

  it("rejects message exceeding 2000 characters", () => {
    const errors = validateContactForm({
      name: "Alice",
      email: "alice@example.com",
      message: "a".repeat(2001),
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("message");
    expect(errors[0].message).toContain("2000");
  });

  it("returns multiple errors for multiple invalid fields", () => {
    const errors = validateContactForm({
      name: "",
      email: "invalid",
      message: "",
    });
    expect(errors).toHaveLength(3);
    const fields = errors.map((e) => e.field);
    expect(fields).toContain("name");
    expect(fields).toContain("email");
    expect(fields).toContain("message");
  });
});
