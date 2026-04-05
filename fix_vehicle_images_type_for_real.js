const fs = require('fs');
const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

// I need to use regex globally because User also has an images array that might be identical!
content = content.replace(/images\?: \{ url: string; description\?: string; uploadedAt\?: any \}\[\];/g, 'images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];');

fs.writeFileSync(file, content);
