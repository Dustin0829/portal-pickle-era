## ADDED Requirements

### Requirement: Tabbed admin Settings
The admin Settings page SHALL organize existing facility settings into primary tabs labeled **Prices**, **Open play sessions**, **Payment Method**, and **Food menu**. Each tab SHALL show only that section’s controls (not the full previous long-scroll of all sections at once). Saving behavior for each section SHALL remain independent (save prices does not require saving payment, etc.).

#### Scenario: Switch to Open play sessions tab
- **WHEN** an admin opens Settings and selects the **Open play sessions** tab
- **THEN** the Open Play session editor is visible and the Food menu editor is not shown in the same view

#### Scenario: Food menu remains editable
- **WHEN** an admin selects the **Food menu** tab
- **THEN** they can create/update menu items as before (including image upload where already supported)

#### Scenario: Pre-signup placement
- **WHEN** pre-signup settings still exist in the facility settings store
- **THEN** they appear under the **Prices** tab (or an equivalent non-primary overflow within Prices) — not as a fifth primary tab
