const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the appended one
content = content.replace('  createdBy: string; updatedBy?: string;\n}', '}');

// Fix the existing one
content = content.replace('  createdBy?: string; // Database field might be createdBy', '  createdBy: string;\n  updatedBy?: string;');

fs.writeFileSync(filePath, content);
console.log('Fixed types definition');
