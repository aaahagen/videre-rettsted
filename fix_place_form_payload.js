const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/places/place-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /await firebaseDB\.createPlace\(\{\s*\.\.\.placeData,\s*createdBy: authUser\.uid,\s*createdAt: new Date\(\),\s*\}\);/g;

content = content.replace(regex, `await firebaseDB.createPlace({
                ...placeData,
            });`);

fs.writeFileSync(filePath, content);
console.log('Fixed place form creation payload manually');
