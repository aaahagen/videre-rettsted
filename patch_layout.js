const fs = require('fs');
const file = 'src/app/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /manifest: '\/manifest\.json',/g,
  `// manifest: '/manifest.json',`
);

fs.writeFileSync(file, content);
