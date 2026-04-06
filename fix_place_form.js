const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/places/place-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the creation payload
const oldCreatePayload = `             const newPlace = await firebaseDB.createPlace({
                 ...placeData,
                 createdBy: authUser.uid,
                 createdAt: new Date(),
             });`;

const newCreatePayload = `             const newPlace = await firebaseDB.createPlace({
                 ...placeData,
             });`;

content = content.replace(oldCreatePayload, newCreatePayload);

fs.writeFileSync(filePath, content);
console.log('Fixed place form creation payload');
