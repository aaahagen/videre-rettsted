const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/places/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("import { useAuth }")) {
    content = content.replace(
        "import { User, Place, Organization } from '@/lib/types';",
        "import { User, Place, Organization } from '@/lib/types';\nimport { useAuth } from '@/components/auth-provider';"
    );
    fs.writeFileSync(filePath, content);
    console.log('Fixed missing useAuth import');
} else {
    console.log('useAuth import already exists');
}
