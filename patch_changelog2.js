const fs = require('fs');
const file = 'docs/CHANGELOG.md';
let content = fs.readFileSync(file, 'utf8');

const targetAdded = `### Added
- **Proof of Delivery Foundation (Location & Timestamps):** When a driver completes a stop, the application now requests the device's location. A timestamp and the GPS coordinates are securely saved to the database.`;

const newAdded = `### Added
- **Real-time Messaging System:** Added a dedicated communication hub (\`/dashboard/messages\`) allowing administrators to broadcast messages to all drivers or all administrators. Drivers can send direct messages back to the administrative team.
- **Read Receipts & Unread Badges:** Implemented a real-time read receipt system. Senders can see when their messages have been read (single vs double checkmarks). A dynamic unread badge also appears in the sidebar for any user with new messages.
- **Proof of Delivery Foundation (Location & Timestamps):** When a driver completes a stop, the application now requests the device's location. A timestamp and the GPS coordinates are securely saved to the database.`;

content = content.replace(targetAdded, newAdded);
fs.writeFileSync(file, content);
