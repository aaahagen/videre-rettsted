const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Fix the JSX error caused by the missing closing bracket and opening curly brace
const errorSearch = `                                                    </div>
{driver.employmentType === 'external' && driver.agencyInfo && (`;

const errorReplace = `                                                    </div>
                                                    )}
                                                    {driver.employmentType === 'external' && driver.agencyInfo && (`;

content = content.replace(errorSearch, errorReplace);

// We also need to add the admin wrap
const startWrapSearch = `                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                                                        {driver.phone && (`;
                                                        
const startWrapReplace = `                                                    {dbUser?.role === 'admin' && (driver.phone || driver.address || driver.emergencyContact || driver.nextOfKin || driver.children || driver.seniorityDate || driver.adminNotes || driver.dateOfBirth || driver.socialSecurityNumber || driver.employeeId || driver.jobTitle || driver.department || driver.supervisor || driver.employmentStatus || driver.probationEndDate || driver.hourlyRate || driver.bankAccountNumber || driver.taxCode || driver.backgroundCheckDate || driver.staffHandbookAcknowledged) && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                                                        {driver.phone && (`;
                                                        
if (!content.includes(startWrapReplace)) {
    content = content.replace(startWrapSearch, startWrapReplace);
}

fs.writeFileSync(pagePath, content);
console.log("Fixed JSX error");
