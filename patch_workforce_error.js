const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// Fix duplicate 'contracts' declaration
content = content.replace("const [seniorityDate, contracts, setSeniorityDate] = useState(user.seniorityDate || '');", "const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');");

fs.writeFileSync(formPath, content);
console.log("Fixed driver profile form error");
