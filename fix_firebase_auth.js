const fs = require('fs');
const path = require('path');

let authPath = path.join(__dirname, 'src/lib/firebase/auth.ts');
let authCode = fs.readFileSync(authPath, 'utf8');

authCode = authCode.replace(
    "async inviteUser(email, role, name) {",
    "async inviteUser(email: string, role: 'driver' | 'admin' | 'contractor', name?: string) {"
);

fs.writeFileSync(authPath, authCode);
