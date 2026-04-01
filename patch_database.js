const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/database.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('Vehicle')) {
    // 1. Add Vehicle to imports
    content = content.replace(
        "import { Place, User, Organization, Route } from './types';",
        "import { Place, User, Organization, Route, Vehicle } from './types';"
    );

    // 2. Add Vehicle methods to the interface
    const vehicleMethods = `
  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
  getVehicle(id: string): Promise<Vehicle | null>;
  getVehicles(orgId: string): Promise<Vehicle[]>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;
`;

    content = content.replace(/}\s*$/, vehicleMethods + '\n}');
    
    fs.writeFileSync(filePath, content);
    console.log('Added Vehicle methods to database.ts');
} else {
    console.log('Vehicle methods already exist in database.ts');
}
