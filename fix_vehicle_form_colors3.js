const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix duplicate className on Inputs in custom fields
content = content.replace(/className="bg-white border-slate-300 focus-visible:ring-primary\/20 shadow-sm" \n                                                placeholder="Navn på egenskap/g, 'placeholder="Navn på egenskap');
content = content.replace(/onChange={\(e\) => handleUpdateCustomField\(index, 'name', e.target.value\)}\n                                                className="h-8 text-sm bg-white"/g, 'onChange={(e) => handleUpdateCustomField(index, \'name\', e.target.value)}\n                                                className="h-9 text-sm bg-white border-slate-300 focus-visible:ring-primary/20 shadow-sm"');

content = content.replace(/className="bg-white border-slate-300 focus-visible:ring-primary\/20 shadow-sm" \n                                                placeholder="Verdi /g, 'placeholder="Verdi ');
content = content.replace(/onChange={\(e\) => handleUpdateCustomField\(index, 'value', e.target.value\)}\n                                                className="h-8 text-sm bg-white"/g, 'onChange={(e) => handleUpdateCustomField(index, \'value\', e.target.value)}\n                                                className="h-9 text-sm bg-white border-slate-300 focus-visible:ring-primary/20 shadow-sm"');


fs.writeFileSync(file, content);
