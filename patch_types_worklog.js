const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/types.ts');
let content = fs.readFileSync(filePath, 'utf8');

const oldTimeLog = `export interface TimeLog {
  id: string;
  date: string; // ISO date string
  planned: { start: string; end: string; };
  worked: { start: string; end: string; };
  overtimeStatus: 'pending' | 'approved' | 'declined';
  logMethod?: 'manual' | 'geofence';
}`;

const newWorkLog = `export interface WorkLog {
  id: string;
  orgId: string;
  driverId: string;
  
  // Planned Schedule (Snapshot of what was expected)
  plannedStart?: string; // ISO DateTime string
  plannedEnd?: string;   // ISO DateTime string
  
  // Actual Punches
  actualPunchIn?: string;  // ISO DateTime string
  actualPunchOut?: string; // ISO DateTime string
  
  // Location Data
  entryMethod: 'geofence' | 'gps_stamp' | 'manual_entry';
  punchInLocation?: { lat: number, lng: number };
  punchOutLocation?: { lat: number, lng: number };
  
  // Approval & Overtime Workflow
  status: 'active' | 'pending_review' | 'needs_overtime_approval' | 'approved' | 'declined';
  overtimeMinutes?: number;
  
  // Audit & Context
  notes?: string;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}`;

content = content.replace(oldTimeLog, newWorkLog);

// Also replace timeLogs?: TimeLog[]; in DriverProfile
content = content.replace('timeLogs?: TimeLog[];', 'workLogs?: WorkLog[];');

fs.writeFileSync(filePath, content);
console.log('Updated types with WorkLog');
