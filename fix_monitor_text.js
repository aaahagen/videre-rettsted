const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/monitor/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The problematic logic is here:
/*
if (index === 1 && firstUncompletedIndex > 2) return <div key={`ellipsis-${index}`} className="text-xs text-muted-foreground pl-2 py-1">... ${firstUncompletedIndex - 1} fullførte stopp skjult ...</div>;
if (index === firstUncompletedIndex + 2 && index < totalStops - 1) return <div key={`ellipsis-${index}`} className="text-xs text-muted-foreground pl-2 py-1">... ${totalStops - 1 - (firstUncompletedIndex + 1)} gjenstående stopp skjult ...</div>;
*/

// If the route is finished, firstUncompletedIndex is -1.
// We need to handle the case where the route is finished gracefully.

const oldLogic = `                             if (!shouldShow) {
                                if (index === 1 && firstUncompletedIndex > 2) return <div key={\`ellipsis-\${index}\`} className="text-xs text-muted-foreground pl-2 py-1">... \${firstUncompletedIndex - 1} fullførte stopp skjult ...</div>;
                                if (index === firstUncompletedIndex + 2 && index < totalStops - 1) return <div key={\`ellipsis-\${index}\`} className="text-xs text-muted-foreground pl-2 py-1">... \${totalStops - 1 - (firstUncompletedIndex + 1)} gjenstående stopp skjult ...</div>;
                                return null;
                             }`;

const newLogic = `                             if (!shouldShow) {
                                if (isFinished) {
                                    // If route is finished, we only hide stops between the first and last
                                    if (index === 1 && totalStops > 2) return <div key={\`ellipsis-\${index}\`} className="text-xs text-muted-foreground pl-2 py-1">... \${totalStops - 2} fullførte stopp skjult ...</div>;
                                    return null;
                                } else {
                                    // Route is ongoing
                                    if (index === 1 && firstUncompletedIndex > 2) return <div key={\`ellipsis-\${index}\`} className="text-xs text-muted-foreground pl-2 py-1">... \${firstUncompletedIndex - 1} fullførte stopp skjult ...</div>;
                                    if (index === firstUncompletedIndex + 2 && index < totalStops - 1) return <div key={\`ellipsis-\${index}\`} className="text-xs text-muted-foreground pl-2 py-1">... \${totalStops - 1 - (firstUncompletedIndex + 1)} gjenstående stopp skjult ...</div>;
                                    return null;
                                }
                             }`;

content = content.replace(oldLogic, newLogic);

fs.writeFileSync(filePath, content);
console.log('Fixed confusing text for finished routes');
