const fs = require('fs');
const file = 'src/app/dashboard/monitor/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// I accidentally replaced all ${ with {
// I should only replace the ones inside the JSX text nodes, not in the template strings.

content = content.replace(/ellipsis-{index}/g, 'ellipsis-${index}');
content = content.replace(/`place_{placeId}`/g, '`place_${placeId}`');
content = content.replace(/query={route.completedStopEvents\[`place_\${placeId}`\].coordinates\?.lat},{route.completedStopEvents\[`place_\${placeId}`\].coordinates\?.lng}/g, 'query=${route.completedStopEvents[`place_${placeId}`].coordinates?.lat},${route.completedStopEvents[`place_${placeId}`].coordinates?.lng}');

fs.writeFileSync(file, content);
