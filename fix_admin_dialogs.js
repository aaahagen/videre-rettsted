const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/admin/admin-content.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix DialogContent without Description or aria-describedby
content = content.replace(
    /<DialogContent className="sm:max-w-xl w-\[95vw\] rounded-xl max-h-\[90vh\] overflow-y-auto">/,
    '<DialogContent className="sm:max-w-xl w-[95vw] rounded-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>'
);

content = content.replace(
    /<DialogContent className="sm:max-w-md w-\[95vw\] rounded-xl">/g,
    '<DialogContent className="sm:max-w-md w-[95vw] rounded-xl" aria-describedby={undefined}>'
);

fs.writeFileSync(filePath, content);
console.log('Fixed DialogContent warnings in admin-content.tsx');
