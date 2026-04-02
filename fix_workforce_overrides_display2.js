const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// I also need to make sure we show the whole section if `allUpcomingOverrides.length > 0`, 
// previously it checked `visibleOverrides.length > 0`. Since visibleOverrides was up to 3, this condition 
// was essentially the same, but let's clean it up for consistency.

const targetCondition = `{visibleOverrides.length > 0 && (`;
const replacementCondition = `{allUpcomingOverrides.length > 0 && (`;

if (workforceCode.includes(targetCondition)) {
    workforceCode = workforceCode.replace(targetCondition, replacementCondition);
}

// Remove the obsolete variables
const targetVariables = `                            const visibleOverrides = allUpcomingOverrides.slice(0, 3);
                            const hasMoreOverrides = allUpcomingOverrides.length > 3;`;
const replacementVariables = ``;

if (workforceCode.includes(targetVariables)) {
    workforceCode = workforceCode.replace(targetVariables, replacementVariables);
}

fs.writeFileSync(workforcePath, workforceCode);
