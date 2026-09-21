## Purpose

Delivers the public Pickle Era marketing experience as the product `app` home: branded landing sections, chrome, and static assets, without requiring the backend.

## ADDED Requirements

### Requirement: Marketing home replaces starter demo

The product `app` MUST render the Pickle Era marketing landing at `/` as a full-bleed page (not the starter ExamplesSection / counter demo). The landing MUST include the primary marketing sections: Hero, Pricing, Book CTA, Vibe, Space, Pillars, Location, FAQ, and Waitlist, plus site Navbar and Footer.

#### Scenario: Visitor opens home
- **WHEN** a visitor opens `/`
- **THEN** they see the Pickle Era marketing landing with brand chrome and the listed sections

#### Scenario: Starter demo is not the home
- **WHEN** a visitor opens `/`
- **THEN** they MUST NOT see the starter ExamplesSection demo as the primary home content

### Requirement: Brand assets and document metadata

The product `app` MUST serve Pickle Era brand images and favicon from `public/`, and MUST set document title and description appropriate to Pickle Era. Brand display fonts used by the marketing UI MUST load for the marketing routes.

#### Scenario: Hero imagery loads
- **WHEN** a visitor views the home hero
- **THEN** brand images resolve from the app’s static public assets (no broken image paths from the old standalone repo)

#### Scenario: Tab title
- **WHEN** a visitor opens the app
- **THEN** the document title identifies Pickle Era (not the generic starter “App” title)

### Requirement: In-page navigation anchors

The marketing Navbar MUST provide in-page links to the major landing sections. Scrolling to those sections MUST land with usable offset under the sticky header.

#### Scenario: Jump to FAQ
- **WHEN** a visitor activates the FAQ nav link on `/`
- **THEN** the FAQ section is brought into view without being hidden under the sticky navbar

### Requirement: Unknown routes still 404

The product `app` MUST keep a catch-all client route that renders the not-found page with a way back to home.

#### Scenario: Unknown path
- **WHEN** a visitor opens a path that is not a defined marketing or auth route
- **THEN** they see the 404 page with a link back to `/`
