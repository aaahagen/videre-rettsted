const fs = require('fs');
const file = 'src/app/dashboard/monitor/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetRender = `                                              {route.completedStopEvents[\`place_\${placeId}\`].coordinates && (
                                                  <a 
                                                    href={\`https://www.google.com/maps/search/?api=1&query=\${route.completedStopEvents[\`place_\${placeId}\`].coordinates.lat},\${route.completedStopEvents[\`place_\${placeId}\`].coordinates.lng}\`} `;

const newRender = `                                              {route.completedStopEvents[\`place_\${placeId}\`].coordinates && (
                                                  <a 
                                                    href={\`https://www.google.com/maps/search/?api=1&query=\${route.completedStopEvents[\`place_\${placeId}\`].coordinates?.lat},\${route.completedStopEvents[\`place_\${placeId}\`].coordinates?.lng}\`} `;

content = content.replace(targetRender, newRender);
fs.writeFileSync(file, content);
