const fs = require('fs');
const path = require('path');

let changelogPath = path.join(__dirname, 'docs/CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

const newChanges = `### Changed
- **Unified Action Button:** Streamlined the user interface by replacing local "Create New" buttons on various pages (like the Routes page and Fleet page) with a single, context-aware action button in the top right corner of the global header. This button automatically adapts its icon and action (e.g., "Nytt Kjøretøy", "Ny Rute", "Nytt personell") based on the current active view.
- **Contextual Global Search:** Upgraded the global search bar in the top navigation to be context-aware. When viewing the Fleet ("Kjøretøy") or Workforce ("Personell") pages, the search bar now automatically filters the respective lists on those pages, rather than redirecting the user to the generic Places search.

`;

changelog = changelog.replace('### Changed\n', newChanges);

fs.writeFileSync(changelogPath, changelog);
