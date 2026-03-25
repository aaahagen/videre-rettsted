const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /console\.error\('Detailed error calculating distance:', err\.details \|\| err\.message \|\| err\);/g,
  `console.error('Detailed error calculating distance:', err);`
);

fs.writeFileSync(file, content);
