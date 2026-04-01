const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The problematic code is:
/*
const [scheduleOverrides,
                rotation: useRotation && rotationStartDate ? {
                    startDate: rotationStartDate.toISOString(),
                    weeks: rotationWeeks
                } : undefined, setScheduleOverrides] = useState<DriverProfile['scheduleOverrides']>(user.scheduleOverrides || {});
*/

content = content.replace(
    /const \[scheduleOverrides,[\s\S]*?\} : undefined, setScheduleOverrides\] = useState<DriverProfile\['scheduleOverrides'\]>\(user\.scheduleOverrides \|\| \{\}\);/,
    "const [scheduleOverrides, setScheduleOverrides] = useState<DriverProfile['scheduleOverrides']>(user.scheduleOverrides || {});"
);

fs.writeFileSync(filePath, content);
console.log('Fixed syntax error in DriverProfileForm');
