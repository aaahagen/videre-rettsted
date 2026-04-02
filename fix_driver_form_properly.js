const fs = require('fs');
const path = require('path');

let formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let formCode = fs.readFileSync(formPath, 'utf8');

// 1. Fix the missing Briefcase icon import
const oldImport = "import { Loader2, Plus, X, UploadCloud, Trash2, FileText, Download, User as UserIcon } from 'lucide-react';";
const newImport = "import { Loader2, Plus, X, UploadCloud, Trash2, FileText, Download, User as UserIcon, Briefcase } from 'lucide-react';";
formCode = formCode.replace(oldImport, newImport);

// 2. Replace the entire broken handleSubmit function
const oldHandleSubmitRegex = /const handleSubmit = async \(e: React.FormEvent\) => \{[\s\S]*?};/;
const newHandleSubmit = `    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsUploading(true);

        try {
            let imageData: { url: string; }[] = [];
            
            if (image && image.file) {
                const uniqueId = uuidv4();
                const path = \`users/\${user.id}/profile/\${uniqueId}\`;
                const url = await firebaseStorage.uploadFile(path, image.file);
                imageData = [{ url }];
            } else if (image) {
                imageData = [{ url: image.url }];
            }

            let uploadedDocuments: { url: string; name: string; type: string; uploadedAt?: any }[] = [];
            
            for (const doc of documents) {
                if (doc.file) {
                    const uniqueId = uuidv4();
                    const safeName = doc.name.replace(/[^a-zA-Z0-9.\\-_]/g, '_');
                    const path = \`users/\${user.id}/documents/\${uniqueId}_\${safeName}\`;
                    const url = await firebaseStorage.uploadFile(path, doc.file);
                    uploadedDocuments.push({
                        url,
                        name: doc.name,
                        type: doc.type,
                        uploadedAt: new Date()
                    });
                } else {
                    uploadedDocuments.push({
                        url: doc.url,
                        name: doc.name,
                        type: doc.type
                    });
                }
            }

            const dataToSubmit: Partial<DriverProfile> = {
                certifications,
                skills,
                scheduleOverrides,
                images: imageData,
                documents: uploadedDocuments,
                employmentType,
                role: employmentType === 'external' ? 'contractor' : 'driver',
            };

            if (employmentType === 'external') {
                dataToSubmit.agencyInfo = {
                    name: agencyName,
                    contactPerson: agencyContact,
                    phone: agencyPhone,
                    email: agencyEmail,
                };
            } else {
                dataToSubmit.agencyInfo = deleteField() as any;
            }

            if (useRotation) {
                dataToSubmit.rotation = {
                    startDate: rotationStartDateStr,
                    weeks: rotationWeeks,
                };
                dataToSubmit.workingHours = deleteField() as any;
            } else {
                dataToSubmit.workingHours = {
                    start: workingHoursStart,
                    end: workingHoursEnd,
                };
                dataToSubmit.rotation = deleteField() as any;
            }

            await onSubmit(dataToSubmit);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };`;

formCode = formCode.replace(oldHandleSubmitRegex, newHandleSubmit);

fs.writeFileSync(formPath, formCode);
