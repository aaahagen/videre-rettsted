const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Organization with mainDepot
const oldOrg = `export interface Organization {
  id:string;
  name: string;
  orgNumber?: string;
  ownerId?: string;`;

const newOrg = `export interface Organization {
  id:string;
  name: string;
  orgNumber?: string;
  ownerId?: string;
  mainDepot?: {
    address: string;
    coordinates: { lat: number, lng: number };
    radius: number; // in meters
  };`;

content = content.replace(oldOrg, newOrg);

// 2. Update DriverProfile with tracking method and custom base
const oldDriver = `export interface DriverProfile extends User {
  employmentType?: 'internal' | 'external';`;

const newDriver = `export interface DriverProfile extends User {
  employmentType?: 'internal' | 'external';
  timeTrackingMethod?: 'fixed_location' | 'flexible_location';
  baseLocation?: {
    address: string;
    coordinates: { lat: number, lng: number };
    radius: number;
  };`;

content = content.replace(oldDriver, newDriver);

fs.writeFileSync(filePath, content);
console.log('Updated types with Geofencing fields');
