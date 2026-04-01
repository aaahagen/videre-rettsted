const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/routes/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    /<DialogContent>/,
    '<DialogContent aria-describedby={undefined}>'
);

fs.writeFileSync(filePath, content);
console.log('Fixed DialogContent warnings in routes/page.tsx');
