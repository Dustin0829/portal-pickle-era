## ADDED Requirements

### Requirement: Waitlist list DTO includes optional profile imageUrl

The product API admin waitlist/players list response MUST include an optional nullable `imageUrl` on each lead entry. When a `User` exists whose email matches the lead email (normalized the same way as auth email normalization) and that user has a stored profile image key, the API MUST resolve a downloadable image URL (same approach as auth/profile user DTOs) and set `imageUrl`. When no matching user exists, the user has no image, or download URL resolution fails for that key, `imageUrl` MUST be `null` and the list response MUST still succeed. Create/upsert waitlist responses MUST include the `imageUrl` key (MAY be `null` without a user join).

#### Scenario: Matching user with photo
- **WHEN** an admin lists waitlist leads and a lead email matches a user with a profile image key
- **THEN** that lead’s DTO includes a non-null `imageUrl` suitable for `<img src>`

#### Scenario: Lead without portal user
- **WHEN** an admin lists waitlist leads and a lead email has no matching user
- **THEN** that lead’s DTO has `imageUrl: null`

#### Scenario: User without photo
- **WHEN** an admin lists waitlist leads and a matching user has no profile image key
- **THEN** that lead’s DTO has `imageUrl: null`

#### Scenario: Email match is case-insensitive
- **WHEN** a lead email and user email differ only by letter case (after trim)
- **THEN** the API still associates them for `imageUrl` enrichment

#### Scenario: Image URL resolve failure does not fail the list
- **WHEN** a matching user has an image key but download URL resolution fails for that key
- **THEN** that lead’s `imageUrl` is `null` and the rest of the waitlist list response still succeeds

#### Scenario: Create/upsert always returns imageUrl key
- **WHEN** a client creates or upserts a waitlist lead
- **THEN** the response includes `imageUrl` (MAY be `null` without a user join)

### Requirement: Players table shows profile photo with initials fallback

The facility admin Players page MUST display the lead’s profile photo in the Name column avatar when `imageUrl` is present, and MUST fall back to the existing initials badge when `imageUrl` is null or the image fails to load.

#### Scenario: Photo shown when imageUrl present
- **WHEN** the Players table renders a lead with a non-null `imageUrl`
- **THEN** the Name column avatar shows that image (not only initials)

#### Scenario: Initials when no imageUrl
- **WHEN** the Players table renders a lead with `imageUrl` null
- **THEN** the Name column keeps the initials avatar treatment
