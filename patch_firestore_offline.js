const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/firebase/firebase.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('enableIndexedDbPersistence')) {
    // 1. Add import
    content = content.replace(
        "import { getFirestore } from 'firebase/firestore';",
        "import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';"
    );

    // 2. Add persistence initialization
    const persistenceCode = `
// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence.');
    }
  });
}
`;
    
    content = content.replace(
        "const db = getFirestore(app);",
        "const db = getFirestore(app);\n" + persistenceCode
    );

    fs.writeFileSync(filePath, content);
    console.log('Enabled Firestore Offline Persistence');
} else {
    console.log('Firestore Offline Persistence already enabled');
}
