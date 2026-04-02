const fs = require('fs');
const path = require('path');

let routesPath = path.join(__dirname, 'src/app/dashboard/routes/page.tsx');
let routesCode = fs.readFileSync(routesPath, 'utf8');

// Find the big "+ Ny Rute" button and remove it
const buttonRegex = /<Button\s+asChild\s+size="lg"\s+className="shadow-sm"\s*>\s*<Link\s+href="\/dashboard\/routes\/new"\s*>\s*<Plus\s+className="mr-2\s+h-5\s+w-5"\s*\/>\s*Ny Rute\s*<\/Link>\s*<\/Button>/;

routesCode = routesCode.replace(buttonRegex, "");

// Ensure the plus icon is still imported if needed elsewhere, but if we remove the only use we don't necessarily have to remove it from imports, though it's cleaner.
// For now, just removing the button is enough.

fs.writeFileSync(routesPath, routesCode);
