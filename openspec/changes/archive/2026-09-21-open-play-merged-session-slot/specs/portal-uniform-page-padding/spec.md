## ADDED Requirements

### Requirement: Food-tab shell padding is the portal standard
Player and admin portal main content areas SHALL use the same outer page padding as the player Food tab: horizontal `px-4 sm:px-6` and vertical `py-8 sm:py-10` (as provided by `AppPageShell` / `appContentPaddingClass`). Pages MAY keep different `max-w-*` content widths. Modal dialogs and overlays are out of scope for this requirement.

#### Scenario: Player Food remains the reference
- **WHEN** the player Food page is shown
- **THEN** its shell padding matches `AppPageShell` (`px-4 sm:px-6` and `py-8 sm:py-10`)

#### Scenario: Player Calendar matches Food padding
- **WHEN** the player Court Calendar page is shown
- **THEN** its main content outer padding matches Food (not the tighter `py-4 sm:py-5` custom wrapper)

#### Scenario: Other player tabs match Food padding
- **WHEN** Overview, My Bookings, Wallet, or Profile is shown
- **THEN** each uses the same shell horizontal and vertical padding as Food

#### Scenario: Admin Calendar and Settings match Food padding
- **WHEN** admin Court Calendar or Settings is shown
- **THEN** each main content outer padding matches Food (not custom `py-4 sm:py-5` only)

#### Scenario: Other admin list tabs match Food padding
- **WHEN** admin Dashboard, Bookings, Waitlist, Wallet top-ups, or Food orders is shown
- **THEN** each uses the same shell horizontal and vertical padding as Food
