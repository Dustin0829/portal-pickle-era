# admin-walk-in-desk-pay Specification

## Purpose
TBD - created by archiving change parking-socials-admin-manual-topup. Update Purpose after archive.
## Requirements
### Requirement: Walk-in assumes no account or credits
The Admin Bookings walk-in create flow SHALL treat the guest as having **no portal account** and **no wallet credits**. The walk-in UI SHALL NOT offer Pay with credits, wallet balance application, or require the guest to be a signed-in student.

#### Scenario: No credits UI on walk-in
- **WHEN** an admin opens Walk-in booking from Admin Bookings
- **THEN** there is no credits / wallet-apply control in that flow

### Requirement: Facility payment methods on walk-in
Walk-in desk pay SHALL present the facility’s configured **payment methods** (same admin Settings payment-methods list used by marketing/portal pay), so staff can record or show how the guest paid digitally (e.g. GCash, Maya, bank) when not paying cash.

#### Scenario: Methods from settings
- **WHEN** an admin reaches the pay/settle step of walk-in and Settings has one or more payment methods
- **THEN** those methods are available in the walk-in flow (labels/details consistent with facility settings)

#### Scenario: Empty methods still allow cash
- **WHEN** Settings has no usable payment methods configured
- **THEN** the admin can still complete walk-in via **Paid via cash**

### Requirement: Paid via cash on walk-in
Walk-in SHALL provide an explicit **Paid via cash** action (button or equivalent) that settles/creates the walk-in booking as cash at the desk without requiring a GCash/receipt upload for wallet top-up semantics.

#### Scenario: Paid via cash creates approved walk-in
- **WHEN** an admin confirms walk-in with **Paid via cash** (valid schedule + guest name)
- **THEN** the booking is created as an approved walk-in cash booking (existing walk-in create semantics), without wallet debit/credit

#### Scenario: Method vs cash are alternatives
- **WHEN** the admin selects a facility payment method path vs **Paid via cash**
- **THEN** only one settle path is used for that create (no mixing wallet credits)

