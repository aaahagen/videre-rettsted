const fs = require('fs');
const path = require('path');

let rulesPath = path.join(__dirname, 'firestore.rules');
let rulesCode = fs.readFileSync(rulesPath, 'utf8');

// Ensure contractor role is handled correctly in rules.
// Let's check how the rules handle roles.
// Often it's just checking if role == "admin" or just being authenticated.
// Let's assume contractors have similar read permissions to drivers but we need to make sure.

const isDriverFn = `function isDriver() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "driver";
    }`;

const isContractorFn = `function isContractor() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "contractor";
    }`;

if (rulesCode.includes("function isDriver()") && !rulesCode.includes("isContractor()")) {
    rulesCode = rulesCode.replace(isDriverFn, isDriverFn + "\n    " + isContractorFn);
    
    // Replace "isAdmin() || isDriver()" with "isAdmin() || isDriver() || isContractor()"
    rulesCode = rulesCode.replace(/isAdmin\(\) \|\| isDriver\(\)/g, "isAdmin() || isDriver() || isContractor()");
} else if (!rulesCode.includes("isContractor()")) {
    // If we only check for admin, then drivers and contractors might have the same fallback permissions
}

fs.writeFileSync(rulesPath, rulesCode);
