const fs = require('fs');
const file = 'storage.rules';
let content = fs.readFileSync(file, 'utf8');

const targetVehicleRules = `    // Vehicle images: Any logged-in user can read, any logged-in user can write (assuming admins manage fleet)
    match /vehicles/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isValidImage();
    }`;

const newVehicleRules = `    // Vehicle images and documents: Any logged-in user can read, any logged-in user can write
    match /vehicles/{allPaths=**} {
      allow read: if request.auth != null;
      // Allow any valid document or image
      allow write: if request.auth != null && isValidDocument(); 
    }`;

content = content.replace(targetVehicleRules, newVehicleRules);
fs.writeFileSync(file, content);
