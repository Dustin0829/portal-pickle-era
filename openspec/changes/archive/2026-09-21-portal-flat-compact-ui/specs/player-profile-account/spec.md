## ADDED Requirements

### Requirement: Profile removes seed banner and page logout
The player/admin Profile page SHALL NOT display local seed account credentials. The Profile page SHALL NOT include a page-level Log out button; logout remains available from portal chrome.

#### Scenario: Seed banner gone
- **WHEN** an authenticated user opens Profile
- **THEN** the page does not show seed emails/passwords or a “Local seed accounts” info banner

#### Scenario: No profile page logout
- **WHEN** an authenticated user opens Profile
- **THEN** there is no Log out button on the profile page body

### Requirement: Profile photo upload
Authenticated users SHALL be able to upload a profile photo from Profile. The system SHALL persist a storage **key** on `User.image` and expose a resolved **`imageUrl`** on the me/session user DTO (presigned download, same pattern as food menu images). Profile SHALL display that `imageUrl` after save and after session refresh. Profile upload SHALL accept jpeg/png/webp only (PDF allowed for receipts MUST be rejected on Profile).

#### Scenario: Upload and display avatar
- **WHEN** a logged-in user selects a jpeg/png/webp file and confirms upload on Profile
- **THEN** the storage key is saved on the user, `me` returns a non-null `imageUrl`, and the Profile avatar shows that image

#### Scenario: Reject invalid upload types
- **WHEN** a user attempts to upload a PDF or other non-image type as profile photo
- **THEN** the client or API rejects before changing `User.image` and shows a clear error

#### Scenario: Session reflects new avatar
- **WHEN** avatar upload succeeds
- **THEN** the client refreshes `me`/session so subsequent Profile (and any chrome that shows avatar) uses the new `imageUrl`

### Requirement: Profile name edit
Authenticated users SHALL be able to update their display name from Profile via the existing authenticated patch-me name field. Email SHALL remain read-only on Profile.

#### Scenario: Update name
- **WHEN** a logged-in user submits a valid new name
- **THEN** `me` returns the updated name and Profile shows it without a “editing isn’t available” stub

### Requirement: Change password while logged in
Authenticated users SHALL be able to change their password from Profile by providing current password and a new password (min length matching signup/reset rules). Success SHALL update credentials without requiring the email reset-token flow and SHALL keep the user logged in. Failure with wrong current password SHALL show a clear error and leave the password unchanged.

#### Scenario: Successful password change
- **WHEN** a logged-in user submits valid current password and a new password meeting length rules
- **THEN** the password is updated, the session remains active, and subsequent login requires the new password

#### Scenario: Wrong current password
- **WHEN** a logged-in user submits an incorrect current password
- **THEN** the system rejects the change and the previous password still works
