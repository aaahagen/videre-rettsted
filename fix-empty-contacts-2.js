const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

const oldCode2 = `{place.contactPersons.map((contact, index) => (
                            <div key={index} className="p-4 border rounded-md bg-slate-50 flex flex-col gap-2">`;
const newCode2 = `{place.contactPersons.filter(c => c.name || c.phone || c.email).map((contact, index) => (
                            <div key={index} className="p-4 border rounded-md bg-slate-50 flex flex-col gap-2">`;

code = code.replace(oldCode2, newCode2);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
