const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/places/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The safest way is to insert it right after another known good import at the top
const targetImport = "import { auth } from '@/lib/firebase/firebase';";
const newImport = "import { useAuth } from '@/components/auth-provider';";

if (!content.includes(newImport)) {
    content = content.replace(targetImport, targetImport + '\\n' + newImport);
    fs.writeFileSync(filePath, content);
    console.log('Successfully injected useAuth import');
}
