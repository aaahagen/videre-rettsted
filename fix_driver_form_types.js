const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    /user\.rotation\?\.rotation\?\.startDate/g,
    "user.rotation?.startDate"
);

content = content.replace(
    /user\.rotation\.rotation\.startDate/g,
    "user.rotation.startDate"
);

fs.writeFileSync(filePath, content);
console.log('Fixed rotation type error in DriverProfileForm');
