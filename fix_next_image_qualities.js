const fs = require('fs');
const file = 'next.config.ts';
let content = fs.readFileSync(file, 'utf8');

const targetImages = `  images: {
    remotePatterns: [`;

const newImages = `  images: {
    qualities: [25, 50, 75, 80, 100], // Explicitly defining qualities to prepare for Next.js 16
    remotePatterns: [`;

content = content.replace(targetImages, newImages);
fs.writeFileSync(file, content);
