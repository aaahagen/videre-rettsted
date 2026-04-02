const fs = require('fs');

// Update Strategy
let strategy = fs.readFileSync('docs/STRATEGY.md', 'utf8');

// Phase 1 is now fully completed
strategy = strategy.replace('## Phase 1: Foundational Enhancements & Core Data Models', '## Phase 1: Foundational Enhancements & Core Data Models (Completed)');
strategy = strategy.replace('6.  ~~**Messaging & Read Confirmation:** Implement a real-time messaging system with read receipts.~~ (Completed)\n7.  ~~**Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.~~ (Completed)', '6.  ~~**Messaging & Read Confirmation:** Implement a real-time messaging system with read receipts.~~ (Completed)\n7.  ~~**Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.~~ (Completed)\n8.  ~~**Driver Gamification:** Implement a visual progress bar reflecting the driver\\'s actual exploration of the organization\\'s delivery network.~~ (Completed)');
fs.writeFileSync('docs/STRATEGY.md', strategy);


// Update Changelog
let changelog = fs.readFileSync('docs/CHANGELOG.md', 'utf8');

// Add the most recent changes
const addedHook = '### Added\n';
const addedContent = `- **Gamification (Explorer Status):** Added a visual progress bar to the user profile dropdown (accessible by clicking the username in the sidebar). It calculates the driver's "Explorer Status" by dynamically comparing their historically completed stops against the total number of places registered to the organization.
- **Custom Vehicle Attributes:** Added a dynamic "Egendefinerte Egenskaper" (Custom Attributes) section to the vehicle registration form. Administrators can now define any number of custom key-value pairs (e.g., "Jekketralle: 2 stk", "Girkasse: Manuell") for a vehicle. These are displayed as stylish tags on the main fleet overview.
- **Trailer Support:** Added "Henger" (Trailer) as a primary vehicle type, and "Flakbil / Åpen Henger" (Flatbed) as a core capability toggle.
- **Physical Dimensions Tracking:** Administrators can now record a vehicle's exact Height, Width, and Length in meters. This crucial safety data is displayed prominently on the Fleet page.
- **Driver Route Context:** If a route is assigned to a vehicle with physical dimensions, those dimensions (Height, Width, Length) are now displayed directly in the top statistics bar of the driver's route view, ensuring they are aware of their constraints before driving.
- **Vehicle Note Fields:** Added dedicated text areas for supplementary notes regarding a vehicle's capacity (e.g., weight limits) and capabilities (e.g., included equipment). These notes render as distinct info boxes on the vehicle's card.
`;

changelog = changelog.replace(addedHook, addedHook + addedContent);

// Add the styling changes to the "Changed" section
const changedHook = '### Changed\n';
const changedContent = `- **Maximum Width Constraints:** Removed aggressive "container" overrides across all major dashboard views (Workforce, Monitor, Fleet, Routes, Places) to ensure the interface does not stretch awkwardly on ultra-wide desktop monitors. The entire application now maxes out at a comfortable 1280px width (max-w-7xl) and remains perfectly centered.
- **Vehicle Form UI:** Significantly enhanced the visual hierarchy of the "Registrer Nytt Kjøretøy" (Register New Vehicle) dialog. Employed stark white cards, distinct header backgrounds, subtle drop shadows on inputs, and rounded interactive toggles to make data entry much clearer and easier on the eyes.
`;

changelog = changelog.replace(changedHook, changedHook + changedContent);

fs.writeFileSync('docs/CHANGELOG.md', changelog);
