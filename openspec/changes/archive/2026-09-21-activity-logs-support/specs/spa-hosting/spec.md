## Purpose

Lets both Vite apps deploy as SPAs on Vercel and show a real not-found page for unknown client routes instead of a blank router miss.

## ADDED Requirements

### Requirement: Catch-all 404 page

The product `app` and `support` SPAs MUST each define a catch-all client route that renders a not-found page (title, short explanation, link back to the app home). Unknown paths MUST NOT render an empty outlet.

#### Scenario: Unknown product path
- **WHEN** a user opens a path that is not a defined `app` route (for example `/no-such-page`)
- **THEN** they see the 404 page with a way back to home

#### Scenario: Unknown support path
- **WHEN** an operator opens a path that is not a defined `support` route
- **THEN** they see the 404 page with a way back to the support home (activity logs)

### Requirement: Vercel SPA rewrite

Each of `app` and `support` MUST include `vercel.json` that rewrites all paths to `index.html` so client-side routing works after a static deploy.

#### Scenario: Direct load of a client route
- **WHEN** Vercel serves a deep link using that rewrite
- **THEN** the SPA loads `index.html` instead of a platform 404
