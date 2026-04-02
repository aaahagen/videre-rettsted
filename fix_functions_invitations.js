const fs = require('fs');
const path = require('path');

let invPath = path.join(__dirname, 'functions/src/invitations.ts');
let invCode = fs.readFileSync(invPath, 'utf8');

const oldUserCreation = `const userRef = db.collection("users").doc(uid);
        batch.set(userRef, {
            name: name,
            email: email,
            orgId: orgId,
            role: role,
            favorites: [],
            status: "active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });`;

const newUserCreation = `const userRef = db.collection("users").doc(uid);
        
        const userData: any = {
            name: name,
            email: email,
            orgId: orgId,
            role: role,
            favorites: [],
            status: "active",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (role === 'contractor') {
            userData.employmentType = 'external';
        }

        batch.set(userRef, userData);`;

invCode = invCode.replace(oldUserCreation, newUserCreation);

fs.writeFileSync(invPath, invCode);
