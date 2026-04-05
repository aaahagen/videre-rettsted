const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// I am modifying the file in the wrong place or with incorrect syntax.
// We'll replace the block entirely.

const oldBlock = `            const dataToSubmit: Partial<DriverProfile> = {
                certifications,
                skills,
                scheduleOverrides,
                images: imageData,
                documents: uploadedDocuments,
                employmentType,
                role: employmentType === 'external' ? 'contractor' : 'driver',
                phone,
                address,
                emergencyContact,
                nextOfKin,
                children,
                adminNotes,
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
                hourlyRate: hourlyRate ? Number(hourlyRate) : (deleteField() as any),
                bankAccountNumber,
                taxCode,
                staffHandbookAcknowledged,
                backgroundCheckDate,
                contracts,
            };`;

const newBlock = `            const dataToSubmit: Partial<DriverProfile> = {
                certifications,
                skills,
                scheduleOverrides,
                images: imageData,
                documents: uploadedDocuments,
                employmentType,
                role: employmentType === 'external' ? 'contractor' : 'driver',
                phone,
                address,
                emergencyContact,
                nextOfKin,
                children,
                adminNotes,
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
                contracts,
            };
            if (hourlyRate) {
                dataToSubmit.hourlyRate = Number(hourlyRate);
            } else {
                dataToSubmit.hourlyRate = deleteField() as any;
            }`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
} else {
    // Manually reconstruct it to be bulletproof
    const searchRegex = /const dataToSubmit: Partial<DriverProfile> = \{([\s\S]*?)hourlyRate.*?,([\s\S]*?)\};/;
    content = content.replace(searchRegex, (match, p1, p2) => {
        return `const dataToSubmit: Partial<DriverProfile> = {${p1}${p2}};
            if (hourlyRate) {
                dataToSubmit.hourlyRate = Number(hourlyRate);
            } else {
                dataToSubmit.hourlyRate = deleteField() as any;
            }`;
    });
}


fs.writeFileSync(formPath, content);
console.log("Fixed object creation");
