const fs = require('fs');
const content = fs.readFileSync('src/components/places/place-form.tsx', 'utf-8');
const patched = content.replace(
    /await firebaseDB.createPlace\(\{([\s\S]*?)\}\);\s*toast\(\{([\s\S]*?)\}\);\s*router.push\('\/dashboard\/places'\);/,
    `const newPlace = await firebaseDB.createPlace({$1});
            toast({$2});
            router.push(\`/dashboard/places/\${newPlace.id}\`);`
);
fs.writeFileSync('src/components/places/place-form.tsx', patched);
