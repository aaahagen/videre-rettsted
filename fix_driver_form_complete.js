const fs = require('fs');
const path = require('path');

let formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let formCode = fs.readFileSync(formPath, 'utf8');

// Use string replacement instead of regex to avoid escaping hell
const searchTarget = `            await onSubmit(dataToSubmit);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

            if (employmentType === 'external') {
                dataToSubmit.agencyInfo = {
                    name: agencyName,
                    contactPerson: agencyContact,
                    phone: agencyPhone,
                    email: agencyEmail,
                };
            } else {
                dataToSubmit.agencyInfo = deleteField();
            }

            if (employmentType === 'external') {
                dataToSubmit.agencyInfo = {
                    name: agencyName,
                    contactPerson: agencyContact,
                    phone: agencyPhone,
                    email: agencyEmail,
                };
            } else {
                dataToSubmit.agencyInfo = deleteField();
            }

            if (useRotation) {
                dataToSubmit.rotation = {
                    startDate: rotationStartDateStr,
                    weeks: rotationWeeks,
                };
                dataToSubmit.workingHours = deleteField();
            } else {
                dataToSubmit.workingHours = {
                    start: workingHoursStart,
                    end: workingHoursEnd,
                };
                dataToSubmit.rotation = deleteField();
            }

            await onSubmit(dataToSubmit);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };`;

const replacement = `            await onSubmit(dataToSubmit);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };`;

if (formCode.includes(searchTarget)) {
    formCode = formCode.replace(searchTarget, replacement);
}

fs.writeFileSync(formPath, formCode);
