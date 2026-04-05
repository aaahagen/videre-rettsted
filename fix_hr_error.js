const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// Fix syntax error in variable declarations
const search = `const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');
    
    // Extended HR fields
    const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
    const [socialSecurityNumber, setSocialSecurityNumber] = useState(user.socialSecurityNumber || '');
    const [gender, setGender] = useState(user.gender || '');
    const [employeeId, setEmployeeId] = useState(user.employeeId || '');
    const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
    const [department, setDepartment] = useState(user.department || '');
    const [supervisor, setSupervisor] = useState(user.supervisor || '');
    const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus || '');
    const [probationEndDate, setProbationEndDate] = useState(user.probationEndDate || '');
    const [hourlyRate, setHourlyRate] = useState(user.hourlyRate || '');
    const [bankAccountNumber, setBankAccountNumber] = useState(user.bankAccountNumber || '');
    const [taxCode, setTaxCode] = useState(user.taxCode || '');
    const [staffHandbookAcknowledged, setStaffHandbookAcknowledged] = useState(user.staffHandbookAcknowledged || false);
    const [backgroundCheckDate, setBackgroundCheckDate] = useState(user.backgroundCheckDate || '');`;

const replace = `    const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');
    
    // Extended HR fields
    const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
    const [socialSecurityNumber, setSocialSecurityNumber] = useState(user.socialSecurityNumber || '');
    const [gender, setGender] = useState(user.gender || '');
    const [employeeId, setEmployeeId] = useState(user.employeeId || '');
    const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
    const [department, setDepartment] = useState(user.department || '');
    const [supervisor, setSupervisor] = useState(user.supervisor || '');
    const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus || '');
    const [probationEndDate, setProbationEndDate] = useState(user.probationEndDate || '');
    const [hourlyRate, setHourlyRate] = useState(user.hourlyRate ? String(user.hourlyRate) : '');
    const [bankAccountNumber, setBankAccountNumber] = useState(user.bankAccountNumber || '');
    const [taxCode, setTaxCode] = useState(user.taxCode || '');
    const [staffHandbookAcknowledged, setStaffHandbookAcknowledged] = useState(user.staffHandbookAcknowledged || false);
    const [backgroundCheckDate, setBackgroundCheckDate] = useState(user.backgroundCheckDate || '');`;

content = content.replace(search, replace);

// Fix the syntax error in dataToSubmit that got messed up
const objSearch = `                probationEndDate,
                hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
                bankAccountNumber,`;
const objReplace = `                probationEndDate,
                hourlyRate: hourlyRate ? Number(hourlyRate) : deleteField() as any,
                bankAccountNumber,`;

content = content.replace(objSearch, objReplace);

fs.writeFileSync(formPath, content);
console.log("Fixed HR error");
