## ADDED Requirements

### Requirement: Shared branded HTML email shell

All Resend transactional emails sent by the API MUST render through a shared HTML layout that includes: Pickle Era logo image at `{PUBLIC_APP_URL}/logo.png` (SPA public asset `app/public/logo.png`), a primary call-to-action rendered as a **yellow** button (brand yellow `#f5ed5a`, black label text), and a short footer identifying Pickle Era. Plain-text alternatives MUST remain meaningful without relying on the logo.

#### Scenario: Logo uses absolute SPA URL

- **WHEN** any branded transactional email is built
- **THEN** the logo `src` is an absolute URL under `resolvePublicAppUrl()` ending with `/logo.png`

#### Scenario: Yellow CTA present

- **WHEN** any branded transactional email includes a primary action link
- **THEN** that action is presented as a yellow background button with black text (not a bare underlined link alone as the only treatment)

### Requirement: Payment-received email uses branding

The payment-received acknowledgment email MUST use the shared branded shell. The primary CTA MUST link to the public app origin (or booking/marketing home under that origin).

#### Scenario: Payment received looks branded

- **WHEN** a public booking submit triggers the payment-received email and Resend is configured
- **THEN** the HTML body includes the logo, a yellow **View site** button to the public app origin, and booking summary details (date and reference when present)

### Requirement: Player invite email uses branding

The player invite credentials email MUST use the shared branded shell. The primary CTA MUST link to the portal login URL. Temporary password and email MUST still appear in the body (and plain text). Forgot-password guidance MUST remain.

#### Scenario: Invite CTA goes to login

- **WHEN** approve creates a new student and sends the invite email
- **THEN** the HTML includes logo, yellow **Log in** button to `{PUBLIC_APP_URL}/login`, and the temporary password in the body

### Requirement: Password reset email uses branding

The password reset email MUST use the shared branded shell. The primary CTA MUST be the one-time reset link to `{PUBLIC_APP_URL}/reset-password?token=…`.

#### Scenario: Reset CTA is yellow button

- **WHEN** a password reset email is sent
- **THEN** the HTML includes logo and a yellow **Reset password** button whose href is the reset URL with the token

### Requirement: Branding failure does not block sends

Missing logo asset or client-side image blocking MUST NOT prevent the email from being sent or strip the textual content and CTA href. Send skip/failure rules for missing `RESEND_API_KEY` / `EMAIL_FROM` remain unchanged.

#### Scenario: Resend unset still skips safely

- **WHEN** Resend is not configured
- **THEN** branded template construction MUST NOT throw; existing skip/log behavior remains
