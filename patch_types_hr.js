const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(typesPath, 'utf8');

const search = `  // New HR/Workforce fields
  address?: string;
  phone?: string;
  emergencyContact?: string;
  nextOfKin?: string;
  children?: string; // Simple text field for now, can be expanded later
  adminNotes?: string;
  seniorityDate?: string; // ISO date string
  contracts?: Contract[];
  timeLogs?: TimeLog[];`;

const replacement = `  // New HR/Workforce fields
  address?: string;
  phone?: string;
  emergencyContact?: string; // Format: Name, Relationship, Phone
  nextOfKin?: string;
  children?: string; // Simple text field for now, can be expanded later
  adminNotes?: string;
  seniorityDate?: string; // ISO date string
  contracts?: Contract[];
  timeLogs?: TimeLog[];

  // Personal Identification
  dateOfBirth?: string; // ISO date string
  socialSecurityNumber?: string;
  gender?: string;

  // Employment & Status
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  supervisor?: string;
  employmentStatus?: string; // e.g., 'full-time', 'part-time'
  probationEndDate?: string; // ISO date string

  // Compensation & Benefits
  hourlyRate?: number;
  bankAccountNumber?: string;
  taxCode?: string;

  // Compliance & Records
  staffHandbookAcknowledged?: boolean;
  backgroundCheckDate?: string; // ISO date string`;

content = content.replace(search, replacement);

fs.writeFileSync(typesPath, content);
console.log('Updated types.ts with new HR fields');
