const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// Fix TypeScript error
content = content.replace("contracts.length > 0", "(contracts || []).length > 0");
content = content.replace("contracts.sort", "(contracts || []).sort");

fs.writeFileSync(formPath, content);
console.log("Fixed driver profile TypeScript error 2");
