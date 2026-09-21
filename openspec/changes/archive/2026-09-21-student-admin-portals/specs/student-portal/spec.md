## Purpose

Gives signed-in students a product app shell to see an overview, their bookings, a read-only court calendar, and profile — using stub/local data until backend APIs exist.

## ADDED Requirements

### Requirement: Student portal routes

The product `app` MUST expose authenticated student routes under `/app` (or equivalent `/app/*` tree) including at least: overview/home, my bookings, court calendar, and profile.

#### Scenario: Open student overview when signed in
- **WHEN** a signed-in student opens `/app`
- **THEN** they see the student portal overview (not the public marketing home)

#### Scenario: Open my bookings
- **WHEN** a signed-in student opens the my-bookings route
- **THEN** they see a list or empty state of bookings attributed to them (stub/fixture and/or local booking store filtered by their email)

#### Scenario: My bookings empty state
- **WHEN** a signed-in student has no matching bookings
- **THEN** they see an empty state that explains there are no bookings yet (not a blank page or error)

#### Scenario: Open court calendar
- **WHEN** a signed-in student opens the court calendar route
- **THEN** they see a day calendar of courts and occupied/available slots derived from stub bookings (read-only — no approve/reject)

#### Scenario: Court calendar empty day
- **WHEN** a selected date has no stub bookings
- **THEN** the calendar still shows the court/slot grid with an available/empty occupancy state (not a crash)

#### Scenario: Open profile
- **WHEN** a signed-in student opens the profile route
- **THEN** they see their stub session identity (name, email) and a way to log out or return to marketing

### Requirement: Student shell navigation

The student portal MUST provide persistent in-app navigation among overview, bookings, court calendar, and profile, and a path back to the public marketing site.

#### Scenario: Navigate between student pages
- **WHEN** a signed-in student uses portal nav
- **THEN** they can reach overview, bookings, court calendar, and profile without leaving the student shell
