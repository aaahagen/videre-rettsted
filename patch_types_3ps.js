const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

const routeTypeMatch = /export interface Route \{[\s\S]*?updatedAt: FieldValue \| Date;\n\}/;

if (content.match(routeTypeMatch)) {
    const matchedType = content.match(routeTypeMatch)[0];
    if (!matchedType.includes('thirdPartySupplier')) {
        const newType = matchedType.replace(
            'driverId?: string;',
            `driverId?: string;
  isThirdParty?: boolean;
  thirdPartySupplier?: string; // Name of the 3PS company`
        );
        content = content.replace(matchedType, newType);
        fs.writeFileSync(filePath, content);
        console.log('Added 3PS fields to Route type.');
    } else {
        console.log('3PS fields already exist in Route type.');
    }
}
