const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    /const dataToSubmit: Partial<DriverProfile> = \{[\s\S]*?\};/,
    `const dataToSubmit: Partial<DriverProfile> = {
                certifications,
                skills,
                scheduleOverrides,
                images: imageData,
                documents: uploadedDocuments,
                employmentType,
                timeTrackingMethod,
                baseLocation: baseAddress ? {
                    address: baseAddress,
                    coordinates: { lat: parseFloat(baseLat) || 0, lng: parseFloat(baseLng) || 0 },
                    radius: baseRadius
                } : deleteField() as any,
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
            };`
);

fs.writeFileSync(filePath, content);
console.log('Fixed driver form syntax');
