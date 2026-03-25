const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\[user, routeId, toast\]\);/g,
  `[user, routeId, toast, debouncedCalculateDistance]);`
);

fs.writeFileSync(file, content);
