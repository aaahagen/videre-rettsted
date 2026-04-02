const fs = require('fs');
const file = 'src/app/dashboard/fleet/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('Scaling', 'Scale'); // The icon is actually named Scale in lucide-react
content = content.replace('<Scaling', '<Scale');

fs.writeFileSync(file, content);
