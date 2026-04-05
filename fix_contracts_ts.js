const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// Fix TypeScript error
content = content.replace("setContracts([...contracts, newContract]);", "setContracts([...(contracts || []), newContract]);");
content = content.replace("setContracts(contracts.filter(c => c.id !== id));", "setContracts((contracts || []).filter(c => c.id !== id));");

fs.writeFileSync(formPath, content);
console.log("Fixed driver profile TypeScript error");
