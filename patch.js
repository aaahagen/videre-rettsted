const fs = require('fs');

let code = fs.readFileSync('src/components/places/place-form.tsx', 'utf8');
code = code.replace("contactPersons: place?.contactPersons || '',", "contactPersons: place?.contactPersons || [{ name: '', phone: '', email: '' }],");
code = code.replace("contactPersons: data.contactPersons || '',", "contactPersons: data.contactPersons || [],");

fs.writeFileSync('src/components/places/place-form.tsx', code);
