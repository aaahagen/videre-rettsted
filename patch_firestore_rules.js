const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'firestore.rules');
let content = fs.readFileSync(filePath, 'utf8');

// The error is because we added a new top-level collection 'vehicles' but didn't add it to firestore.rules
const newRules = `    // Routes
    match /routes/{routeId} {
      allow read: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();
      
      // Allow update if admin, OR if driver assigned to the route is updating specific fields
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId) && (
        isAdmin() || 
        (request.auth.uid == resource.data.driverId)
      );
      
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }

    // Vehicles
    match /vehicles/{vehicleId} {
      allow read: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }`;

content = content.replace(/[\s]*\/\/ Routes[\s\S]*?\}\n/, newRules + '\n');

fs.writeFileSync(filePath, content);
console.log('Added vehicles to firestore.rules');
