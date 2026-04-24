const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

if (!code.includes('CardDescription,')) {
    code = code.replace('CardTitle,', 'CardTitle, CardDescription,');
}

fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', code);
