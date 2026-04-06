const fs = require('fs');
const path = './src/app/dashboard/admin/admin-content.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/depotAddress: org\.mainDepot\?\.address \|\| '', depotLat: org\.mainDepot\?\.coordinates\?\.lat\?\.toString\(\) \|\| '', depotLng: org\.mainDepot\?\.coordinates\?\.lng\?\.toString\(\) \|\| '', depotRadius: org\.mainDepot\?\.radius \|\| 500,/g, '');

fs.writeFileSync(path, code);
console.log("Fixed duplicate properties 2");
