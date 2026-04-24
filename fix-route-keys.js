const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

code = code.replace(/placeItems/g, "routeItems.filter(i => i.type === 'place')");

// We need to fix the lines inside the optimizeRoute function where placeItems was originally defined
const optimizeRouteCode = `    const routeItems\.filter\\(i => i\.type === 'place'\\) = routeItems.filter(i => i.type === 'place');`;
const optimizeRouteCodeFixed = `    const placeItems = routeItems.filter(i => i.type === 'place');`;

code = code.replace(optimizeRouteCode, optimizeRouteCodeFixed);

// Re-apply placeItems where needed inside optimizeRoute
code = code.replace(/routeItems\.filter\(i => i\.type === 'place'\)\.length/g, "placeItems.length");
code = code.replace(/routeItems\.filter\(i => i\.type === 'place'\)\[/g, "placeItems[");
code = code.replace(/routeItems\.filter\(i => i\.type === 'place'\)\.map/g, "placeItems.map");
code = code.replace(/routeItems\.filter\(i => i\.type === 'place'\)\.slice/g, "placeItems.slice");


fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', code);
