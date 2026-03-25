const fs = require('fs');
const file = 'functions/src/utils.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export async function getDrivingDistance\(waypoints: LatLng\[\]\): Promise<number> \{/g,
  `export async function getDrivingDistance(waypoints: (LatLng | string)[]): Promise<number> {`
);

fs.writeFileSync(file, content);
