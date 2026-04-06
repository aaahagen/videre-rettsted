const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/database.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add WorkLog to imports
content = content.replace("import { Place, User, Organization, Route, Vehicle } from './types';", "import { Place, User, Organization, Route, Vehicle, WorkLog } from './types';");

// 2. Add WorkLog methods
const workLogMethods = `

  createWorkLog(workLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkLog>;
  getWorkLog(id: string): Promise<WorkLog | null>;
  getWorkLogsForDriver(driverId: string, startDate?: string, endDate?: string): Promise<WorkLog[]>;
  getWorkLogsForOrganization(orgId: string, status?: WorkLog['status']): Promise<WorkLog[]>;
  updateWorkLog(id: string, updates: Partial<WorkLog>): Promise<WorkLog>;
  deleteWorkLog(id: string): Promise<void>;`;

// Insert before the last closing brace
content = content.replace(/}\s*$/, workLogMethods + '\n}');

fs.writeFileSync(filePath, content);
console.log('Updated database interface');
