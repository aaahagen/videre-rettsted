const fs = require('fs');
const file = 'docs/CHANGELOG.md';
let content = fs.readFileSync(file, 'utf8');

const newEntry = `### Added
- **Route Optimization:** Users can now click an "Optimer" (Optimize) button when building routes. This utilizes the Google Maps Directions API to solve the traveling salesperson problem, automatically rearranging the intermediate stops into the most efficient driving order, significantly reducing delivery times. Includes safeguards against API limits (max 25 intermediate stops).
`;

content = content.replace('### Added\n', newEntry);

fs.writeFileSync(file, content);
