## ADDED Requirements

### Requirement: Richer brand yellow token
The product SHALL use richer gold yellow `#F5C518` as the primary brand yellow via the shared CSS token `--color-yellow` (and matching `--primary` / `--ring` where those currently hardcode the old neon). Backend branded email HTML SHALL use the same hex for CTA/accent consistency.

#### Scenario: Token updated in app CSS
- **WHEN** a portal or marketing surface uses `bg-yellow`, `text-yellow`, or `border-yellow`
- **THEN** the rendered color is `#F5C518` (not `#f5ed5a`)

#### Scenario: Email brand accent matches
- **WHEN** the API builds a branded Resend HTML email
- **THEN** CTA/accent yellow in the HTML is `#F5C518`

### Requirement: Flat compact portal chrome without backdrop photos
Player and admin portal pages SHALL present a flat, denser layout: reduced card radius/shadow emphasis and tighter vertical spacing relative to the pre-change “spacious card” look. Portal pages SHALL NOT render `PortalBackdrop` (court/ball photo decorations). Sidebar logout in portal chrome SHALL remain available.

#### Scenario: No backdrop on player overview
- **WHEN** an authenticated player opens `/app` (overview)
- **THEN** the page does not include the portal court/ball backdrop imagery

#### Scenario: No backdrop on admin dashboard
- **WHEN** an authenticated admin opens `/admin`
- **THEN** the page does not include the portal court/ball backdrop imagery

#### Scenario: Sidebar logout still present
- **WHEN** a player or admin uses the portal chrome sidebar
- **THEN** a Log out control remains available in the chrome (not only on the profile page)
