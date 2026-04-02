const fs = require('fs');
const file = 'docs/STRATEGY.md';
let content = fs.readFileSync(file, 'utf8');

const targetPhase1 = `    *   *Note: Real-time exact timestamps for each stop are still pending a data model update to the Route completion array.*
5.  **Messaging & Read Confirmation:** Implement a real-time messaging system with read receipts.
6.  **Driver Location & Timestamps:** Capture GPS location and timestamps for an audit trail for every stop.
7.  **Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.`;

const newPhase1 = `    *   ~~*Note: Real-time exact timestamps for each stop are still pending a data model update to the Route completion array.*~~ (Completed)
5.  ~~**Driver Location & Timestamps:** Capture GPS location and timestamps for an audit trail for every stop.~~ (Completed)
6.  **Messaging & Read Confirmation:** Implement a real-time messaging system with read receipts.
7.  **Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.`;

content = content.replace(targetPhase1, newPhase1);
fs.writeFileSync(file, content);
