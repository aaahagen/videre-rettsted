const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs/CHANGELOG.md');
let content = fs.readFileSync(filePath, 'utf8');

const unreleasedHeader = "## [Unreleased]\n\n### Added";

const newFeatures = `
- **Fleet Management Module:** Added a complete system for administrators to register and manage the organization's vehicle fleet.
    - **Vehicle Profiles:** Created database structures and UI to capture detailed vehicle properties including type (truck, van, car), fuel type, dimensions, capacity (weight, volume, pallets), and special capabilities (refrigeration, tail-lift, ADR, trailer coupling).
    - **Fleet Overview Page:** Added \`/dashboard/fleet\` for admins to view, add, edit, and delete vehicles.
- **Workforce Management Module:** Added a comprehensive system for managing driver profiles and work schedules.
    - **Driver Profiles:** Extended user data to include standard working hours, certifications (e.g., ADR, Truck), and special skills. Admin UI updated to allow editing these profiles.
    - **Advanced Scheduling Engine:** Implemented a robust scheduling system supporting standard working hours, single-day overrides (vacation, sick leave, custom hours), and a fully customizable multi-week rotation (Turnusplan) system.
    - **Personnel Overview Page:** Added \`/dashboard/workforce\` allowing admins to select a date and instantly see the calculated working status of every driver based on the scheduling engine rules.
    - **12-Week Plan Printout:** Built a dedicated, print-optimized page (\`/dashboard/workforce/print\`) that generates a professional 12-week schedule grid for any selected driver.
- **Monitor Page Enhancements:**
    - **Collapsible Route Details:** The route cards on the monitor page can now be clicked to expand/collapse the full list of stops, saving screen space.
    - **Smart Stop Hiding:** When collapsed, the card intelligently hides completed and distant upcoming stops, summarizing them with text (e.g., "... 5 gjenstående stopp skjult ...").
    - **Direct Place Links:** Place names within the monitor route view are now clickable links leading directly to the place details page.
    - **Vehicle Display:** Route cards now prominently display the assigned vehicle alongside the assigned driver.
    - **Clear Completion State:** Route cards now have a static color header (red for active, green for finished) and display a clear "Rute ferdigstilt" message when 100% complete.
- **Offline Persistence:** Explicitly enabled Firestore's IndexedDB local cache to ensure the application remains readable and can queue writes even during network outages.
`;

if (content.includes("## [Unreleased]")) {
    content = content.replace(unreleasedHeader, unreleasedHeader + newFeatures);
} else {
    // Fallback if structure is slightly different
    content = content.replace("## [Unreleased]\n", "## [Unreleased]\n\n### Added\n" + newFeatures);
}

// Remove the completed items from the [Future] section
content = content.replace(/- \*\*Core Fleet Management:\*\* Create the database structure and UI for \`Vehicle Profiles\`.\n/g, '');
content = content.replace(/- \*\*Workforce Management & Driver Profiles:\*\* Create the database structure and UI for \`Driver Profiles\` to manage workforce details \(e\.g\., working hours, certifications, skills\)\.\n/g, '');
content = content.replace(/- \*\*Monitor Page UI\/UX Refinements:\*\*[\s\S]*?- \*\*Interactivity:\*\*\n\s+\*   Implement an "expand\/collapse" feature on route cards to allow planners to see the full list of stops on demand without leaving the monitor page\.\n/g, '');


fs.writeFileSync(filePath, content);
console.log('Updated CHANGELOG.md');
