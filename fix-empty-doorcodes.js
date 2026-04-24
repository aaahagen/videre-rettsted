const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

const oldCode = `{doorCodeEnabled && place.doorCode && place.doorCode.length > 0 && (`;
const newCode = `{doorCodeEnabled && place.doorCode && place.doorCode.filter(dc => dc.category || dc.name || dc.value).length > 0 && (`;

code = code.replace(oldCode, newCode);

const oldCode2 = `{place.doorCode.map((dc, idx) => (`
const newCode2 = `{place.doorCode.filter(dc => dc.category || dc.name || dc.value).map((dc, idx) => (`

code = code.replace(oldCode2, newCode2);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
