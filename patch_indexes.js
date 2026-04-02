const fs = require('fs');
const file = 'firestore.indexes.json';
let content = fs.readFileSync(file, 'utf8');

const targetIndexes = `"indexes": [`;

const newIndexes = `"indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "orgId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "ASCENDING"
        }
      ]
    },`;

content = content.replace(targetIndexes, newIndexes);
fs.writeFileSync(file, content);
