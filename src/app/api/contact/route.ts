// Only the POST function is exported — the Next.js App Router convention
// automatically rejects non-POST methods with 405 for this route.

import { checkRateLimit } from "@/lib/rate-limiter";
import { validateContactForm } from "@/lib/contact-validation";
import { sendContactEmail } from "@/lib/email-sender";

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Extract client IP from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    // Rate limiting
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Validate form data
    const { name, email, message } = body as {
      name: string;
      email: string;
      message: string;
    };

    const errors = validateContactForm({ name, email, message });
    if (errors.length > 0) {
      return Response.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    // Check required environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const toAddress = process.env.CONTACT_EMAIL_TO;

    if (!apiKey || !toAddress) {
      console.error(
        "Missing required environment variables: RESEND_API_KEY or CONTACT_EMAIL_TO"
      );
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    // Send email
    const result = await sendContactEmail({ name, email, message, toAddress });

    if (!result.success) {
      console.error("Failed to send contact email:", result.error);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return Response.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Unexpected error in contact route:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
