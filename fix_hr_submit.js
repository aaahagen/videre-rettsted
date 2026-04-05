const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// I need to add back the properties properly without syntax errors to dataToSubmit
const search = `                adminNotes,
                seniorityDate,
            };`;

const replacement = `                adminNotes,
                seniorityDate,
                dateOfBirth,
                socialSecurityNumber,
                gender,
                employeeId,
                jobTitle,
                department,
                supervisor,
                employmentStatus,
                probationEndDate,
                bankAccountNumber,
                taxCode,
                staffHandbookAcknowledged,
                backgroundCheckDate,
            };

            if (hourlyRate) {
                dataToSubmit.hourlyRate = Number(hourlyRate);
            } else {
                dataToSubmit.hourlyRate = deleteField() as any;
            }`;

content = content.replace(search, replacement);
fs.writeFileSync(formPath, content);
console.log("Fixed HR submit");
