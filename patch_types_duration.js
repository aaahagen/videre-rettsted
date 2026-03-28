const fs = require('fs');

const typesFile = 'src/lib/types.ts';
let code = fs.readFileSync(typesFile, 'utf8');

const originalRouteType = `export interface Route {
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

const replacementRouteType = `export interface Route {
  id: string;
  name: string;
  orgId: string; // Database field is orgId
  organizationId?: string;
  places: string[]; // array of placeIds
  driverId?: string;
  distance?: number; // in kilometers
  duration?: string; // e.g., "1 t 23 min"
  prepTimeStart?: number; // in minutes
  prepTimeEnd?: number; // in minutes
  breakTime?: number; // in minutes
  fuelServiceTime?: number; // in minutes
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}`;

code = code.replace(originalRouteType, replacementRouteType);
fs.writeFileSync(typesFile, code);
