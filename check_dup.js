const fs = require('fs');
const path = './src/app/dashboard/admin/admin-content.tsx';
let code = fs.readFileSync(path, 'utf8');

// I will find the first occurrence of the string and replace it, as we know the first one (around line 848) is the duplicate inside the "Opprett Ny Bruker" or somewhere else it shouldn't be. Actually, looking at the code around line 848... Wait, let me check the file content around those lines.
