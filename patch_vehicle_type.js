const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

const oldVehicleTypeRegex = /export interface Vehicle \{[\s\S]*?updatedAt: FieldValue \| Date;\n\}/;

const newVehicleType = `export interface Vehicle {
  id: string;
  orgId: string;
  name: string; // e.g., "Scania R500", "Van 1"
  registrationNumber: string;
  type: 'truck' | 'van' | 'car';
  fuelType?: 'diesel' | 'electric' | 'gas' | 'hybrid';
  dimensions?: {
    length?: number; // meters
    height?: number; // meters
    width?: number; // meters
  };
  capacity: {
    weight?: number; // in kg
    volume?: number; // in cubic meters
    pallets?: number;
  };
  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean; // Hazardous materials
    trailerCoupling: boolean; // Can drag a trailer
  };
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}`;

if (content.match(oldVehicleTypeRegex)) {
    content = content.replace(oldVehicleTypeRegex, newVehicleType);
    fs.writeFileSync(filePath, content);
    console.log('Updated Vehicle type with trailerCoupling, fuelType, and dimensions.');
} else {
    console.log('Could not find existing Vehicle type to replace.');
}
