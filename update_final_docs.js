const fs = require('fs');
const path = require('path');

let changelogPath = path.join(__dirname, 'docs/CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

const newAdditions = `### Added
- **External Workforce (Contractors):** Introduced a new system to register and manage hired external extras (Innleid). They receive a dedicated role with customized access, and administrators can log their specific agency contact information.
- **Workforce Statistics Dashboard:** Added a dynamic, date-based statistics overview to the Workforce page, providing administrators with an instant snapshot of personnel status (Working, Sick, Vacation, Off, and Contractors).
`;

changelog = changelog.replace('### Added\n', newAdditions);

fs.writeFileSync(changelogPath, changelog);
