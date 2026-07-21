# Implementation Plan: Contact Email Service

## Overview

Replace the mailto-based contact form with a server-side email delivery system using a Next.js App Router API route and the Resend SDK. The implementation progresses from infrastructure changes, through core modules (rate limiter, email sender, API route), to updating the existing ContactForm component, and finally wiring everything together with tests.

## Tasks

- [x] 1. Set up project infrastructure and dependencies
  - [x] 1.1 Update Next.js configuration and install Resend SDK
    - Remove `output: "export"` from `next.config.ts` to enable API routes (keep `images.unoptimized` if still desired)
    - Install the `resend` package: `npm install resend`
    - Create a `.env.local` file (gitignored) with placeholder values for `RESEND_API_KEY` and `CONTACT_EMAIL_TO`
    - _Requirements: 6.1, 6.2_

- [x] 2. Implement rate limiter module
  - [x] 2.1 Create `src/lib/rate-limiter.ts`
    - Implement the `RateLimitEntry` and `RateLimitResult` interfaces as defined in the design
    - Implement `checkRateLimit(ip, maxRequests?, windowMs?)` function using a module-level `Map<string, RateLimitEntry>`
    - Default `maxRequests` to 5, default `windowMs` to 15 * 60 * 1000 (15 minutes)
    - Lazily clean expired entries when checked
    - Accept an optional `nowFn` parameter (defaulting to `Date.now`) for deterministic testing
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 2.2 Write property test for rate limiter (Property 4)
    - **Property 4: Rate limiter enforces window-based request throttling**
    - Test file: `tests/property/rate-limiter.property.test.ts`
    - For any IP string and sequence of requests, verify exactly 5 are allowed within a 15-minute window and subsequent requests are rejected. Verify reset after window elapses.
    - Use `fast-check` with `{ numRuns: 100 }`
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 2.3 Write unit tests for rate limiter
    - Test file: `tests/unit/rate-limiter.test.ts`
    - Test edge cases: first request allowed, boundary at exactly 5 requests, different IPs are independent, window reset behavior
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Implement email sender module
  - [x] 3.1 Create `src/lib/email-sender.ts`
    - Implement `SendContactEmailParams` and `SendEmailResult` interfaces
    - Implement `sendContactEmail(params)` function that wraps `resend.emails.send()`
    - Set `from` to a noreply address, `to` to `params.toAddress`, `replyTo` to `params.email`
    - Include visitor's name, email, and message in the email body
    - Return `{ success: true }` on success, `{ success: false, error: string }` on failure
    - _Requirements: 1.1, 1.3, 1.4_

  - [ ]* 3.2 Write unit tests for email sender
    - Test file: `tests/unit/email-sender.test.ts`
    - Mock the Resend SDK with `vi.mock('resend')`
    - Test success path, failure path, and verify parameter mapping (replyTo, body content)
    - _Requirements: 1.3, 1.4_

- [ ] 4. Implement API route handler
  - [ ] 4.1 Create `src/app/api/contact/route.ts`
    - Export `POST(request: Request): Promise<Response>` function
    - Parse JSON body with try/catch (return 400 for unparseable JSON)
    - Extract client IP from `x-forwarded-for` or `x-real-ip` headers
    - Call `checkRateLimit(ip)` — return 429 if not allowed
    - Call `validateContactForm(body)` — return 400 with field errors if validation fails
    - Read `RESEND_API_KEY` and `CONTACT_EMAIL_TO` from `process.env` — return 500 with generic message if missing (log error server-side)
    - Call `sendContactEmail(...)` — return 200 on success, 500 on failure
    - Reject non-POST methods is handled by App Router convention (only export POST), but add explicit comment
    - Wrap entire handler in try/catch for unexpected errors — return 500 with generic message
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 5.1, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 4.2 Write property tests for API route (Properties 1, 2, 3)
    - Test file: `tests/property/contact-api-route.property.test.ts`
    - **Property 1: Email construction preserves all input fields** — For any valid ContactFormData, verify the email sent contains name, email, message in body and replyTo equals visitor email
    - **Property 2: Route validation is equivalent to validateContactForm** — For any ContactFormData, route returns 400 iff validateContactForm returns non-empty errors
    - **Property 3: Error responses never expose internal details** — For any error thrown by Resend SDK, response body only contains generic message
    - Mock Resend SDK, use `fast-check` with `{ numRuns: 100 }` per property
    - **Validates: Requirements 1.1, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2**

  - [ ]* 4.3 Write unit tests for API route
    - Test file: `tests/unit/api-contact-route.test.ts`
    - Test HTTP 405 for non-POST (via direct function call or method check), 400 for invalid JSON, 400 for validation failures, 500 for missing env vars, 200 for success path, 500 for Resend failure
    - Use `vi.mock('resend')` and `vi.stubEnv()` for environment variables
    - _Requirements: 3.5, 4.1, 4.2, 4.3, 6.3_

- [ ] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update ContactForm component for server-side submission
  - [ ] 6.1 Modify `src/components/ContactForm.tsx`
    - Replace `mailto:` logic with `fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })`
    - Add `isSubmitting` state — set `true` before fetch, `false` after response
    - Add `submitResult` state (`'success' | 'error' | null`) for feedback display
    - Disable submit button and show loading indicator while `isSubmitting` is `true`
    - On 200 response: show success message, reset form fields to empty
    - On error response: show error message from response body
    - Preserve existing client-side validation before submission
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 6.2 Write component tests for ContactForm
    - Test file: `tests/component/ContactForm.test.tsx`
    - Mock `fetch` globally
    - Test loading state (button disabled, spinner/text shown during submission)
    - Test success message displayed and form reset on 200
    - Test error message displayed on error response
    - Test submit button is disabled during submission to prevent duplicates
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 7. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The Resend SDK is mocked in all tests — no real emails are sent during testing
- Environment variables are managed via `vi.stubEnv()` in test files
- The existing `contact-validation.ts` is reused without modification
- The `output: "export"` removal in task 1.1 means the project can no longer be statically exported — it requires a Node.js server or Vercel deployment

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3"] },
    { "id": 4, "tasks": ["6.1"] },
    { "id": 5, "tasks": ["6.2"] }
  ]
}
```
