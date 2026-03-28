const fs = require('fs');

const routesOverviewFile = 'src/app/dashboard/routes/page.tsx';
let code = fs.readFileSync(routesOverviewFile, 'utf8');

// Ensure that we log what duration is and handle it correctly.
const originalDurationDisplay = `<span className="text-sm font-semibold text-slate-700 leading-none">
                        {route.duration || '--'}
                      </span>`;

const newDurationDisplay = `<span className="text-sm font-semibold text-slate-700 leading-none">
                        {route.duration ? route.duration : '--'}
                      </span>`;

code = code.replace(originalDurationDisplay, newDurationDisplay);

fs.writeFileSync(routesOverviewFile, code);
