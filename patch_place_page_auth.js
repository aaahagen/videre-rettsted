const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/places/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useAuth import
content = content.replace(
    "import { User, Place, Organization } from '@/lib/types';",
    "import { User, Place, Organization } from '@/lib/types';\nimport { useAuth } from '@/components/auth-provider';"
);

// 2. Add useAuth hook
content = content.replace(
    'const { toast } = useToast();',
    'const { toast } = useToast();\n  const { dbUser } = useAuth();'
);

// 3. Wrap useEffect logic
content = content.replace(
    'if (place?.createdBy) {',
    'if (place?.createdBy && dbUser?.role === \'admin\') {'
);

// 4. Wrap UI element
const uiBlock = `<div className="flex items-center text-sm text-slate-600">
                  <UserIcon className="mr-3 h-4 w-4 text-primary" />
                  <span>Lagt til av: <span className="font-medium text-slate-900">{authorName || 'Laster...'}</span></span>
                </div>`;

const newUiBlock = `{dbUser?.role === 'admin' && authorName && (
                ${uiBlock}
                )}`;

content = content.replace(uiBlock, newUiBlock);

fs.writeFileSync(filePath, content);
console.log('Patched place details page with role-based author visibility');
