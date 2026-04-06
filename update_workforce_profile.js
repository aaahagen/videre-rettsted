const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove double declaration of geofence state
const startIdx = content.indexOf('// Geofencing state');
if (startIdx !== -1) {
   const endIdx = content.indexOf('// HR fields', startIdx);
   if (endIdx !== -1) {
       content = content.slice(0, startIdx) + content.slice(endIdx);
   }
}

// Fix submission payload
const submitRegex = /const dataToSubmit: Partial<DriverProfile> = \{[\s\S]*?workingHours: useRotation \? deleteField\(\) as any : \{ start: workingHoursStart, end: workingHoursEnd \}\n\s*\};/;
const newPayload = `const dataToSubmit: Partial<DriverProfile> = {
                certifications, skills, scheduleOverrides, images: imageData, documents: uploadedDocuments,
                employmentType, timeTrackingMethod,
                role: employmentType === 'external' ? 'contractor' : 'driver',
                phone, address, emergencyContact, nextOfKin, children, adminNotes, seniorityDate,
                dateOfBirth, socialSecurityNumber, gender, employeeId, jobTitle, department, supervisor,
                employmentStatus, probationEndDate, hourlyRate: Number(hourlyRate) || deleteField() as any,
                bankAccountNumber, taxCode, staffHandbookAcknowledged, backgroundCheckDate,
                baseLocation: baseAddress ? {
                    address: baseAddress,
                    coordinates: { lat: parseFloat(baseLat) || 0, lng: parseFloat(baseLng) || 0 },
                    radius: baseRadius
                } : deleteField() as any,
                agencyInfo: employmentType === 'external' ? { name: agencyName, contactPerson: agencyContact, phone: agencyPhone, email: agencyEmail } : deleteField() as any,
                rotation: useRotation ? { startDate: rotationStartDateStr, weeks: rotationWeeks } : deleteField() as any,
                workingHours: useRotation ? deleteField() as any : { start: workingHoursStart, end: workingHoursEnd }
            };`;

if(content.match(submitRegex)) {
    content = content.replace(submitRegex, newPayload);
} else {
    // If regex fails just replace blindly between the try block start and await onSubmit
    const blockStart = content.indexOf('const dataToSubmit: Partial<DriverProfile> = {');
    const blockEnd = content.indexOf('await onSubmit(dataToSubmit);');
    content = content.slice(0, blockStart) + newPayload + '\n            ' + content.slice(blockEnd);
}

fs.writeFileSync(filePath, content);
console.log('Fixed driver form');
