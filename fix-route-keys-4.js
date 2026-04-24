const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

code = code.replace("const placesCount = placeItems.length;", "const placesCount = routeItems.filter(i => i.type === 'place').length;");
code = code.replace("placeItems.some", "routeItems.filter(i => i.type === 'place').some");
code = code.replace("placeItems\n", "routeItems.filter(i => i.type === 'place')\n");

fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', code);
