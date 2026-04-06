const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs/ARCHITECTURE.md');
let content = fs.readFileSync(filePath, 'utf8');

// Update database schema section
const oldUsersSchema = `### /users/{userId}
- name: string
- email: string
- role: "driver" | "admin"
- orgId: string
- favorites: array (of placeIds)
- workingHours: map (start, end)
- rotation: map (startDate, weeks array)
- scheduleOverrides: map (date string -> type, start, end)
- certifications: array (of strings)
- skills: array (of strings)`;

const newUsersSchema = `### /users/{userId}
- name: string
- email: string
- role: "driver" | "admin" | "contractor"
- orgId: string
- favorites: array (of placeIds)
- employmentType: 'internal' | 'external'
- timeTrackingMethod: 'fixed_location' | 'flexible_location'
- baseLocation: map (address, coordinates, radius)
- workingHours: map (start, end)
- rotation: map (startDate, weeks array)
- scheduleOverrides: map (date string -> type, start, end)
- certifications: array (of strings)
- skills: array (of strings)
- phone: string
- address: string
- emergencyContact: string
- nextOfKin: string
- children: string
- adminNotes: string
- seniorityDate: string
- dateOfBirth: string
- socialSecurityNumber: string
- gender: string
- employeeId: string
- jobTitle: string
- department: string
- supervisor: string
- employmentStatus: string
- probationEndDate: string
- hourlyRate: number
- bankAccountNumber: string
- taxCode: string
- staffHandbookAcknowledged: boolean
- backgroundCheckDate: string
- contracts: array (of Contract objects)
- agencyInfo: map (name, contactPerson, phone, email) // Only for contractors`;

content = content.replace(oldUsersSchema, newUsersSchema);

const oldOrgSchema = `### /organizations/{orgId}
- name: string
- settings: map`;

const newOrgSchema = `### /organizations/{orgId}
- name: string
- settings: map
- mainDepot: map (address, coordinates, radius) // Geofencing configuration`;

content = content.replace(oldOrgSchema, newOrgSchema);

const newWorkLogSchema = `
### /workLogs/{logId}
- orgId: string
- driverId: string
- plannedStart: string (ISO date)
- plannedEnd: string (ISO date)
- actualPunchIn: string (ISO date)
- actualPunchOut: string (ISO date)
- entryMethod: 'geofence' | 'gps_stamp' | 'manual_entry'
- punchInLocation: map (lat, lng)
- punchOutLocation: map (lat, lng)
- status: 'active' | 'pending_review' | 'needs_overtime_approval' | 'approved' | 'declined'
- overtimeMinutes: number
- notes: string
- createdAt: timestamp
- updatedAt: timestamp`;

content = content.replace(
    '### /invitations/{invitationId}',
    newWorkLogSchema + '\n\n### /invitations/{invitationId}'
);

// Update Security Rules section
const newWorkLogRule = `
- **WorkLogs**:
    - \`read\`: Drivers can read their own logs. Admins can read all logs in their org.
    - \`create\`: Authenticated users can create logs in their org.
    - \`update\`: Drivers can update their own active logs (to punch out). Admins can update to approve/decline.
    - \`delete\`: Only admins.`;

content = content.replace(
    '- **Routes**:',
    newWorkLogRule + '\n- **Routes**:'
);

fs.writeFileSync(filePath, content);
console.log('Updated ARCHITECTURE.md');
