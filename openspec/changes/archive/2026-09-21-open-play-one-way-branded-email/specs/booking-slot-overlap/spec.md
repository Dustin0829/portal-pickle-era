## ADDED Requirements

### Requirement: Open Play create ignores court occupancy

Creating an Open Play booking MUST NOT be rejected solely because a pending or approved court or clinic booking occupies an hour covered by that session. Open Play capacity limits and other existing Open Play rules MUST still apply. Open Play → court hour blocking (facility-wide) MUST remain enforced for court/clinic creates.

#### Scenario: Open Play allowed despite court hour

- **WHEN** a court booking exists for date D at `08:00` on any court
- **THEN** creating an Open Play booking for the 7:00–9:00 session on date D succeeds (subject to capacity and other Open Play rules)

#### Scenario: Court create still blocked by Open Play

- **WHEN** Open Play has a pending or approved booking for the 7:00–9:00 session on date D
- **THEN** creating a court booking on date D that includes `07:00` or `08:00` is still rejected as a conflict

## REMOVED Requirements

### Requirement: Court rental blocks overlapping Open Play sessions

**Reason:** Product decision — Open Play must remain bookable even when court hours are taken; only Open Play blocks court rent (one-way).

**Migration:** Remove the court/clinic → Open Play conflict branch in `assertNoCrossPlanSlotConflict` (and equivalent create paths). Remove Open Play booking UI that marks sessions “Court booked” / unavailable due to court occupancy. Update tests that expected Open Play rejection when a court hour is held.

## MODIFIED Requirements

### Requirement: Occupancy and UI reflect cross-plan blocks

Occupancy APIs and booking UIs (marketing modal and any portal surfaces that select court hours vs Open Play sessions) MUST treat **Open Play → court** conflicts as unavailable for court rental / clinic hourly selection. Open Play session pickers MUST NOT disable sessions because of court or clinic occupancy (capacity and past-time rules still apply).

When a court hour is blocked solely because it is covered by a pending or approved Open Play booking, the court rent UI MUST show that hour as reserved: **yellow background**, **black text**, and the exact label **Reserved for Open play**. The hour MUST remain non-selectable. If a court hour is also held by a court booking for the selected court, the court hold treatment for that court takes precedence over the Open Play reserved style.

#### Scenario: Court UI reserved for Open Play

- **WHEN** Open Play has a pending or approved booking for the 7:00–9:00 session on date D and the selected court’s hour is not otherwise held
- **THEN** court rental UI for date D marks hours `07:00` and `08:00` unavailable with yellow background, black text, and label “Reserved for Open play”

#### Scenario: Open Play UI ignores court occupancy

- **WHEN** a court booking occupies `08:00` on date D
- **THEN** Open Play UI still offers the 7:00–9:00 session (subject to capacity and past-time rules) and MUST NOT show a “Court booked” unavailable state for that reason

#### Scenario: Court hold beats Open Play reserved style

- **WHEN** a court hour is held by a pending or approved court booking on the selected court
- **THEN** the court UI shows the existing pending/approved hold treatment for that court, not the Open Play reserved style
