const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/routes/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("import { Button } from\n./components/ui/button.;\nimport { cn } from \"@/lib/utils\";", "import { Button } from '@/components/ui/button';\nimport { cn } from '@/lib/utils';");

fs.writeFileSync(filePath, content);
