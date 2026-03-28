const fs = require('fs');

const routesOverviewFile = 'src/app/dashboard/routes/page.tsx';
let code = fs.readFileSync(routesOverviewFile, 'utf8');

const originalIconClass = `className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"`;
const newIconClass = `className="p-2.5 bg-slate-100 text-slate-800 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-colors"`;
code = code.replace(originalIconClass, newIconClass);

const originalTitleClass = `className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors"`;
const newTitleClass = `className="text-xl font-bold text-slate-800 line-clamp-1 transition-colors"`;
code = code.replace(originalTitleClass, newTitleClass);

fs.writeFileSync(routesOverviewFile, code);
