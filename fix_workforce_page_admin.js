const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Fix the doubled up admin wrapper check
const search = `{dbUser?.role === 'admin' && (driver.phone || driver.address || driver.emergencyContact || driver.nextOfKin || driver.children || driver.seniorityDate || driver.adminNotes || driver.dateOfBirth || driver.socialSecurityNumber || driver.employeeId || driver.jobTitle || driver.department || driver.supervisor || driver.employmentStatus || driver.probationEndDate || driver.hourlyRate || driver.bankAccountNumber || driver.taxCode || driver.backgroundCheckDate || driver.staffHandbookAcknowledged) && (
                                                        {dbUser?.role === 'admin' && (driver.phone || driver.address || driver.emergencyContact || driver.nextOfKin || driver.children || driver.seniorityDate || driver.adminNotes || driver.dateOfBirth || driver.socialSecurityNumber || driver.employeeId || driver.jobTitle || driver.department || driver.supervisor || driver.employmentStatus || driver.probationEndDate || driver.hourlyRate || driver.bankAccountNumber || driver.taxCode || driver.backgroundCheckDate || driver.staffHandbookAcknowledged) && (`;

const replace = `{dbUser?.role === 'admin' && (driver.phone || driver.address || driver.emergencyContact || driver.nextOfKin || driver.children || driver.seniorityDate || driver.adminNotes || driver.dateOfBirth || driver.socialSecurityNumber || driver.employeeId || driver.jobTitle || driver.department || driver.supervisor || driver.employmentStatus || driver.probationEndDate || driver.hourlyRate || driver.bankAccountNumber || driver.taxCode || driver.backgroundCheckDate || driver.staffHandbookAcknowledged) && (`;

content = content.replace(search, replace);
fs.writeFileSync(pagePath, content);
console.log("Fixed admin wrapper duplication");
