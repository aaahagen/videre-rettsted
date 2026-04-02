const fs = require('fs');
const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

const targetType = `  type: 'truck' | 'van' | 'car';`;
const newType = `  type: 'truck' | 'van' | 'car' | 'trailer';`;
content = content.replace(targetType, newType);

const targetCapabilities = `  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean; // Hazardous materials
    trailerCoupling: boolean; // Can drag a trailer
    notes?: string;`;

const newCapabilities = `  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean; // Hazardous materials
    trailerCoupling: boolean; // Can drag a trailer
    flatbed?: boolean; // Flakbil
    notes?: string;`;
content = content.replace(targetCapabilities, newCapabilities);

fs.writeFileSync(file, content);
