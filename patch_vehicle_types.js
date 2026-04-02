const fs = require('fs');
const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

const targetCapacity = `  capacity: {
    weight?: number; // in kg
    volume?: number; // in cubic meters
    pallets?: number;
  };`;

const newCapacity = `  capacity: {
    weight?: number; // in kg
    volume?: number; // in cubic meters
    pallets?: number;
    notes?: string;
  };`;

content = content.replace(targetCapacity, newCapacity);

const targetCapabilities = `  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean; // Hazardous materials
    trailerCoupling: boolean; // Can drag a trailer
  };`;

const newCapabilities = `  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean; // Hazardous materials
    trailerCoupling: boolean; // Can drag a trailer
    notes?: string;
  };`;

content = content.replace(targetCapabilities, newCapabilities);

fs.writeFileSync(file, content);
