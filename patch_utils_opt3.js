const fs = require('fs');
const file = 'functions/src/utils.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /  if \(waypoints\.length < 2\) \{\n    return 0;\n  \}/g,
  `  if (waypoints.length < 2) {
    return { distance: 0, waypointOrder: [] };
  }`
);

fs.writeFileSync(file, content);
