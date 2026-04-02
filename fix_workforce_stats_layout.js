const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// Change the grid classes
workforceCode = workforceCode.replace(
    '<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">',
    '<div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-4">'
);

// Remove the col-span classes from the contractor card
workforceCode = workforceCode.replace(
    '<Card className="bg-amber-50 border-amber-100 shadow-sm col-span-2 md:col-span-1 lg:col-span-1">',
    '<Card className="bg-amber-50 border-amber-100 shadow-sm">'
);

// We should also adjust padding slightly on mobile so it fits nicely
workforceCode = workforceCode.replace(
    /className="p-4 flex flex-col items-center justify-center text-center"/g,
    'className="p-2 sm:p-4 flex flex-col items-center justify-center text-center"'
);

// Shrink icons slightly on very small screens
workforceCode = workforceCode.replace(
    /className="h-6 w-6 (.*?) mb-2"/g,
    'className="h-5 w-5 sm:h-6 sm:w-6 $1 mb-1 sm:mb-2"'
);

// Adjust text sizes slightly on mobile to prevent overflow
workforceCode = workforceCode.replace(
    /className="text-2xl font-bold (.*?)"/g,
    'className="text-lg sm:text-2xl font-bold $1"'
);

workforceCode = workforceCode.replace(
    /className="text-xs font-medium (.*?) uppercase tracking-wider"/g,
    'className="text-[9px] sm:text-xs font-medium $1 uppercase tracking-tighter sm:tracking-wider"'
);

fs.writeFileSync(workforcePath, workforceCode);
