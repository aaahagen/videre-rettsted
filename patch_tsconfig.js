const fs = require('fs');
const file = 'tsconfig.json';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /"exclude": \["node_modules"\]/g,
  `"exclude": ["node_modules", "functions"]`
);

fs.writeFileSync(file, content);
