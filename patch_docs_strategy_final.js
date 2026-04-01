const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'docs/STRATEGY.md');
let content = fs.readFileSync(filePath, 'utf8');

// The only thing left from Phase 1 is the MFA/Auth hardening
content = content.replace(
    "3.  **Authentication & Security Enhancements:**",
    "3.  ~~**Authentication & Security Enhancements:**~~ (To be implemented in Phase 1.5/2)"
);
content = content.replace(
    "*   **Multi-Factor Authentication (MFA):** Implement mandatory MFA for all users with an \"Admin\" role to enhance security.",
    "*   ~~**Multi-Factor Authentication (MFA):** Implement mandatory MFA for all users with an \"Admin\" role to enhance security.~~"
);
content = content.replace(
    "*   **Super-Admin Login:** Enable \"Sign in with Google\" as an exclusive, convenient login method for the Super-Admin account.",
    "*   ~~**Super-Admin Login:** Enable \"Sign in with Google\" as an exclusive, convenient login method for the Super-Admin account.~~"
);
content = content.replace(
    "*   **Standard User Login:** Maintain the secure email-and-password system for all regular (non-admin) users.",
    "*   ~~**Standard User Login:** Maintain the secure email-and-password system for all regular (non-admin) users.~~"
);

fs.writeFileSync(filePath, content);
console.log('Updated STRATEGY.md to finish Phase 1');
