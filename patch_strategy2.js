const fs = require('fs');
const file = 'docs/STRATEGY.md';
let content = fs.readFileSync(file, 'utf8');

const targetPhase1 = `6.  **Messaging & Read Confirmation:** Implement a real-time messaging system with read receipts.
7.  **Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.`;

const newPhase1 = `6.  ~~**Messaging & Read Confirmation:** Implement a real-time messaging system with read receipts.~~ (Completed)
7.  **Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.`;

content = content.replace(targetPhase1, newPhase1);
fs.writeFileSync(file, content);
