const fs = require('fs');
const path = require('path');

// 1. Fix Workforce Page Date Input Overflow
let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// The problem is that standard <input type="date"> on iOS can have a minimum width or overflow its container if not constrained properly.
// Adding max-w-full helps.

workforceCode = workforceCode.replace(
    'className="w-full sm:w-[240px]"',
    'className="w-full max-w-full sm:w-[240px]"'
);

// We should also check if the container forces an overflow.
// <div className="space-y-2 w-full sm:w-auto"> is wrapping it.
// We can add overflow-hidden to the container or adjust w-full.

workforceCode = workforceCode.replace(
    '<div className="space-y-2 w-full sm:w-auto">',
    '<div className="space-y-2 w-full sm:w-auto max-w-full">'
);

fs.writeFileSync(workforcePath, workforceCode);

// 2. Fix Driver Profile Form Date Input Overflow
let formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let formCode = fs.readFileSync(formPath, 'utf8');

// Rotation Start Date
formCode = formCode.replace(
    '<div className="space-y-2 w-full sm:max-w-[200px]">',
    '<div className="space-y-2 w-full max-w-full sm:max-w-[200px]">'
);

// Override Dates
// They are wrapped in <div className="space-y-2 col-span-2 md:w-[150px]">
formCode = formCode.replace(
    /<div className="space-y-2 col-span-2 md:w-\[150px\]">/g,
    '<div className="space-y-2 col-span-2 md:w-[150px] max-w-full">'
);

// Add max-w-full to all date inputs in the form just to be safe
formCode = formCode.replace(
    /className="w-full"/g,
    'className="w-full max-w-full"'
);

fs.writeFileSync(formPath, formCode);
