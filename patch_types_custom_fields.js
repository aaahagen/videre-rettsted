const fs = require('fs');
const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

const targetCapabilities = `  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean; // Hazardous materials
    trailerCoupling: boolean; // Can drag a trailer
    notes?: string;
  };`;

const newCapabilities = `  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean; // Hazardous materials
    trailerCoupling: boolean; // Can drag a trailer
    notes?: string;
    customFields?: { name: string; value: string }[];
  };`;

content = content.replace(targetCapabilities, newCapabilities);
fs.writeFileSync(file, content);
