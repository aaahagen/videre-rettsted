const fs = require('fs');
const path = require('path');

const filesToFix = [
    {
        path: 'src/app/dashboard/places/[id]/page.tsx',
        regex: /<DialogContent className="max-w-\[95vw\] max-h-\[95vh\] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">/,
        replacement: '<DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center" aria-describedby={undefined}>'
    },
    {
        path: 'src/app/dashboard/places/[id]/page.tsx',
        regex: /<DialogContent>/,
        replacement: '<DialogContent aria-describedby={undefined}>'
    },
    {
        path: 'src/app/dashboard/fleet/page.tsx',
        regex: /<DialogContent className="max-w-2xl max-h-\[90vh\] overflow-y-auto">/,
        replacement: '<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>'
    }
];

filesToFix.forEach(fileData => {
    const fullPath = path.join(__dirname, fileData.path);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(fileData.regex, fileData.replacement);
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed ${fileData.path}`);
    }
});
