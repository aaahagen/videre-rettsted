const fs = require('fs');

let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

const oldCode1 = `{doorCodeEnabled && place.doorCode && place.doorCode.length > 0 && (`;
const newCode1 = `{doorCodeEnabled && place.doorCode && place.doorCode.filter(dc => dc.category || dc.name || dc.value).length > 0 && (`;

code = code.replace(oldCode1, newCode1);

const oldCode2 = `{place.doorCode.map((dc, idx) => (`
const newCode2 = `{place.doorCode.filter(dc => dc.category || dc.name || dc.value).map((dc, idx) => (`

code = code.replace(oldCode2, newCode2);

const oldCode3 = `{contactPersonsEnabled && place.contactPersons && place.contactPersons.length > 0 && (`
const newCode3 = `{contactPersonsEnabled && place.contactPersons && place.contactPersons.filter(c => c.name || c.phone || c.email).length > 0 && (`

code = code.replace(oldCode3, newCode3);

const oldCode4 = `{place.contactPersons.map((contact, index) => (`
const newCode4 = `{place.contactPersons.filter(c => c.name || c.phone || c.email).map((contact, index) => (`

code = code.replace(oldCode4, newCode4);

fs.writeFileSync('src/components/places/print-place.tsx', code);
