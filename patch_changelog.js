const fs = require('fs');
const file = 'docs/CHANGELOG.md';
let content = fs.readFileSync(file, 'utf8');

const targetAdded = `### Added
- **External Workforce (Contractors):** Introduced a new system to register and manage hired external extras (Innleid). They receive a dedicated role with customized access, and administrators can log their specific agency contact information.`;

const newAdded = `### Added
- **Proof of Delivery Foundation (Location & Timestamps):** When a driver completes a stop, the application now requests the device's location. A timestamp and the GPS coordinates are securely saved to the database.
- **Enhanced Monitor Dashboard:** The Monitor page now displays the exact time a delivery was completed next to the checkmark, replacing the generic "Fullført" text. Additionally, a clickable "Vis kart" link appears, allowing administrators to open Google Maps pinned to the exact location where the driver was when they completed the stop.
- **External Workforce (Contractors):** Introduced a new system to register and manage hired external extras (Innleid). They receive a dedicated role with customized access, and administrators can log their specific agency contact information.`;

content = content.replace(targetAdded, newAdded);

const targetFuture = `- **Driver Location Tracking:** Capture the driver's GPS location using the browser's Geolocation API when a stop is marked as "visited." This data will be stored with a timestamp for verification.
- **Geofence-based Delivery Alerts:** Automatically calculate the distance between the planned stop's address and the driver's captured GPS location. If the distance exceeds a configurable threshold, an alert will be generated and displayed in real-time on the admin dashboard to flag potential delivery errors.
- **Visited Stop Timestamps:** When a driver marks a stop as visited, a timestamp will be recorded and displayed next to the stop on the monitor page, providing a clear audit trail of delivery times.`;

const newFuture = `- **Geofence-based Delivery Alerts:** Automatically calculate the distance between the planned stop's address and the driver's captured GPS location. If the distance exceeds a configurable threshold, an alert will be generated and displayed in real-time on the admin dashboard to flag potential delivery errors.`;

content = content.replace(targetFuture, newFuture);

fs.writeFileSync(file, content);
