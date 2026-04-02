const fs = require('fs');
const file = 'firestore.rules';
let content = fs.readFileSync(file, 'utf8');

const targetRules = `    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() && (
        request.auth.uid == userId || 
        isUserInOrg(resource.data.orgId)
      );
      
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && (
        (request.auth.uid == userId && 
         request.resource.data.role == resource.data.role && 
         request.resource.data.orgId == resource.data.orgId) || 
        (isAdmin() && isUserInOrg(resource.data.orgId))
      );
      allow delete: if isAuthenticated() && isAdmin() && isUserInOrg(resource.data.orgId);
    }`;

const newRules = `    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && (
        (request.auth.uid == userId && 
         request.resource.data.role == resource.data.role && 
         request.resource.data.orgId == resource.data.orgId) || 
        (isAdmin() && isUserInOrg(resource.data.orgId))
      );
      allow delete: if isAuthenticated() && isAdmin() && isUserInOrg(resource.data.orgId);
    }`;

content = content.replace(targetRules, newRules);
fs.writeFileSync(file, content);
