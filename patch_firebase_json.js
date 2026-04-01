const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'firebase.json');
let content = fs.readFileSync(filePath, 'utf8');

// The error is because we added a new top-level collection 'vehicles' but didn't add it to firestore.rules
const newRules = `  "firestore": {
    "database": "(default)",
    "location": "nam5",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }`;

content = content.replace(/"firestore": \{[\s\S]*?\}/, newRules);

fs.writeFileSync(filePath, content);
console.log('Added storage configuration to firebase.json');
