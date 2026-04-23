const fs = require('fs');
let code = fs.readFileSync('src/components/places/place-form.tsx', 'utf8');

code = code.replace(
  "contactPersons: data.contactPersons || [],",
  "contactPersons: (data.contactPersons || []).map(cp => ({ name: cp.name || '', phone: cp.phone || '', email: cp.email || '' })),"
);

fs.writeFileSync('src/components/places/place-form.tsx', code);
