const fs = require('fs');

let strategy = fs.readFileSync('docs/STRATEGY.md', 'utf8');
strategy = strategy.replace('7.  **Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.', '7.  ~~**Route Archiving & Templates (Tier 1):** Implement the ability to save completed routes as templates.~~ (Completed)');
fs.writeFileSync('docs/STRATEGY.md', strategy);

let changelog = fs.readFileSync('docs/CHANGELOG.md', 'utf8');
const addedHook = '### Added\n';
const addedContent = `- **Route Templates:** Administrators can now save any configured route as a reusable "Template" (Mal). A new "Maler" tab on the Routes overview page displays all saved templates. Opening a template allows the user to quickly spawn a brand new, active route based on the template's stop sequence, addresses, and time settings.\n`;
changelog = changelog.replace(addedHook, addedHook + addedContent);
fs.writeFileSync('docs/CHANGELOG.md', changelog);
