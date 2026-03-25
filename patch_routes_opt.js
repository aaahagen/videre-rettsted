const fs = require('fs');
const file = 'functions/src/routes.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /    const distance = await getDrivingDistance\(waypoints\);\n\n    return \{ distance \};/g,
  `    const result = await getDrivingDistance(waypoints);

    return { distance: result.distance, waypointOrder: result.waypointOrder };`
);

fs.writeFileSync(file, content);
