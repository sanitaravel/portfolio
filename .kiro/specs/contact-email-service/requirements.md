# Requirements Document

## Introduction

This feature replaces the current mailto-based contact form with a server-side email delivery system. When a visitor fills in their name, email, and message and presses "Send Message", the form data is submitted to a Next.js API route which delivers the email to the site owner via an email service (Resend). The visitor receives immediate feedback on success or failure without leaving the page or opening an external mail client.

## Glossary

- **Contact_Form**: The client-side React component that collects name, email, and message fields from visitors
- **API_Route**: A Next.js serverless API endpoint (`/api/contact`) deployed as a Vercel serverless function that receives form submissions and orchestrates email delivery
- **Email_Service**: The third-party email delivery provider (Resend) used to send transactional emails
- **Visitor**: A person viewing the portfolio website who fills in and submits the contact form
- **Site_Owner**: The portfolio website owner who receives contact form submissions via email
- **Rate_Limiter**: A mechanism that restricts the number of submissions from a single source within a time window

## Requirements

### Requirement 1: Server-Side Email Delivery

**User Story:** As a visitor, I want my contact form message to be sent directly to the site owner when I press "Send Message", so that I don't need to have an email client installed or configured.

#### Acceptance Criteria

1. WHEN the Visitor submits a valid contact form, THE API_Route SHALL accept the request and send the form data to the Email_Service for delivery to the Site_Owner
2. WHEN the Email_Service successfully delivers the email, THE API_Route SHALL return a success response with HTTP status 200
3. THE API_Route SHALL include the Visitor's name, email address, and message in the delivered email body
4. THE API_Route SHALL set the reply-to header of the delivered email to the Visitor's email address

### Requirement 2: Client-Side Form Submission

**User Story:** As a visitor, I want to see clear feedback after submitting the contact form, so that I know whether my message was sent successfully.

#### Acceptance Criteria

1. WHEN the Visitor presses "Send Message" with valid form data, THE Contact_Form SHALL submit the data to the API_Route via an HTTP POST request
2. WHEN the API_Route returns a success response, THE Contact_Form SHALL display a success message confirming the message was sent
3. WHEN the API_Route returns an error response, THE Contact_Form SHALL display an error message indicating the submission failed
4. WHILE the Contact_Form is submitting data to the API_Route, THE Contact_Form SHALL display a loading state and disable the submit button to prevent duplicate submissions
5. WHEN the API_Route returns a success response, THE Contact_Form SHALL reset all form fields to their empty state

### Requirement 3: Server-Side Input Validation

**User Story:** As the site owner, I want the API route to validate all incoming data, so that malformed or malicious requests are rejected before reaching the email service.

#### Acceptance Criteria

1. WHEN the API_Route receives a request with an invalid or missing name field, THE API_Route SHALL return HTTP status 400 with a descriptive error message
2. WHEN the API_Route receives a request with an invalid or missing email field, THE API_Route SHALL return HTTP status 400 with a descriptive error message
3. WHEN the API_Route receives a request with an invalid or missing message field, THE API_Route SHALL return HTTP status 400 with a descriptive error message
4. THE API_Route SHALL reuse the existing validation logic from `contact-validation.ts` to validate incoming form data
5. WHEN the API_Route receives a request with an unsupported HTTP method, THE API_Route SHALL return HTTP status 405

### Requirement 4: Error Handling

**User Story:** As the site owner, I want the system to handle failures gracefully, so that visitors receive helpful feedback and the system remains stable.

#### Acceptance Criteria

1. IF the Email_Service is unavailable or returns an error, THEN THE API_Route SHALL return HTTP status 500 with a generic error message that does not expose internal details
2. IF the API_Route encounters an unexpected error during processing, THEN THE API_Route SHALL return HTTP status 500 with a generic error message
3. IF the API_Route receives a request body that cannot be parsed as JSON, THEN THE API_Route SHALL return HTTP status 400 with a descriptive error message

### Requirement 5: Rate Limiting

**User Story:** As the site owner, I want to limit how often the contact form can be submitted, so that the email service quota is not exhausted by abuse or automated spam.

#### Acceptance Criteria

1. WHEN a single IP address submits more than 5 requests within a 15-minute window, THE API_Route SHALL return HTTP status 429 with a message indicating the Visitor should try again later
2. THE Rate_Limiter SHALL reset the count for an IP address after the 15-minute window has elapsed
3. THE Rate_Limiter SHALL operate using in-memory storage suitable for a single serverless function instance

### Requirement 6: Configuration and Security

**User Story:** As the site owner, I want email service credentials stored securely and the API route protected from misuse, so that the system remains secure.

#### Acceptance Criteria

1. THE API_Route SHALL read the Email_Service API key from an environment variable named `RESEND_API_KEY`
2. THE API_Route SHALL read the recipient email address from an environment variable named `CONTACT_EMAIL_TO`
3. IF the required environment variables are not configured, THEN THE API_Route SHALL return HTTP status 500 with a generic error message and log the configuration error server-side
4. THE API_Route SHALL only accept POST requests and reject all other HTTP methods

