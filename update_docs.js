const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs/SPECS.md');
let content = fs.readFileSync(filePath, 'utf8');

const newFeatureSection = `
### 7. Workforce Management & HR
The application serves as a central hub for personnel management.
- **Driver Profiles:** Detailed profiles for each employee (both internal and external contractors).
- **Core HR Data:** Profiles must store and display:
    - Contact info (Phone, Address).
    - Emergency contacts and Next of Kin.
    - Employment details (Employee ID, Job Title, Department, Supervisor, Seniority Date, Employment Status).
    - Payroll & Legal info (Social Security Number/D-nummer, Date of Birth, Gender, Hourly Rate, Bank Account, Tax Code).
    - Compliance tracking (Probation End Date, Background Check Date, Staff Handbook Acknowledgment).
- **Administrative Notes:** A private text field on each profile strictly visible only to administrators for internal observations.
- **Contract Management:** Ability to upload and log multiple digital contracts per employee (Start Date, End Date, Role, Contracted Hours).
- **Document Storage:** Secure upload for certificates, diplomas, and other HR-related documents.

### 8. Time & Attendance (Stamping)
- **Geofencing & Time Tracking:** The system tracks actual worked hours versus planned schedules.
- **Organization Depot:** Admins define a main depot with GPS coordinates and a allowed stamping radius.
- **Driver Settings:** Each driver is configured for either:
    - *Fixed Location:* Must be within the depot's geofence (or their specific Alternative Depot) to start a shift.
    - *Flexible Location:* Can stamp from anywhere; GPS coordinates are captured for audit.
- **Admin Approval Workflow:** Time logs where actual hours exceed planned hours are automatically flagged for admin review and approval/decline.

### 9. Fleet Management
- Complete registry of company vehicles.
- Tracks capacities (weight, volume, pallets), physical dimensions (height, width, length), and specialized capabilities (ADR, refrigeration, tail-lift, flatbed, trailer coupling).
- Supports custom key-value attributes (e.g., "Jekketralle: 2 stk").
- Document storage for vehicle registration and insurance.
`;

content = content.replace(
    '## Language Support',
    newFeatureSection + '\n## Language Support'
);

fs.writeFileSync(filePath, content);
console.log('Updated SPECS.md');
