## Purpose

Provides client-only account UI (signup, login, logout, password reset) in the product `app` using browser localStorage, as a temporary stub until real `backend` auth exists.

## ADDED Requirements

### Requirement: Auth routes

The product `app` MUST expose `/login`, `/signup`, `/forgot-password`, and `/reset-password` pages that reuse the Pickle Era auth presentation (AuthLayout / brand styling).

#### Scenario: Open login
- **WHEN** a visitor navigates to `/login`
- **THEN** they see the login form with a path to signup and password recovery

#### Scenario: Open signup
- **WHEN** a visitor navigates to `/signup`
- **THEN** they see the signup form

### Requirement: Local session stub

Auth MUST persist a signed-in user session in the browser (localStorage) for this device only. Signup MUST create a local user record; login MUST authenticate against that store; logout MUST clear the session. These flows MUST NOT call the product API.

#### Scenario: Signup then session
- **WHEN** a visitor completes signup with a valid name, email, and password (≥ 8 characters)
- **THEN** a local user is stored, a session is established, and the UI treats them as signed in

#### Scenario: Signup rejects short password
- **WHEN** a visitor submits signup with a password shorter than 8 characters
- **THEN** no user is stored, no session is created, and the UI shows an error

#### Scenario: Signup rejects duplicate email
- **WHEN** a visitor signs up with an email that already exists in the local store
- **THEN** no second user is stored, and the UI shows an error

#### Scenario: Login success
- **WHEN** a visitor logs in with credentials matching a local user
- **THEN** a session is established for that user

#### Scenario: Login failure
- **WHEN** a visitor submits incorrect email or password
- **THEN** the session remains empty and the UI shows an error

#### Scenario: Logout
- **WHEN** a signed-in user logs out from the navbar
- **THEN** the session is cleared and the UI shows the logged-out state

### Requirement: Password reset stub

Forgot-password MUST NOT send email and MUST NOT call the API. After a non-empty email is submitted, the UI MUST offer a path to `/reset-password` (query email allowed). Reset-password MUST update the local user store for a matching email; unknown emails MUST show an error. No email is ever delivered in this stub.

#### Scenario: Forgot password continues to reset
- **WHEN** a visitor submits a non-empty email on `/forgot-password`
- **THEN** the UI shows a continue state and can navigate to `/reset-password` with that email (no API or email send)

#### Scenario: Reset password for known email
- **WHEN** a visitor resets the password for an email that exists in the local store
- **THEN** subsequent login succeeds with the new password

#### Scenario: Reset password for unknown email
- **WHEN** a visitor attempts reset for an email that is not in the local store
- **THEN** the UI shows an error and no session is created

### Requirement: Navbar reflects session

The marketing Navbar MUST show login when logged out, and the user’s first name plus logout when logged in.

#### Scenario: Navbar when logged in
- **WHEN** a session exists and the visitor is on `/`
- **THEN** the navbar shows the first name and a logout control instead of login
