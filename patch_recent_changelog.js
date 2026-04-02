const fs = require('fs');
const file = 'docs/CHANGELOG.md';
let content = fs.readFileSync(file, 'utf8');

const targetAdded = `### Added
- **Real-time Messaging System:`;

const newAdded = `### Added
- **Route Completion Confirmation:** Drivers are now required to explicitly type "Ferdig" into a confirmation dialog to complete a route, preventing accidental completions.
- **Route Locking:** Once a route is marked as completed, it becomes locked for the driver. Drivers cannot check/uncheck stops or edit the route anymore. Administrators retain full editing rights for corrections.
- **Real-time Messaging System:`;

content = content.replace(targetAdded, newAdded);

const targetChanged = `### Changed
- **Unified Action Button:`;

const newChanged = `### Changed
- **Route Notes Visibility:** "Viktig Ruteinformasjon" (Important Route Information) for drivers has been integrated directly into the top of the task list as a high-contrast amber box. This ensures it is immediately visible before they start their route.
- **Sidebar Navigation:** The "Meldinger" (Messages) link has been repositioned directly below "Ruter" in the sidebar for better workflow grouping.
- **Unified Action Button:`;

content = content.replace(targetChanged, newChanged);

const targetFixed = `### Fixed
- **Form Layout Fixes:`;

const newFixed = `### Fixed
- **Firestore Permissions:** Resolved permission-denied errors related to the new real-time messaging system and the revocation/deletion of pending invitations by administrators.
- **Monitor Page Rendering:** Fixed an issue where the completion state of routes (e.g., green styling, checkmarks) occasionally failed to render due to broken template literals.
- **Form Layout Fixes:`;

content = content.replace(targetFixed, newFixed);

fs.writeFileSync(file, content);
