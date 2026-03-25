const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /console\.error\('Detailed error calculating distance:', JSON\.stringify\(err\.details, null, 2\)\);/g,
  `console.error('Detailed error calculating distance:', err.details || err.message || err);`
);

content = content.replace(
  /description: err\.details\?\.error_message \|\| 'An unknown error occurred\.',/g,
  `description: err.details?.error_message || err.message || 'An unknown error occurred.',`
);


fs.writeFileSync(file, content);
