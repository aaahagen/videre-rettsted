const fs = require('fs');
const file = 'docs/CHANGELOG.md';
let content = fs.readFileSync(file, 'utf8');

const newEntry = `### Fixed
- **Distance Calculation Crash:** Resolved an issue where the distance calculation would crash the backend function (TypeError: Cannot read properties of undefined (reading 'legs')) if Google Maps returned ZERO_RESULTS (e.g., if coordinates were invalid or too far apart). It now gracefully throws a clear error message.
- **Distance Calculation Loop:** Fixed an infinite re-render loop in the route details page caused by incorrect dependency arrays in the \`useMemo\` and \`useEffect\` hooks used for the debounced distance calculation.
- **Backend API Key Conflict:** Resolved an issue where the backend Cloud Function was using an API key with HTTP referrer restrictions (which Google Maps Directions API rejects for server-side calls). The function now securely loads a dedicated, unrestricted backend API key directly from Google Cloud Secret Manager.
- **Smart Waypoint Fallback:** Improved the robustness of the \`calculateRouteDistance\` function. If a place on a route was saved without precise GPS coordinates (defaulting to 0,0), the backend will now automatically fall back to passing the place's text address to the Google Maps API for automatic geocoding, preventing "ZERO_RESULTS" errors for text-only places.

`;

content = content.replace('### Fixed\n', newEntry);

fs.writeFileSync(file, content);
