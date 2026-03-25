const fs = require('fs');

const file = 'src/app/dashboard/profile/picture/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The User type in types.ts doesn't have an avatarUrl property, but UserProfile has photoURL
content = content.replace(
  /await firebaseDB\.updateUser\(currentUser\.uid, \{ avatarUrl: url \}\);/g,
  `await firebaseDB.updateUser(currentUser.uid, { photoURL: url } as any);`
);

fs.writeFileSync(file, content);
