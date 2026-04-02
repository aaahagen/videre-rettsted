const fs = require('fs');
const file = 'firestore.rules';
let content = fs.readFileSync(file, 'utf8');

const targetRules = `    // Vehicles
    match /vehicles/{vehicleId} {`;

const newRules = `    // Messages
    match /messages/{messageId} {
      allow read: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId);
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId);
    }

    // Vehicles
    match /vehicles/{vehicleId} {`;

content = content.replace(targetRules, newRules);
fs.writeFileSync(file, content);
