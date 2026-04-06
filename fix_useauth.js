const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/places/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Insert after 'use client';
const newImport = "\nimport { useAuth } from '@/components/auth-provider';";
content = content.replace("'use client';", "'use client';" + newImport);

fs.writeFileSync(filePath, content);
console.log('Successfully injected useAuth import using correct path');
