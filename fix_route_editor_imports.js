const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/routes/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add Switch and Label imports
if (!content.includes("import { Switch }")) {
    content = content.replace(
        "import { Input } from '@/components/ui/input';",
        "import { Input } from '@/components/ui/input';\nimport { Switch } from '@/components/ui/switch';\nimport { Label } from '@/components/ui/label';"
    );
}

// Fix the implicit 'any' type on the onCheckedChange handler
content = content.replace(
    /onCheckedChange=\{\(val\) => setRoute\(\{\.\.\.route, isThirdParty: val, driverId: val \? '' : route\.driverId\}\)\}/,
    "onCheckedChange={(val: boolean) => setRoute({...route, isThirdParty: val, driverId: val ? '' : route.driverId})}"
);


fs.writeFileSync(filePath, content);
console.log('Fixed imports in route editor');
