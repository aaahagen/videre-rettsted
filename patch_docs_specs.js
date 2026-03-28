const fs = require('fs');
const file = 'docs/SPECS.md';
let content = fs.readFileSync(file, 'utf8');

const additionalFeatures = `

### 6. Route Management
- Admins can create and delete delivery routes.
- Routes consist of an ordered list of places.
- Admins can assign a specific driver to a route.
- The route details page shows total estimated distance and time.
- Integrated route optimization to automatically re-order stops for the shortest travel time using Google Maps Directions API.`;

content = content.replace(/### 5. Search & Organization(.*?)\n\n## Language Support/s, "### 5. Search & Organization$1" + additionalFeatures + "\n\n## Language Support");
fs.writeFileSync(file, content);
