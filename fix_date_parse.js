const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// Fix invalid parseISO usage
content = content.replace("format(parseISO(), 'yyyy-MM-dd')", "format(new Date(), 'yyyy-MM-dd')");

fs.writeFileSync(formPath, content);
console.log("Fixed date parsing error");
