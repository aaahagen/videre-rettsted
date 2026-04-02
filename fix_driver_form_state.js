const fs = require('fs');
const path = require('path');

let formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let formCode = fs.readFileSync(formPath, 'utf8');

const stateHookToAdd = `    const [employmentType, setEmploymentType] = useState<'internal' | 'external'>(user?.employmentType || 'internal');
    const [agencyName, setAgencyName] = useState(user?.agencyInfo?.name || '');
    const [agencyContact, setAgencyContact] = useState(user?.agencyInfo?.contactPerson || '');
    const [agencyPhone, setAgencyPhone] = useState(user?.agencyInfo?.phone || '');
    const [agencyEmail, setAgencyEmail] = useState(user?.agencyInfo?.email || '');`;

// Add the state hooks at the end of the state declarations
formCode = formCode.replace(
    "const [newSkill, setNewSkill] = useState('');",
    `const [newSkill, setNewSkill] = useState('');\n${stateHookToAdd}`
);

// Now, correctly modify the dataToSubmit object
const dataToSubmitRegex = /const dataToSubmit: any = \{([\s\S]*?)\};/;
const match = formCode.match(dataToSubmitRegex);

if (match) {
    const existingData = match[1];
    const newDataToSubmit = `const dataToSubmit: any = {
${existingData}                employmentType,
                role: employmentType === 'external' ? 'contractor' : 'driver',
            };

            if (employmentType === 'external') {
                dataToSubmit.agencyInfo = {
                    name: agencyName,
                    contactPerson: agencyContact,
                    phone: agencyPhone,
                    email: agencyEmail,
                };
            } else {
                dataToSubmit.agencyInfo = deleteField();
            }`;
    formCode = formCode.replace(match[0], newDataToSubmit);
}

fs.writeFileSync(formPath, formCode);
