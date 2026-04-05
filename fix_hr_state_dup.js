const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// A bunch of state variables were appended to seniorityDate instead of dataToSubmit
const search = `const [seniorityDate,
                dateOfBirth,
                socialSecurityNumber,
                gender,
                employeeId,
                jobTitle,
                department,
                supervisor,
                employmentStatus,
                probationEndDate,
                bankAccountNumber,
                taxCode,
                staffHandbookAcknowledged,
                backgroundCheckDate, setSeniorityDate] = useState(user.seniorityDate || '');`;

const replace = `const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');`;

content = content.replace(search, replace);
fs.writeFileSync(formPath, content);
console.log("Fixed state var duplication");
