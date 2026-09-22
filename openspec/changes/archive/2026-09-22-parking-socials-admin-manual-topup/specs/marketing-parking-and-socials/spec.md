## ADDED Requirements

### Requirement: Parking Space image loads
The marketing Space carousel parking slide SHALL reference an image asset that exists under the SPA `public/` folder with a path that resolves on case-sensitive hosts (e.g. Railway Linux). The image SHALL remain meaningfully alt-texted (parking at Pickle Era).

#### Scenario: Parking slide shows photo
- **WHEN** a visitor views the Space section parking slide
- **THEN** the parking image loads (no broken-image icon) and alt text identifies parking

### Requirement: Real social profile links
Marketing footer Instagram and Facebook links SHALL open the official Pickle Era profiles:
- Instagram: `https://www.instagram.com/pickle.era/`
- Facebook: `https://www.facebook.com/profile.php?id=61593869870368`
Links SHALL open in a new tab with `rel` appropriate for external destinations (e.g. `noopener noreferrer`).

#### Scenario: Footer Instagram
- **WHEN** a visitor activates the Instagram control in the footer
- **THEN** the browser navigates to `https://www.instagram.com/pickle.era/`

#### Scenario: Footer Facebook
- **WHEN** a visitor activates the Facebook control in the footer
- **THEN** the browser navigates to `https://www.facebook.com/profile.php?id=61593869870368`
