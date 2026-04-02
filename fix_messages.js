const fs = require('fs');
const file = 'src/app/dashboard/messages/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetEffect = `  useEffect(() => {
    if (!dbUser?.orgId) return;

    // Fetch users for display names`;

const newEffect = `  useEffect(() => {
    if (!dbUser?.orgId || !dbUser?.id) return;

    // Fetch users for display names`;

content = content.replace(targetEffect, newEffect);

const targetFetch = `        if (docSnap.exists()) {
          setDbUser(docSnap.data() as User);`;

const newFetch = `        if (docSnap.exists()) {
          const data = docSnap.data();
          setDbUser({ ...data, id: docSnap.id } as User);`;

// Wait, I need to check where that is. It's in auth-provider.tsx.
fs.writeFileSync(file, content);

let authContent = fs.readFileSync('src/components/auth-provider.tsx', 'utf8');
authContent = authContent.replace('setDbUser(docSnap.data() as User);', 'setDbUser({ ...docSnap.data(), id: docSnap.id } as User);');
fs.writeFileSync('src/components/auth-provider.tsx', authContent);
