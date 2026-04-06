const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const badBlockRegex = /const \[employmentType,[\s\S]*?as any, setEmploymentType\] = useState<'internal' \| 'external'>\(user\?\.employmentType \|\| 'internal'\);/g;
content = content.replace(badBlockRegex, "const [employmentType, setEmploymentType] = useState<'internal' | 'external'>(user?.employmentType || 'internal');");

fs.writeFileSync(filePath, content);
console.log('Fixed syntax error in variable declaration');
