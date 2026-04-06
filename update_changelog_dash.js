const fs = require('fs');
const path = './docs/CHANGELOG.md';
let code = fs.readFileSync(path, 'utf8');

const newChangelogEntry = `## [Unreleased]

### Changed
- **Admin Dashboard Separation:** Redesigned the admin experience by clearly separating the operational dashboard (\`/dashboard\`) from the management console (\`/dashboard/admin\`).
- **Admin Operational Dashboard:** The main dashboard for administrators now features a high-level operational overview, directly integrating real-time statistics from both the Workforce (Personnel working/sick/vacation) and Monitor (Routes & Stops progress) modules. It also includes their personal time-stamping card and pending invitations.
- **Admin Management Console:** The \`/dashboard/admin\` page is now strictly dedicated to organizational settings, user/role management, and data import/export functionalities.
`;

code = code.replace('## [Unreleased]', newChangelogEntry);

fs.writeFileSync(path, code);
console.log("Updated CHANGELOG.md");
