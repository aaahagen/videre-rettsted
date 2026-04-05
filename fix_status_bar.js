const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Update getDriverStatus to support standard week
const oldGetDriverStatus = `// 3. Fallback to standard working hours (if defined)
    if (driver.workingHours?.start && driver.workingHours?.end) {
        // Assume weekends are off if standard hours are used
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
            return { status: 'Helg (Standard)', short: 'Helg', type: 'off', color: 'bg-slate-100 text-slate-500 border-slate-200' };
        }
        return { status: \`Jobber \${driver.workingHours.start} - \${driver.workingHours.end} (Standard)\`, short: \`\${driver.workingHours.start}-\${driver.workingHours.end}\`, type: 'working', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }`;

const newGetDriverStatus = `// 3. Fallback to standard working hours (if defined)
    if (driver.workingHours?.start && driver.workingHours?.end) {
        // Assume weekends are off if standard hours are used
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
            return { status: 'Helg (Standard)', short: 'Helg', type: 'off', color: 'bg-slate-100 text-slate-500 border-slate-200' };
        }
        return { status: \`Jobber \${driver.workingHours.start} - \${driver.workingHours.end} (Standard)\`, short: \`\${driver.workingHours.start}-\${driver.workingHours.end}\`, type: 'working', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }

    // 4. Check if they have an active contract (new logic)
    if (driver.contracts && driver.contracts.length > 0) {
        const sortedContracts = [...driver.contracts].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        const activeContract = sortedContracts.find(c => {
            const start = new Date(c.startDate);
            const end = c.endDate ? new Date(c.endDate) : new Date(2100, 0, 1);
            return date >= start && date <= end;
        });

        if (activeContract) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { 
                return { status: 'Helg', short: 'Helg', type: 'off', color: 'bg-slate-100 text-slate-500 border-slate-200' };
            }
            return { status: \`\${activeContract.contractedHours} timer/uke (\${activeContract.role})\`, short: \`\${activeContract.contractedHours}t\`, type: 'working', color: 'bg-blue-50 text-blue-700 border-blue-200' };
        }
    }`;

content = content.replace(oldGetDriverStatus, newGetDriverStatus);

fs.writeFileSync(pagePath, content);
console.log("Updated workforce page status to include contracts");
