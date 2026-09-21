## ADDED Requirements

### Requirement: Reference booking modal layout
The unified booking schedule (marketing BookingModal and admin walk-in) SHALL present a light cream/off-white schedule chrome matching the Courts·Times reference structure: header with back control and selected-date summary labeled for date/time selection; a plan chooser for **Open Play** and **Private Court** (private price from facility settings); a horizontal date strip for day selection; and a Times × CRT grid for the active court group.

#### Scenario: Plan chooser visible
- **WHEN** the booking schedule is shown
- **THEN** the user can select Open Play or Private Court without using a dark six-court-only chrome as the primary UI

#### Scenario: Date strip selects day
- **WHEN** the user picks another day on the horizontal date strip
- **THEN** the grid refreshes for that date (same bookable-floor / occupancy rules as today)

### Requirement: Open Play spans court columns; private is per court
For Open Play session rows, the schedule SHALL show one selectable cell spanning all visible court columns (CRT 1–3 for the active group). For private court hours, each court column SHALL have its own cell. Indoor|Outdoor toggle SHALL still filter to three courts. One-way Open Play reserved hours and capacity rules SHALL continue to apply.

#### Scenario: Open Play wide cell
- **WHEN** an Open Play session is available for the selected date
- **THEN** that session appears as one wide control across the three CRT columns

#### Scenario: Private hour per court
- **WHEN** Private Court is active and an hour is available on Court 2
- **THEN** only that court’s cell for that hour is independently selectable

### Requirement: Court photo on the right
The booking schedule layout SHALL show a court/facility picture on the right side of the modal (or right column on wide viewports), with the Times×CRT grid occupying the left/center. On narrow viewports the photo MAY stack below or above the grid but MUST remain visible without requiring a separate page. When `compact` admin embedding is used, the photo MAY be omitted if space is constrained, but the light reference grid structure SHALL still apply.

#### Scenario: Wide layout shows photo right
- **WHEN** the booking modal is viewed at desktop width (non-compact)
- **THEN** the court picture appears to the right of the schedule grid

#### Scenario: Compact admin may omit photo
- **WHEN** the schedule is embedded with `compact`
- **THEN** the Times×CRT reference grid still renders; the court photo may be hidden

### Requirement: Back control and plan switching
The schedule header SHALL include a back control that closes the booking modal (or invokes the parent close handler). Choosing Open Play vs Private Court SHALL update the unified selection plan consistently with existing selection helpers (picking an Open Play session selects open-play; picking a court hour selects court).

#### Scenario: Back closes modal
- **WHEN** the user activates Back in the schedule header
- **THEN** the booking modal closes (or the parent `onClose` runs)

#### Scenario: Open Play cell sets open-play plan
- **WHEN** the user selects an available Open Play wide session cell
- **THEN** selection becomes Open Play for that session (capacity rules unchanged)
