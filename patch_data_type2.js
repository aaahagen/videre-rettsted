const fs = require('fs');

const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /images\?: \{ url: string; description: string; uploadedAt\?: any \}\[\];/g,
  `images?: { url: string; description?: string; uploadedAt?: any }[];`
);

fs.writeFileSync(file, content);
