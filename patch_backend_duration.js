const fs = require('fs');

// Patch utils.ts
let utilsContent = fs.readFileSync('functions/src/utils.ts', 'utf8');
utilsContent = utilsContent.replace(
  /export async function getDrivingDistance\(waypoints: \(LatLng \| string\)\[\]\): Promise<\{ distance: number; waypointOrder: number\[\] \}> \{/g,
  `export async function getDrivingDistance(waypoints: (LatLng | string)[]): Promise<{ distance: number; duration: number; waypointOrder: number[] }> {`
);
utilsContent = utilsContent.replace(
  /    if \(waypoints\.length < 2\) \{\n      return \{ distance: 0, waypointOrder: \[\] \};\n    \}/g,
  `    if (waypoints.length < 2) {
      return { distance: 0, duration: 0, waypointOrder: [] };
    }`
);
utilsContent = utilsContent.replace(
  /    const totalDistanceMeters = response\.data\.routes\[0\]\.legs\.reduce\(\n      \(total, leg\) => total \+ \(leg\.distance\?\.value \|\| 0\),\n      0\n    \);/g,
  `    const totalDistanceMeters = response.data.routes[0].legs.reduce(
      (total, leg) => total + (leg.distance?.value || 0),
      0
    );
    const totalDurationSeconds = response.data.routes[0].legs.reduce(
      (total, leg) => total + (leg.duration?.value || 0),
      0
    );`
);
utilsContent = utilsContent.replace(
  /    return \{ distance: totalDistanceMeters \/ 1000, waypointOrder \};/g,
  `    return { distance: totalDistanceMeters / 1000, duration: totalDurationSeconds, waypointOrder };`
);
fs.writeFileSync('functions/src/utils.ts', utilsContent);

// Patch routes.ts
let routesContent = fs.readFileSync('functions/src/routes.ts', 'utf8');
routesContent = routesContent.replace(
  /    return \{ distance: result\.distance, waypointOrder: result\.waypointOrder \};/g,
  `    return { distance: result.distance, duration: result.duration, waypointOrder: result.waypointOrder };`
);
fs.writeFileSync('functions/src/routes.ts', routesContent);
