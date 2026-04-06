const fs = require('fs');
const path = './src/app/dashboard/admin/admin-content.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/depotAddress: '', depotLat: '', depotLng: '', depotRadius: 500,/g, '');

fs.writeFileSync(path, code);
console.log("Fixed duplicate properties");
