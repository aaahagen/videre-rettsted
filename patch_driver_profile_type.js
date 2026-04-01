const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

const oldDriverProfile = `export interface DriverProfile extends User {
  workingHours?: {
    start: string; // e.g., "08:00"
    end: string;   // e.g., "16:00"
  };
  certifications?: string[]; // e.g., ["ADR", "Forklift"]
  skills?: string[];
}`;

const newDriverProfile = `export interface DriverProfile extends User {
  workingHours?: {
    start: string; // e.g., "08:00"
    end: string;   // e.g., "16:00"
  };
  scheduleOverrides?: Record<string, {
    type: 'off' | 'vacation' | 'sick' | 'custom';
    start?: string;
    end?: string;
  }>;
  certifications?: string[]; // e.g., ["ADR", "Forklift"]
  skills?: string[];
}`;

if (content.includes(oldDriverProfile)) {
    content = content.replace(oldDriverProfile, newDriverProfile);
    fs.writeFileSync(filePath, content);
    console.log('Updated DriverProfile type.');
} else {
    console.log('Could not find existing DriverProfile type to replace.');
}
