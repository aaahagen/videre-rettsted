const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/admin/admin-content.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The incorrect block:
/*
        fieldSettings: {
          ...
          mainDepot: { ... }
        }
*/

// I will extract the mainDepot part and move it up.
const badBlockRegex = /fieldSettings: \{[\s\S]*?mainDepot: \{[\s\S]*?\},\s*field3:/;
const match = content.match(badBlockRegex);

if (match) {
    let block = match[0];
    // Extract mainDepot block
    const depotRegex = /mainDepot: \{[\s\S]*?\},\s*/;
    const depotMatch = block.match(depotRegex);
    if (depotMatch) {
        const depotStr = depotMatch[0];
        // Remove it from the block
        block = block.replace(depotStr, '');
        // Put it before fieldSettings
        const newBlock = depotStr + block;
        content = content.replace(match[0], newBlock);
    }
}

fs.writeFileSync(filePath, content);
console.log('Fixed admin content depot placement');
