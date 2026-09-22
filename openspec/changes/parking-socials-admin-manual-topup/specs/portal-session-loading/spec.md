## ADDED Requirements

### Requirement: No login-skeleton flash on portal refresh
When an authenticated player or admin refreshes a protected portal URL (`/app/*` or `/admin/*`), the UI SHALL NOT briefly present the public login page or a bare auth-style skeleton that replaces the portal chrome in a way that looks like logout. While auth status is `loading`, the system SHALL keep a portal-appropriate loading state (portal chrome retained, or an in-layout “Checking session” treatment). The browser path SHALL remain the refreshed portal route until session resolution completes.

#### Scenario: Refresh while session valid
- **WHEN** a logged-in user refreshes `/app/bookings` (or another protected portal path) and `GET /auth/me` succeeds
- **THEN** they remain on that path and see portal content after loading, without navigating to `/login`

#### Scenario: Loading does not look like login
- **WHEN** auth status is `loading` on a protected portal route
- **THEN** the UI does not mount the login form / AuthLayout marketing login surface

#### Scenario: Truly unauthenticated still goes to login
- **WHEN** session check completes as unauthenticated
- **THEN** the user is redirected to `/login` (replace) as today
