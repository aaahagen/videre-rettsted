const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'storage.rules');
let content = fs.readFileSync(filePath, 'utf8');

// The error is because we added a new top-level collection 'vehicles' but didn't add it to firestore.rules
const newRules = `    // Place images: Any logged-in user can read and write (upload images for delivery locations)
    // We restrict writes to valid images only to prevent non-image uploads.
    match /places/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isValidImage();
    }
    
    // Vehicle images: Any logged-in user can read, any logged-in user can write (assuming admins manage fleet)
    match /vehicles/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isValidImage();
    }`;

content = content.replace(/[\s]*\/\/ Place images[\s\S]*?\}\n/, newRules + '\n');

fs.writeFileSync(filePath, content);
console.log('Added vehicles to storage.rules');
