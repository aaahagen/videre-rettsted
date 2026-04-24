const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

const oldCode = `                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Stedsinfo
                    </h2>`;

const newCode = `                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Logg
                    </h2>`;

code = code.replace(oldCode, newCode);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
