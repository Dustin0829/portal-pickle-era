## ADDED Requirements

### Requirement: Indoor Outdoor court grid toggle
In the unified booking schedule Courts·Times section (marketing booking modal and admin walk-in), the system SHALL provide an **Indoor | Outdoor** toggle that filters the court columns to the three courts in that group. Default SHALL be Indoor. Selecting Outdoor SHALL show outdoor courts only. Open Play session strip above Courts·Times SHALL remain unchanged by this toggle.

#### Scenario: Default shows indoor courts
- **WHEN** the user views Courts·Times with no prior group choice
- **THEN** only Indoor courts (Courts 1–3) appear as columns

#### Scenario: Switch to outdoor
- **WHEN** the user selects Outdoor
- **THEN** only Outdoor courts (Courts 4–6) appear as columns and Indoor columns are hidden

#### Scenario: Open Play strip independent
- **WHEN** the user toggles Indoor/Outdoor
- **THEN** the Open Play session strip (labels, capacity, selection) continues to behave as before and is not filtered by Indoor/Outdoor

#### Scenario: Selection retained across toggle
- **WHEN** the user has selected hours on an Outdoor court and then switches the toggle to Indoor
- **THEN** Outdoor columns hide but the Outdoor hour selection remains in booking state (visible again when switching back to Outdoor) unless the user clears selection or changes plan

### Requirement: Calmer Courts Times cell presentation
Courts·Times cells SHALL use a clearer reference-style presentation (readable hour labels and court headers; distinct states for available, selected, held/booked, and Open-Play-reserved) without requiring the user to scan all six courts at once (paired with the Indoor/Outdoor toggle). Left facility map SHALL remain.

#### Scenario: Reserved hour still labeled
- **WHEN** a court hour is blocked one-way by Open Play
- **THEN** the cell shows the reserved-for-Open-Play presentation (not selectable for private court)

#### Scenario: Multi-hour court selection still works
- **WHEN** the user taps multiple hours on one visible court
- **THEN** selection still applies court plan multi-hour rules as before
