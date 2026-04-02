const fs = require('fs');
const path = require('path');

let fleetPath = path.join(__dirname, 'src/app/dashboard/fleet/page.tsx');
let fleetCode = fs.readFileSync(fleetPath, 'utf8');

fleetCode = fleetCode.replace(
    "{vehicles.length === 0 ? (",
    "{filteredVehicles.length === 0 && searchQuery ? (\n                        <div className=\"col-span-full flex flex-col items-center justify-center py-20 text-center\">\n                            <div className=\"rounded-full bg-slate-100 p-6 mb-4\">\n                                <SearchX className=\"h-12 w-12 text-slate-300\" />\n                            </div>\n                            <h2 className=\"text-xl font-semibold text-slate-900\">\n                                Ingen kjøretøy matchet \"{searchQuery}\"\n                            </h2>\n                        </div>\n                    ) : vehicles.length === 0 ? ("
);

fleetCode = fleetCode.replace(
    "{vehicles.map(v => (",
    "{filteredVehicles.map(v => ("
);

fs.writeFileSync(fleetPath, fleetCode);
