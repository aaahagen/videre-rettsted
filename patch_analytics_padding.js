const fs = require('fs');
const path = './src/components/admin/analytics-dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// I need to ensure the AnalyticsDashboard component has proper padding since I hid the header.
// The content was probably relying on the header for top spacing. Let's add standard card padding to the CardContent.

// Let's replace the <CardContent className="..."> to ensure it has pt-6 (padding-top) which is standard for shadcn cards when there is no header.
code = code.replace(/<CardContent className="px-4 sm:px-6">/g, '<CardContent className="p-6">');
// also handle if there's no classname yet or it's different
code = code.replace(/<CardContent>/g, '<CardContent className="p-6">');

fs.writeFileSync(path, code);
console.log("Fixed analytics card padding");