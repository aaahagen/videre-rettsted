const fs = require('fs');
const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

const targetImages = `  images?: { url: string; description?: string; uploadedAt?: any }[];`;
const newImages = `  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];`;

content = content.replace(targetImages, newImages);
fs.writeFileSync(file, content);
