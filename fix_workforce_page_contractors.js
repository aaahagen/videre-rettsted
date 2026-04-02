const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// Filter drivers AND contractors
workforceCode = workforceCode.replace(
    "setDrivers(users.filter(u => u.role === 'driver') as DriverProfile[]);",
    "setDrivers(users.filter(u => u.role === 'driver' || u.role === 'contractor') as DriverProfile[]);"
);

// Display Agency info if it's a contractor
const displayAgencyInfo = `
                                                            {driver.employmentType === 'external' && driver.agencyInfo && (
                                                                <div className="flex gap-1 items-center bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 mt-1 sm:mt-0">
                                                                    <span className="font-medium">Innleid fra:</span>
                                                                    <span>{driver.agencyInfo.name}</span>
                                                                    {driver.agencyInfo.phone && <span className="text-amber-700 ml-1">({driver.agencyInfo.phone})</span>}
                                                                </div>
                                                            )}
                                                            `;

// Insert the display logic next to the certifications and skills
workforceCode = workforceCode.replace(
    "{driver.certifications?.length ?",
    displayAgencyInfo + "\n                                                            {driver.certifications?.length ?"
);

// Add a Badge to clearly identify them
workforceCode = workforceCode.replace(
    "<p className=\"font-semibold text-lg\">{driver.name || driver.email}</p>",
    "<div className=\"flex items-center gap-2\">\n                                                        <p className=\"font-semibold text-lg\">{driver.name || driver.email}</p>\n                                                        {driver.employmentType === 'external' && (\n                                                            <Badge variant=\"outline\" className=\"bg-amber-100 text-amber-800 border-amber-200 text-xs px-1.5 py-0\">\n                                                                Innleid\n                                                            </Badge>\n                                                        )}\n                                                    </div>"
);

fs.writeFileSync(workforcePath, workforceCode);
