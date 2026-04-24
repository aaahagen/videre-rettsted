const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

code = code.replace("const routeItems.filter(i => i.type === 'place') = routeItems.filter(i => i.type === 'place');", "const placeItems = routeItems.filter(i => i.type === 'place');");

fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', code);
