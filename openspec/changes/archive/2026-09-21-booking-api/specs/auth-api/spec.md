## ADDED Requirements

### Requirement: User accounts
The system SHALL store users with unique email, display name, password hash, role (`student` | `admin`), and timestamps. Passwords MUST NOT be returned in API responses.

#### Scenario: Signup creates student
- **WHEN** a client `POST /auth/signup` with name, email, and password
- **THEN** a user with role `student` is created and a session cookie is set

#### Scenario: Duplicate email
- **WHEN** signup uses an email that already exists
- **THEN** the system responds with a conflict/validation error

### Requirement: Login and logout
The system SHALL allow `POST /auth/login` with email + password to establish a session cookie, and `POST /auth/logout` to clear the session.

#### Scenario: Valid login
- **WHEN** credentials match
- **THEN** a session cookie is set and the user DTO is returned

#### Scenario: Invalid login
- **WHEN** credentials do not match
- **THEN** the system responds `401` without revealing which field failed

#### Scenario: Logout
- **WHEN** a client posts logout with a valid session
- **THEN** the session is invalidated and the cookie cleared

### Requirement: Current user
The system SHALL expose `GET /auth/me` returning the authenticated user DTO, or `401` when unauthenticated.

#### Scenario: Me when logged in
- **WHEN** a valid session cookie is present
- **THEN** `GET /auth/me` returns `id`, `name`, `email`, `role`

### Requirement: Update profile name
The system SHALL allow `PATCH /auth/me` for an authenticated user to update `name` only.

#### Scenario: Rename self
- **WHEN** a logged-in user patches `{ "name": "New Name" }`
- **THEN** the stored name updates and the new DTO is returned

### Requirement: Session security
Sessions MUST use an HttpOnly cookie (Secure in production), server-side session records (or equivalent revocable tokens), and hashed passwords (bcrypt or argon2).

#### Scenario: Cookie flags in production
- **WHEN** `NODE_ENV` is `production`
- **THEN** the session cookie is marked Secure
