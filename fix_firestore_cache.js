const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/firebase/firebase.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the old imports
content = content.replace(
    "import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';",
    "import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';"
);

// 2. Remove the old initialization and enableIndexedDbPersistence call
const oldInitRegex = /const db = getFirestore\(app\);[\s\S]*?\}\);\n\}/;
const newInit = `const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});`;

if (content.match(oldInitRegex)) {
    content = content.replace(oldInitRegex, newInit);
} else {
    // Fallback if the regex doesn't match perfectly
    content = content.replace("const db = getFirestore(app);", newInit);
    content = content.replace(/\/\/ Enable offline persistence[\s\S]*?\}\);\n\}/, '');
}

fs.writeFileSync(filePath, content);
console.log('Updated Firestore initialization to use localCache');
