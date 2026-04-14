const fs = require('fs');
const file = 'docs/CHANGELOG.md';
let content = fs.readFileSync(file, 'utf8');

const change = `- **Geofence Constraints for Stamping:** Drivers are now prevented from starting their shift ("Start vakt") if their current GPS location is outside the permitted radius of their assigned base location or the organization's main depot.`;

content = content.replace(
  /### Changed/,
  `### Changed\n${change}`
);

fs.writeFileSync(file, content);
