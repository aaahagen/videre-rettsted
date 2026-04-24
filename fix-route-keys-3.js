const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

code = code.replace("const placeIds = placeItems.map(i => i.orderId ? i.orderId : i.placeId!);", "const placeIds = routeItems.filter(i => i.type === 'place').map(i => i.orderId ? i.orderId : i.placeId!);");

fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', code);
