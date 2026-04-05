const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Update the search logic
const searchLogicOld = `const filteredDrivers = drivers.filter(d => 
        (d.name?.toLowerCase().includes(safeQuery) || false) ||
        (d.email?.toLowerCase().includes(safeQuery) || false)
    );`;

const searchLogicNew = `const filteredDrivers = drivers.filter(d => {
        const matchesName = d.name?.toLowerCase().includes(safeQuery) || false;
        const matchesEmail = d.email?.toLowerCase().includes(safeQuery) || false;
        const matchesPhone = d.phone?.toLowerCase().includes(safeQuery) || false;
        const matchesCert = d.certifications?.some(c => c.toLowerCase().includes(safeQuery)) || false;
        const matchesSkill = d.skills?.some(s => s.toLowerCase().includes(safeQuery)) || false;

        return matchesName || matchesEmail || matchesPhone || matchesCert || matchesSkill;
    });`;

content = content.replace(searchLogicOld, searchLogicNew);

fs.writeFileSync(pagePath, content);
console.log("Updated workforce search logic");
