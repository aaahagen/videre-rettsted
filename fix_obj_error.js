const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// The issue was a typecasting `as any` inside an object literal!
content = content.replace("hourlyRate: hourlyRate ? Number(hourlyRate) : deleteField() as any,", "hourlyRate: hourlyRate ? Number(hourlyRate) : (deleteField() as any),");

fs.writeFileSync(formPath, content);
console.log("Fixed the object syntax error properly");
