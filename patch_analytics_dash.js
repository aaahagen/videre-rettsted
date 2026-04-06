const fs = require('fs');
const path = './src/components/admin/analytics-dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace the heading "Oversikt" or similar if it exists.
// Let's look at the actual file first.
// I will just remove the CardTitle "Oversikt" or whatever it is called.

code = code.replace(/<CardTitle className="font-headline text-xl sm:text-2xl">\s*Oversikt\s*<\/CardTitle>/, '');
code = code.replace(/<CardDescription>Generelle tall og statistikk for din organisasjon\.<\/CardDescription>/, '');
code = code.replace(/<CardHeader className="px-4 sm:px-6">/, '<CardHeader className="px-4 sm:px-6 hidden">'); // Hide the header if there is nothing else in it.


fs.writeFileSync(path, code);
console.log("Updated analytics dashboard component");