const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

const regex = /const \[seniorityDate,[\s\S]*?setSeniorityDate\] = useState\(user\.seniorityDate \|\| ''\);/;

content = content.replace(regex, "const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');");

fs.writeFileSync(formPath, content);
console.log("Fixed state var duplication with regex");
