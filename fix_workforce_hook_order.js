const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// The issue is that `useMemo` is placed AFTER a conditional return `if (isLoading && drivers.length === 0) return ...`
// In React, all hooks MUST be called unconditionally before any early returns.

// 1. Move `useMemo` block up before the early return.
const useMemoRegex = /const stats = useMemo\(\(\) => \{[\s\S]*?\}, \[drivers, searchDate\]\);/;
const match = workforceCode.match(useMemoRegex);

if (match) {
    const useMemoBlock = match[0];
    workforceCode = workforceCode.replace(useMemoBlock, ''); // Remove from current position
    
    // We also need `searchDate` to be defined before `useMemo`.
    const parseSearchDateBlock = `    // Parse the search date securely
    let searchDate = new Date();
    if (searchDateStr) {
        const [year, month, day] = searchDateStr.split('-');
        if (year && month && day) {
            searchDate = new Date(Number(year), Number(month) - 1, Number(day));
        }
    }`;
    
    workforceCode = workforceCode.replace(parseSearchDateBlock, ''); // Remove from current position

    // Insert both right after `filteredDrivers`
    const insertPoint = `    const filteredDrivers = drivers.filter(d => \n        (d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||\n        (d.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '')\n    );`;

    const newCode = `${insertPoint}\n\n${parseSearchDateBlock}\n\n${useMemoBlock}`;
    workforceCode = workforceCode.replace(insertPoint, newCode);
}

fs.writeFileSync(workforcePath, workforceCode);
