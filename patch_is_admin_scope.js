const fs = require('fs');
const path = './src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// The `isAdmin` variable is declared later in the file.
// We can move `const isAdmin = userData.role === 'admin';` to before the useEffect, or simply use `userData?.role === 'admin'`

code = code.replace(/isAdmin\]\);/g, `userData?.role === 'admin']);`);
code = code.replace(/if \(userData\?\.orgId && isAdmin\)/g, `if (userData?.orgId && userData.role === 'admin')`);

fs.writeFileSync(path, code);
console.log("Fixed isAdmin scope");