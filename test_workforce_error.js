const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

const badFilter = `    const filteredDrivers = drivers.filter(d => 
        (d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (d.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );`;

const safeSearchQuery = `    const safeQuery = (searchQuery || '').toLowerCase();
    const filteredDrivers = drivers.filter(d => 
        (d.name?.toLowerCase().includes(safeQuery) || false) ||
        (d.email?.toLowerCase().includes(safeQuery) || false)
    );`;

if (workforceCode.includes(badFilter)) {
    workforceCode = workforceCode.replace(badFilter, safeSearchQuery);
}

fs.writeFileSync(workforcePath, workforceCode);
