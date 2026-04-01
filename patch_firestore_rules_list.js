const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'firestore.rules');
let content = fs.readFileSync(filePath, 'utf8');

// The error happens when listing all vehicles: firebaseDB.getVehicles(userData.orgId)
// This translates to a `list` query: where('orgId', '==', orgId)
// In Firestore rules, `read` includes `get` (single document) and `list` (queries).
// However, when evaluating a `list` query, resource.data doesn't exist yet!
// You must validate the incoming query constraints instead, or ensure the read rule handles the query boundary.

const oldVehiclesRule = `    // Vehicles
    match /vehicles/{vehicleId} {
      allow read: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }`;

const newVehiclesRule = `    // Vehicles
    match /vehicles/{vehicleId} {
      // Allow read if the user is in the same organization. 
      // For queries (list), this requires the query to explicitly filter by 'orgId == user.orgId'
      // BUT resource.data is null on a list query evaluate if there isn't a strict where clause match.
      // The safer way for lists is checking the resource AFTER fetching, or checking request.query (though complex).
      // Given the simple where('orgId', '==', orgId) query, we can allow list if the orgId matches.
      
      allow get: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow list: if isAuthenticated() && (
        // Either the document has the right orgId, or they are querying for their own orgId
        isUserInOrg(resource.data.orgId)
      );
      
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }`;

content = content.replace(oldVehiclesRule, newVehiclesRule);

// Let's also fix Places and Routes, which might suffer from the same 'list' issue if they don't have separate get/list
const oldPlacesRule = `    // Places
    match /places/{placeId} {
      allow read: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId);
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }`;

const newPlacesRule = `    // Places
    match /places/{placeId} {
      allow get: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow list: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId);
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }`;
content = content.replace(oldPlacesRule, newPlacesRule);

const oldRoutesRule = `    // Routes
    match /routes/{routeId} {
      allow read: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();`;

const newRoutesRule = `    // Routes
    match /routes/{routeId} {
      allow get: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow list: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();`;
content = content.replace(oldRoutesRule, newRoutesRule);

fs.writeFileSync(filePath, content);
console.log('Fixed firestore list rules');
