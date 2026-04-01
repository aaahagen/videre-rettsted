const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// I need to properly find and replace the submit logic
const submitRegex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?try \{[\s\S]*?await onSubmit\(\{[\s\S]*?workingHours: \{[\s\S]*?start: workingHoursStart,[\s\S]*?end: workingHoursEnd[\s\S]*?\},[\s\S]*?scheduleOverrides,[\s\S]*?rotation: useRotation && rotationStartDate \? \{[\s\S]*?startDate: rotationStartDate\.toISOString\(\),[\s\S]*?weeks: rotationWeeks[\s\S]*?\} : undefined,[\s\S]*?certifications,[\s\S]*?skills[\s\S]*?\}\);[\s\S]*?\} finally \{[\s\S]*?setIsSubmitting\(false\);[\s\S]*?\}[\s\S]*?\};/;

const newSubmit = `const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsUploading(true);
        try {
            const finalImages = [];
            for (const img of images) {
                if (img.file) {
                    const ext = img.file.name.split('.').pop() || 'jpg';
                    const path = \`users/\${user.id}/\${uuidv4()}.\${ext}\`;
                    const url = await firebaseStorage.uploadFile(path, img.file);
                    finalImages.push({ url });
                } else {
                    finalImages.push({ url: img.url });
                }
            }
            setIsUploading(false);

            await onSubmit({
                workingHours: {
                    start: workingHoursStart,
                    end: workingHoursEnd
                },
                scheduleOverrides,
                rotation: useRotation && rotationStartDate ? {
                    startDate: rotationStartDate.toISOString(),
                    weeks: rotationWeeks
                } : undefined,
                certifications,
                skills,
                images: finalImages
            });
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };`;

content = content.replace(submitRegex, newSubmit);

fs.writeFileSync(filePath, content);
console.log('Fixed driver images submission logic');
