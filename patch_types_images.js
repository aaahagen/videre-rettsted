const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add images to User (Driver Profile) and Vehicle
content = content.replace(
    /export interface User \{[\s\S]*?status\?: 'active' \| 'paused';\n\}/,
    `export interface User {\n  avatarUrl?: string;\n  id: string;\n  name: string;\n  email: string;\n  orgId: string;\n  role: 'admin' | 'driver';\n  favorites: string[];\n  status?: 'active' | 'paused';\n  images?: { url: string; description?: string; uploadedAt?: any }[];\n}`
);

content = content.replace(
    /export interface Vehicle \{[\s\S]*?updatedAt: FieldValue \| Date;\n\}/,
    `export interface Vehicle {\n  id: string;\n  orgId: string;\n  name: string; // e.g., "Scania R500", "Van 1"\n  registrationNumber: string;\n  type: 'truck' | 'van' | 'car';\n  fuelType?: 'diesel' | 'electric' | 'gas' | 'hybrid';\n  dimensions?: {\n    length?: number; // meters\n    height?: number; // meters\n    width?: number; // meters\n  };\n  capacity: {\n    weight?: number; // in kg\n    volume?: number; // in cubic meters\n    pallets?: number;\n  };\n  capabilities: {\n    refrigeration: boolean;\n    tailLift: boolean;\n    adr: boolean; // Hazardous materials\n    trailerCoupling: boolean; // Can drag a trailer\n  };\n  status: 'active' | 'maintenance' | 'inactive';\n  createdAt: FieldValue | Date;\n  updatedAt: FieldValue | Date;\n  images?: { url: string; description?: string; uploadedAt?: any }[];\n}`
);


fs.writeFileSync(filePath, content);
console.log('Added images to User and Vehicle types.');
