const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/monitor/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("import { Button }")) {
    content = content.replace(
        "import { Badge } from '@/components/ui/badge';",
        "import { Badge } from '@/components/ui/badge';\nimport { Button } from '@/components/ui/button';"
    );
    fs.writeFileSync(filePath, content);
    console.log('Added Button import');
}
