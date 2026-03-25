const fs = require('fs');
const file = 'functions/src/utils.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export async function getDrivingDistance\(waypoints: \(LatLng \| string\)\[\]\): Promise<number> \{/g,
  `export async function getDrivingDistance(waypoints: (LatLng | string)[]): Promise<{ distance: number; waypointOrder: number[] }> {`
);

content = content.replace(
  /    if \(waypoints\.length < 2\) \{\n      return 0;\n    \}/g,
  `    if (waypoints.length < 2) {
      return { distance: 0, waypointOrder: [] };
    }`
);

content = content.replace(
  /    return totalDistanceMeters \/ 1000;/g,
  `    const waypointOrder = response.data.routes[0].waypoint_order || [];
    return { distance: totalDistanceMeters / 1000, waypointOrder };`
);

fs.writeFileSync(file, content);
