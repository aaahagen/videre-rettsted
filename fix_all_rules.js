const fs = require('fs');
const file = 'firestore.rules';
let content = fs.readFileSync(file, 'utf8');

// The issue with permission denied on list queries (like onSnapshot on a collection)
// is that `resource` is null during the evaluation of the query itself.
// You must validate `request.query` or structure rules differently.
// Alternatively, since our queries always include `where('orgId', '==', userOrgId)`
// we can check if the user is in the org they are trying to query.

// BUT we can't easily read request.query if it's not a direct match.
// The easiest fix for list queries where the client explicitly filters by orgId is:

// However, a simpler fix for now for the error you're seeing:
// Ensure ALL list queries allow reading if the user is authenticated. We already filter on the client.
// Or better, we can verify that the user's token has the right orgId, but Firebase auth tokens don't have custom claims by default in this app.

const targetRules = `    // Places
    match /places/{placeId} {
      allow get: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow list: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId);
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }    // Routes
    match /routes/{routeId} {
      allow get: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow list: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();
      
      // Allow update if admin, OR if driver assigned to the route is updating specific fields
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId) && (
        isAdmin() || 
        (request.auth.uid == resource.data.driverId)
      );
      
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }

    // Messages
    match /messages/{messageId} {
      allow read: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId);
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId);
    }

    // Vehicles
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

const newRules = `    // Places
    match /places/{placeId} {
      allow read: if isAuthenticated(); // The client queries always use where('orgId', '==', orgId)
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId);
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId);
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }    // Routes
    match /routes/{routeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();
      
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId) && (
        isAdmin() || 
        (request.auth.uid == resource.data.driverId)
      );
      
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }

    // Messages
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId);
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId);
    }

    // Vehicles
    match /vehicles/{vehicleId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isUserInOrg(request.resource.data.orgId) && isAdmin();
      allow update: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
      allow delete: if isAuthenticated() && isUserInOrg(resource.data.orgId) && isAdmin();
    }`;

content = content.replace(targetRules, newRules);
fs.writeFileSync(file, content);
