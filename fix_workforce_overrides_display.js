const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// Currently, it truncates the overrides list to 3:
// const visibleOverrides = allUpcomingOverrides.slice(0, 3);
// const hasMoreOverrides = allUpcomingOverrides.length > 3;
//
// We want to show *all* of them when expanded. So we can just use `allUpcomingOverrides` directly
// when rendering inside the `{isExpanded && (...)}` block.

const targetListLogic = `                                                            {visibleOverrides.map(([dateStr, details]) => {`;
const replacementListLogic = `                                                            {allUpcomingOverrides.map(([dateStr, details]) => {`;

if (workforceCode.includes(targetListLogic)) {
    workforceCode = workforceCode.replace(targetListLogic, replacementListLogic);
}

const targetHasMoreLogic = `                                                            {hasMoreOverrides && (
                                                                <span className="text-[10px] text-muted-foreground italic text-center mt-1">...og {allUpcomingOverrides.length - 3} til</span>
                                                            )}`;
const replacementHasMoreLogic = ``;

if (workforceCode.includes(targetHasMoreLogic)) {
    workforceCode = workforceCode.replace(targetHasMoreLogic, replacementHasMoreLogic);
}

// Since the list could get long, let's wrap it in a scroll area if there are many overrides.
// The list is currently inside `<div className="flex flex-col gap-1 mt-1">`
const targetContainer = `<div className="flex flex-col gap-1 mt-1">`;
const replacementContainer = `<div className="flex flex-col gap-1 mt-1 max-h-[120px] overflow-y-auto pr-1 no-scrollbar">`;

if (workforceCode.includes(targetContainer)) {
    workforceCode = workforceCode.replace(targetContainer, replacementContainer);
}

fs.writeFileSync(workforcePath, workforceCode);
