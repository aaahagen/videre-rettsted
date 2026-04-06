const fs = require('fs');
const path = require('path');

const dbInterfacePath = path.join(__dirname, 'src/lib/database.ts');
let interfaceContent = fs.readFileSync(dbInterfacePath, 'utf8');
interfaceContent = interfaceContent.replace(/Omit<Place, 'id' \| 'createdAt' \| 'updatedAt'>/g, "Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>");
fs.writeFileSync(dbInterfacePath, interfaceContent);

const fbDbPath = path.join(__dirname, 'src/lib/firebase/database.ts');
let fbContent = fs.readFileSync(fbDbPath, 'utf8');
fbContent = fbContent.replace(/Omit<Place, 'id' \| 'createdAt' \| 'updatedAt'>/g, "Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>");
fs.writeFileSync(fbDbPath, fbContent);

console.log('Fixed DB function signatures');
