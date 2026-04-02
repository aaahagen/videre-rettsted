const fs = require('fs');
const path = require('path');

let authPath = path.join(__dirname, 'src/lib/auth.ts');
let authCode = fs.readFileSync(authPath, 'utf8');

authCode = authCode.replace(
    "inviteUser(email: string, role: 'driver' | 'admin', name?: string): Promise<string>;",
    "inviteUser(email: string, role: 'driver' | 'admin' | 'contractor', name?: string): Promise<string>;"
);

fs.writeFileSync(authPath, authCode);

let fbAuthPath = path.join(__dirname, 'src/lib/firebase/auth.ts');
if (fs.existsSync(fbAuthPath)) {
    let fbAuthCode = fs.readFileSync(fbAuthPath, 'utf8');
    fbAuthCode = fbAuthCode.replace(
        "async inviteUser(email: string, role: 'driver' | 'admin', name?: string): Promise<string> {",
        "async inviteUser(email: string, role: 'driver' | 'admin' | 'contractor', name?: string): Promise<string> {"
    );
    fs.writeFileSync(fbAuthPath, fbAuthCode);
}
