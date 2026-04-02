const fs = require('fs');
const path = require('path');

let typesPath = path.join(__dirname, 'src/lib/types.ts');
let typesCode = fs.readFileSync(typesPath, 'utf8');

// The `role` can be 'admin', 'driver', or 'contractor' (external extra)
// Or we can add an `employmentType` field to DriverProfile: 'employee' | 'contractor'
// For the prompt: "They should also be able to use the app as a driver, but with fewer rights"
// It's probably easier to create a role 'contractor', or extend 'driver' role with a contractor flag.

const userUpdate = `export interface User {
  avatarUrl?: string;
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: 'admin' | 'driver' | 'contractor';
  favorites: string[];
  status?: 'active' | 'paused';
  images?: { url: string; description?: string; uploadedAt?: any }[];
}`;
const oldUser = `export interface User {
  avatarUrl?: string;
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: 'admin' | 'driver';
  favorites: string[];
  status?: 'active' | 'paused';
  images?: { url: string; description?: string; uploadedAt?: any }[];
}`;

typesCode = typesCode.replace(oldUser, userUpdate);

const driverProfileUpdate = `export interface DriverProfile extends User {
  employmentType?: 'internal' | 'external';
  agencyInfo?: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
  };
  workingHours?: {`;

typesCode = typesCode.replace('export interface DriverProfile extends User {\n  workingHours?: {', driverProfileUpdate);

// Also fix a typo in the rotation type: aupdatestring
typesCode = typesCode.replace("end?: aupdatestring };", "end?: string };");

const invitationUpdate = `export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'driver' | 'contractor';
  expiresAt: FieldValue;
  organizationName?: string;
}`;
const oldInvitation = `export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'driver';
  expiresAt: FieldValue;
  organizationName?: string;
}`;

typesCode = typesCode.replace(oldInvitation, invitationUpdate);

fs.writeFileSync(typesPath, typesCode);
