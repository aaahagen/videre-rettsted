const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\[calculateDistanceFn, toast\]\s+\);/m,
  `[toast]
  );`
);

content = content.replace(
  /\[toast, debouncedCalculateDistance\]/m,
  `[toast]`
);


fs.writeFileSync(file, content);
