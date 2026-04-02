const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// The issue is that the absolute positioned "Edit" button (`top-2 right-2`) on the card can overlap 
// with the right-aligned status badge and buttons (`<div className="flex flex-wrap lg:flex-nowrap items-end sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 justify-end">`)
// if there is not enough vertical space, because they are on the same line on `lg` screens.

// Let's add top padding/margin to the right section specifically on `lg` screens so it stays below the edit button
const rightSectionRegex = /<div className="flex flex-wrap lg:flex-nowrap items-end sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 justify-end">/;

const updatedRightSection = `<div className="flex flex-wrap lg:flex-nowrap items-end sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-8 justify-end">`;

if (workforceCode.match(rightSectionRegex)) {
    workforceCode = workforceCode.replace(rightSectionRegex, updatedRightSection);
}

fs.writeFileSync(workforcePath, workforceCode);
