const fs = require('fs');
let content = fs.readFileSync('src/components/places/place-form.tsx', 'utf-8');

content = content.replace("const currentVal = form.getValues()[key];", "const currentVal = form.getValues()[key as keyof PlaceFormValues];");
content = content.replace("form.setValue(key, parsedDraft[key], { shouldValidate: true, shouldDirty: true });", "form.setValue(key as any, parsedDraft[key], { shouldValidate: true, shouldDirty: true });");

fs.writeFileSync('src/components/places/place-form.tsx', content);
