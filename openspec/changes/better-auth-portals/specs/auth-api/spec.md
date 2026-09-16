## ADDED Requirements

### Requirement: User accounts
The system SHALL store users with unique email, display name, credential suitable for password login, role (`student` | `admin`), and timestamps. Passwords MUST NOT be returned in API responses. New self-serve signups MUST receive role `student`.

#### Scenario: Signup creates student
- **WHEN** a client signs up with name, email, and password through the product auth API
- **THEN** a user with role `student` is created, an authenticated session cookie is set, and the response uses the product success envelope with status `201`

#### Scenario: Duplicate email
- **WHEN** signup uses an email that already exists
- **THEN** the system responds with a conflict or validation error without creating a second user

### Requirement: Login and logout
The system SHALL allow email + password login to establish a revocable server-side session cookie, and logout to invalidate that session and clear the cookie.

#### Scenario: Valid login
- **WHEN** credentials match an existing user
- **THEN** a session cookie is set and the response body uses the product success envelope whose `data` is the public user DTO (`id`, `name`, `email`, `role`)

#### Scenario: Invalid login
- **WHEN** credentials do not match
- **THEN** the system responds `401` without revealing which field failed

#### Scenario: Logout
- **WHEN** a client logs out with a valid session
- **THEN** the session is invalidated and the session cookie is cleared

#### Scenario: Logout without session
- **WHEN** a client logs out with no valid session cookie
- **THEN** the system still responds success and clears any session cookie attributes it controls

### Requirement: Current user
The system SHALL expose a current-user endpoint that returns the authenticated public user DTO, or `401` when unauthenticated.

#### Scenario: Me when logged in
- **WHEN** a valid session cookie is present
- **THEN** the current-user endpoint returns `id`, `name`, `email`, `role`

#### Scenario: Me when logged out
- **WHEN** no valid session cookie is present
- **THEN** the current-user endpoint responds `401`

#### Scenario: Me with expired session
- **WHEN** the session cookie refers to an expired or revoked session
- **THEN** the current-user endpoint responds `401`

### Requirement: Update profile name
The system SHALL allow an authenticated user to update their display `name` only (not email or role) via the product auth API.

#### Scenario: Rename self
- **WHEN** a logged-in user patches `{ "name": "New Name" }`
- **THEN** the stored name updates and the new public user DTO is returned in the product success envelope

#### Scenario: Cannot escalate role via profile patch
- **WHEN** a logged-in student sends a patch body that includes `role` or `email`
- **THEN** those fields are ignored or rejected and the user’s role and email remain unchanged

### Requirement: Session security and production cookies
Sessions MUST use an HttpOnly cookie, server-side session records (or equivalent revocable tokens), and hashed passwords. In production (`NODE_ENV=production`), the session cookie MUST be `Secure`. When the API public origin is a subdomain of the product apex (e.g. `api.pickleera.co` with web on `pickleera.co`), the session cookie MUST be set with cookie `Domain` of that apex (e.g. `.pickleera.co`) so the SPA origin can send it on credentialed API requests.

#### Scenario: Cookie flags in production
- **WHEN** `NODE_ENV` is `production` and the configured public API/web hosts share apex `pickleera.co`
- **THEN** the session cookie is HttpOnly, Secure, and scoped to `.pickleera.co`

#### Scenario: Local development cookies
- **WHEN** auth runs against localhost API and web origins
- **THEN** session cookies work without requiring a shared production apex Domain attribute

### Requirement: CORS trusted web origin
Credentialed browser calls from the product web origin MUST be allowed. Production MUST trust `https://pickleera.co` (and configured local origins in development).

#### Scenario: Credentialed request from web
- **WHEN** the SPA on the trusted web origin calls the API with `credentials: include` and a valid session cookie
- **THEN** CORS allows the request and the session is accepted

### Requirement: Product admin session gate
Product admin HTTP routes that use the product admin gate MUST treat a valid session whose user `role` is `admin` as authorized. Non-admin sessions MUST NOT pass the cookie path of that gate (Basic Auth / open-local fallback behavior MAY still apply as today).

#### Scenario: Admin session reaches product admin routes
- **WHEN** an admin-role user has a valid session cookie and calls a product admin route protected by the product admin gate
- **THEN** the request is authorized via that session

#### Scenario: Student session blocked on cookie path
- **WHEN** a student-role user has a valid session cookie and calls a product admin route, and Basic Auth / open-local fallback does not authorize the request
- **THEN** the request is denied

### Requirement: Portal auth uses API session
The product web app MUST establish and restore portal auth from the API session (not a client-only stub). Student and admin portal route guards MUST use the API-backed user role.

#### Scenario: Admin portal sees authenticated admin
- **WHEN** an admin logs in via the product login flow on the configured web origin against the configured API origin
- **THEN** `/auth/me` (or equivalent current-user call) succeeds with `role: admin` and `/admin/*` portal routes are reachable

#### Scenario: Student portal uses student session
- **WHEN** a student logs in via the product login flow
- **THEN** `/app/*` portal routes are reachable and `/admin/*` remains blocked for that session

### Requirement: Session-backed bookings callers
Authenticated booking routes that depend on `req.authUser` MUST continue to work with Better Auth sessions. Unauthenticated `GET /me/bookings` MUST still return `401`.

#### Scenario: My bookings with session
- **WHEN** a logged-in user calls `GET /me/bookings` with a valid Better Auth session cookie
- **THEN** the request is authorized and returns that user’s bookings (empty list allowed)

#### Scenario: My bookings without session
- **WHEN** a client calls `GET /me/bookings` without a valid session
- **THEN** the system responds `401`

### Requirement: Product auth response envelope
Product auth endpoints used by the SPA (`/auth/signup`, `/auth/login`, `/auth/logout`, `/auth/me`, `PATCH /auth/me`) MUST return the existing product success envelope (`success` + `data`) so the web Axios client can unwrap `data` unchanged.

#### Scenario: Login envelope
- **WHEN** login succeeds
- **THEN** the JSON body includes `success: true` and `data` containing the public user DTO
