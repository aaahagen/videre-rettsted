const fs = require('fs');

// Patch utils.ts again to fix the TS error
let utilsContent = fs.readFileSync('functions/src/utils.ts', 'utf8');
utilsContent = utilsContent.replace(
  /  if \(waypoints\.length < 2\) \{\n    return \{ distance: 0, waypointOrder: \[\] \};\n  \}/g,
  `  if (waypoints.length < 2) {
    return { distance: 0, duration: 0, waypointOrder: [] };
  }`
);
fs.writeFileSync('functions/src/utils.ts', utilsContent);
