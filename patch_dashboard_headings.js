const fs = require('fs');
const path = './src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// The goal is to:
// 1. Rename "Dagens Status" to "Ruter & Stopp"
// 2. Remove the "Oversikt" heading from the AnalyticsDashboard component or wrap it differently.
// Let's modify the UI section.

// Change "Dagens Status" to "Ruter & Stopp"
code = code.replace(
  /<h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">\s*<RouteIcon className="h-6 w-6 text-primary" \/>\s*Dagens Status\s*<\/h2>/,
  `<h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <RouteIcon className="h-6 w-6 text-primary" />
                    Ruter & Stopp
                </h2>`
);

// Grouping and Layout Refinement
// I'll wrap the Analytics Dashboard in a way that blends it with the UI, or since the user mentions "oversikt is really not nessesary to have as a heading for places and users", I should edit the AnalyticsDashboard component itself to remove its title "Oversikt". Let's do that in a separate script.
fs.writeFileSync(path, code);
console.log("Updated heading");