const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/admin/admin-content.tsx', 'utf8');
code = code.replace(/id="contactPersonsLabel"\n\s*placeholder="F.eks. Kode til port"/g, 'id="contactPersonsLabel"\n                            placeholder="F.eks. Kontaktpersoner"');
fs.writeFileSync('src/app/dashboard/admin/admin-content.tsx', code);
