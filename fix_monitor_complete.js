const fs = require('fs');
const file = 'src/app/dashboard/monitor/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// I made a HUGE mistake in the previous fix_dollar.js
// I accidentally replaced ${ with { globally which broke all template literals in JSX
// AND I did it incorrectly for the actual JSX values.

// Let's fix the entire file's template literals first
content = content.replace(/\{searchQuery\}/g, '${searchQuery}');
content = content.replace(/\{route\.thirdPartySupplier\}/g, '${route.thirdPartySupplier}');
content = content.replace(/\{isFinished \? 'border-green-200 bg-green-50\/30' : 'border-slate-200 hover:shadow-md'\}/g, '${isFinished ? "border-green-200 bg-green-50/30" : "border-slate-200 hover:shadow-md"}');
content = content.replace(/\{isFinished \? 'bg-green-200' : 'bg-red-200'\}/g, '${isFinished ? "bg-green-200" : "bg-red-200"}');
content = content.replace(/\{isFinished \? 'bg-green-500' : 'bg-red-500'\}/g, '${isFinished ? "bg-green-500" : "bg-red-500"}');
content = content.replace(/-\{100 - \(progress \|\| 0\)\}%/g, '-${100 - (progress || 0)}%');
content = content.replace(/\{id\}/g, '${id}');
content = content.replace(/\{isCurrent \? 'bg-primary\/5 border border-primary\/20 shadow-sm -ml-5 pl-5 z-10' : ''\}/g, '${isCurrent ? "bg-primary/5 border border-primary/20 shadow-sm -ml-5 pl-5 z-10" : ""}');
content = content.replace(/\{isCompleted \? 'opacity-60' : 'hover:bg-slate-50'\}/g, '${isCompleted ? "opacity-60" : "hover:bg-slate-50"}');
content = content.replace(/\{isCompleted \? 'bg-green-500' : isCurrent \? 'bg-primary animate-pulse' : 'bg-slate-300'\}/g, '${isCompleted ? "bg-green-500" : isCurrent ? "bg-primary animate-pulse" : "bg-slate-300"}');
content = content.replace(/\/dashboard\/places\/\{placeId\}/g, '/dashboard/places/${placeId}');
content = content.replace(/\{isCompleted \? 'line-through text-slate-500' : isCurrent \? 'text-primary' : 'text-slate-700'\}/g, '${isCompleted ? "line-through text-slate-500" : isCurrent ? "text-primary" : "text-slate-700"}');

// Now fix the specific issue the user reported: logic for "finished" route
// The current logic checks if (completedCount >= expectedItems)
// where completedCount is route.completedStops?.length
// and expectedItems is physical places + prep/break/service items.

// Let's verify how completedStops is stored. In routes/[id]/page.tsx:
// const currentCompletedStops = Object.entries({ ...completedStops, [itemId]: isNowCompleted }).filter(([_, isCompleted]) => isCompleted).map(([id]) => id);
// where id is like "place_XYZ" or "special_start".

// In monitor/page.tsx:
// const completedCount = route.completedStops?.length || 0;
// This seems correct IF drivers are marking everything.

fs.writeFileSync(file, content);
