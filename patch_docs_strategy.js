const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs/STRATEGY.md');
let content = fs.readFileSync(filePath, 'utf8');

// Update Phase 1 to reflect completion of goals
content = content.replace(
    "1.  **Core Fleet Management:** Create the database structure and UI for `Vehicle Profiles`.",
    "1.  ~~**Core Fleet Management:** Create the database structure and UI for `Vehicle Profiles`.~~ (Completed)"
);
content = content.replace(
    "2.  **Workforce Management & Driver Profiles:** Create the database structure and UI for `Driver Profiles` to manage workforce details (e.g., working hours, certifications, skills).",
    "2.  ~~**Workforce Management & Driver Profiles:** Create the database structure and UI for `Driver Profiles` to manage workforce details (e.g., working hours, certifications, skills, and advanced rotation schedules).~~ (Completed)"
);

content = content.replace(
    "4.  **Monitor Page UI/UX Refinements:**",
    "4.  ~~**Monitor Page UI/UX Refinements:**~~ (Completed)"
);
content = content.replace(
    /\*   \*\*Card Content & Layout:\*\*[\s\S]*?leaving the monitor page\./,
    "*   ~~Added direct links to places.~~\n        *   ~~Simplified status indicators.~~\n        *   ~~Added expand/collapse functionality to route cards.~~\n        *   *Note: Real-time exact timestamps for each stop are still pending a data model update to the Route completion array.*"
);

// Update Phase 5 (Offline)
content = content.replace(
    "1.  **Offline-Capable Mobile Application:** Develop a downloadable application (likely a PWA or native app) that allows users to access and interact with their essential data (e.g., routes, places) even when offline. The app will sync its data with the backend whenever a connection becomes available.",
    "1.  **Offline-Capable Mobile Application:** Develop a downloadable application (likely a PWA or native app) that allows users to access and interact with their essential data (e.g., routes, places) even when offline. The app will sync its data with the backend whenever a connection becomes available. *(Note: Firestore IndexedDB offline caching is already enabled at the data layer).* "
);


fs.writeFileSync(filePath, content);
console.log('Updated STRATEGY.md');
