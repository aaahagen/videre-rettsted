const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the duplicate className issue on Labels
content = content.replace(/className="text-slate-700 font-semibold mb-1 block" htmlFor="tailLift" className="flex-1 cursor-pointer"/g, 'className="flex-1 cursor-pointer font-semibold text-slate-700" htmlFor="tailLift"');
content = content.replace(/className="text-slate-700 font-semibold mb-1 block" htmlFor="refrigeration" className="flex-1 cursor-pointer"/g, 'className="flex-1 cursor-pointer font-semibold text-slate-700" htmlFor="refrigeration"');
content = content.replace(/className="text-slate-700 font-semibold mb-1 block" htmlFor="trailer" className="flex-1 cursor-pointer"/g, 'className="flex-1 cursor-pointer font-semibold text-slate-700" htmlFor="trailer"');
content = content.replace(/className="text-slate-700 font-semibold mb-1 block" htmlFor="adr" className="flex-1 cursor-pointer"/g, 'className="flex-1 cursor-pointer font-semibold text-slate-700" htmlFor="adr"');

fs.writeFileSync(file, content);
