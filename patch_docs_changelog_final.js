const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs/CHANGELOG.md');
let content = fs.readFileSync(filePath, 'utf8');

const addedHeaderRegex = /## \[Unreleased\]\n\n### Added/;
const newFeatures = `
- **3PS Integration:** Added the ability to mark a route as being driven by a Third-Party Supplier (3PS) and log the supplier's name in the route editor. The Monitor page correctly displays this information.
- **Vehicle Image Uploads:** Enabled uploading up to 8 compressed photos per vehicle in the Fleet Management module.
- **Driver Image Uploads:** Enabled uploading up to 8 compressed photos per driver in the Workforce Management module.
`;

if (content.match(addedHeaderRegex)) {
    content = content.replace(addedHeaderRegex, "## [Unreleased]\n\n### Added" + newFeatures);
}

fs.writeFileSync(filePath, content);
console.log('Updated CHANGELOG.md with final features');
