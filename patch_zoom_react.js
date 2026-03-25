const fs = require('fs');
const file = 'src/app/dashboard/places/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace <React.Fragment> with <>
content = content.replace(
  /<React\.Fragment>/g,
  `<>`
);
content = content.replace(
  /<\/React\.Fragment>/g,
  `</>`
);

fs.writeFileSync(file, content);
