const fs = require('fs');
const file = 'docs/CHANGELOG.md';
let content = fs.readFileSync(file, 'utf8');

const additionalFeatures = `- **Route Deletion:** Added the ability for admin users to delete routes directly from the routes overview page.`;

content = content.replace(/### Added\n/, "### Added\n" + additionalFeatures + "\n");
fs.writeFileSync(file, content);
