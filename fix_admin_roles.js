const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/admin/admin-content.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the first instance of the duplicate initial state
content = content.replace("field3Placeholder: '', depotAddress: '', depotLat: '', depotLng: '', depotRadius: 500,", "field3Placeholder: '',");

// 2. Remove the first instance of the duplicate loaded state
content = content.replace("field3Placeholder: org.fieldSettings?.field3?.placeholder || '', depotAddress: org.mainDepot?.address || '', depotLat: org.mainDepot?.coordinates?.lat?.toString() || '', depotLng: org.mainDepot?.coordinates?.lng?.toString() || '', depotRadius: org.mainDepot?.radius || 500,", "field3Placeholder: org.fieldSettings?.field3?.placeholder || '',");


fs.writeFileSync(filePath, content);
console.log('Fixed admin content duplicates');
