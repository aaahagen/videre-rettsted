const fs = require('fs');
let content = fs.readFileSync('src/components/places/place-form.tsx', 'utf-8');

content = content.replace("const userDoc = await firebaseDB.getUser(authUser.uid);", "const userDoc = await firebaseDB.getUser(authUser!.uid);");

fs.writeFileSync('src/components/places/place-form.tsx', content);
