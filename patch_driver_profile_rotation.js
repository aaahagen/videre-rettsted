const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

const oldDriverProfile = `export interface DriverProfile extends User {
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

const newDriverProfile = `export interface DriverProfile extends User {
  workingHours?: {
    start: string; // e.g., "08:00"
    end: string;   // e.g., "16:00"
  };
  rotation?: {
    startDate: string; // ISO date string when rotation starts
    weeks: Array<{
      days: {
        monday: { isWorking: boolean; start?: string; end?: string };
        tuesday: { isWorking: boolean; start?: string; end?: string };
        wednesday: { isWorking: boolean; start?: string; end?: string };
        thursday: { isWorking: boolean; start?: string; end?: string };
        friday: { isWorking: boolean; start?: string; end?: string };
        saturday: { isWorking: boolean; start?: string; end?: string };
        sunday: { isWorking: boolean; start?: string; end?: string };
      };
    }>;
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
    console.log('Updated DriverProfile type with rotation.');
} else {
    console.log('Could not find existing DriverProfile type to replace.');
}
