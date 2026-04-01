const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

const routeTypeMatch = /export interface Route \{[\s\S]*?updatedAt: FieldValue \| Date;\n\}/;
if (content.match(routeTypeMatch)) {
    const matchedType = content.match(routeTypeMatch)[0];
    if (!matchedType.includes('vehicleId?: string;')) {
        const newType = matchedType.replace(
            'driverId?: string;',
            'driverId?: string;\n  vehicleId?: string;'
        );
        content = content.replace(matchedType, newType);
        fs.writeFileSync(filePath, content);
        console.log('Added vehicleId to Route type.');
    } else {
        console.log('vehicleId already exists in Route type.');
    }
}
