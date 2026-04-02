const fs = require('fs');
const path = require('path');

let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// I removed `hasMoreOverrides` from the variables at the top of the map loop earlier, 
// but missed removing the actual JSX rendering it at the bottom of the list.

const regex = /\{hasMoreOverrides && \([\s\S]*?til<\/span>\s*\)\}/;

if (workforceCode.match(regex)) {
    workforceCode = workforceCode.replace(regex, '');
}

fs.writeFileSync(workforcePath, workforceCode);
