const fs = require('fs');
const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

const routeTypeChange = `export interface Route {
  id: string;
  name: string;
  orgId: string; // Database field is orgId
  organizationId?: string;
  places: string[]; // array of placeIds
  driverId?: string;
  distance?: number; // in kilometers
  prepTimeStart?: number; // in minutes
  prepTimeEnd?: number; // in minutes
  breakTime?: number; // in minutes
  fuelServiceTime?: number; // in minutes
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}`;

content = content.replace(/export interface Route \{[^\}]+\}/, routeTypeChange);
fs.writeFileSync(file, content);
