const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Just remove the icon
content = content.replace('<Scale className="h-3.5 w-3.5 shrink-0" />', '');

fs.writeFileSync(file, content);
