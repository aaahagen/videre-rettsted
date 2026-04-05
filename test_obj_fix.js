const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// I am modifying the file in the wrong place or with incorrect syntax.
// Let's print out what we see
console.log(content.substring(content.indexOf("const dataToSubmit: Partial<DriverProfile> = {"), content.indexOf("const dataToSubmit: Partial<DriverProfile> = {") + 1000));
