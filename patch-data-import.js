const fs = require('fs');
let code = fs.readFileSync('src/components/admin/data-import.tsx', 'utf8');

code = code.replace(
`             notes: p.notes || "",
             contactPersons: Array.isArray(p.contactPersons) ? p.contactPersons : [],
             hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],`,
`             notes: p.notes || "",
             field3: p.field3 || "",
             contactPersons: Array.isArray(p.contactPersons) ? p.contactPersons : [],
             hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],`
);

fs.writeFileSync('src/components/admin/data-import.tsx', code);
