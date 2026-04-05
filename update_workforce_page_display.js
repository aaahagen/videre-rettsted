const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Ensure the new fields are properly integrated into the expanded view section
// I accidentally overwritten the "dbUser?.role === 'admin' && (" check in my earlier attempt, let's fix it.

const startSearch = `                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                                                        {driver.phone && (`;

const blockReplacement = `                                                    {dbUser?.role === 'admin' && (driver.phone || driver.address || driver.emergencyContact || driver.nextOfKin || driver.children || driver.seniorityDate || driver.adminNotes || driver.dateOfBirth || driver.socialSecurityNumber || driver.employeeId || driver.jobTitle || driver.department || driver.supervisor || driver.employmentStatus || driver.probationEndDate || driver.hourlyRate || driver.bankAccountNumber || driver.taxCode || driver.backgroundCheckDate || driver.staffHandbookAcknowledged) && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                                                        {driver.phone && (`;

if (content.includes(startSearch)) {
    content = content.replace(startSearch, blockReplacement);
}

fs.writeFileSync(pagePath, content);
console.log("Updated workforce page display to show fields to admin");
