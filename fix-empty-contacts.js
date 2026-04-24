const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

const oldCode = `{contactPersonsEnabled && place.contactPersons && place.contactPersons.length > 0 && (`;
const newCode = `{contactPersonsEnabled && place.contactPersons && place.contactPersons.filter(c => c.name || c.phone || c.email).length > 0 && (`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
