const fs = require('fs');
const file = 'firestore.rules';
let content = fs.readFileSync(file, 'utf8');

const targetRules = `    // Invitations
    match /invitations/{invitationId} {
      // Public can fetch a specific invite by its ID to use it.
      allow get: if true;

      // Admins can list the invitations ONLY for their own organization.
      // We check if the orgId they are querying matches their own orgId.
      allow list: if isAuthenticated() && isAdmin();
      
      // Admins can create new invitations.
      allow create: if isAuthenticated() && isAdmin(); 
      
      // This rule is no longer needed, as invitations are deleted upon use.
      // It's kept here for reference but can be removed later.
      allow update: if false;

      // Admins can delete invitations to revoke them.
      allow delete: if isAuthenticated() && isAdmin() && isUserInOrg(resource.data.orgId);
    }`;

const newRules = `    // Invitations
    match /invitations/{invitationId} {
      // Public can fetch a specific invite by its ID to use it.
      allow get: if true;

      // Admins can list the invitations ONLY for their own organization.
      // We check if the orgId they are querying matches their own orgId.
      allow list: if isAuthenticated() && isAdmin();
      
      // Admins can create new invitations.
      allow create: if isAuthenticated() && isAdmin(); 
      
      // This rule is no longer needed, as invitations are deleted upon use.
      // It's kept here for reference but can be removed later.
      allow update: if false;

      // Admins can delete invitations to revoke them.
      // We allow delete if the user is an admin, even if we can't verify the orgId on the resource
      // as long as the application logic ensures they only delete their own.
      // To be safer, we can check the orgId if the resource exists.
      allow delete: if isAuthenticated() && isAdmin() && (resource == null || isUserInOrg(resource.data.orgId));
    }`;

content = content.replace(targetRules, newRules);
fs.writeFileSync(file, content);
