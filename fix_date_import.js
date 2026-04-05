const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(formPath, 'utf8');

// The file might need parseISO if the contract dates are just strings like '2023-01-01' to avoid tz issues
content = content.replace(/format\(new Date\(/g, "format(parseISO(");
content = content.replace(/import \{ format, addDays \} from 'date-fns';/g, "import { format, addDays, parseISO } from 'date-fns';");

fs.writeFileSync(formPath, content);
console.log("Updated date parsing in driver profile form");
