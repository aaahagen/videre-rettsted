const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// I need to import the Plus icon from lucide-react
const targetImport = `import { Loader2, Upload, X, FileText } from 'lucide-react';`;
const newImport = `import { Loader2, Upload, X, FileText, Plus } from 'lucide-react';`;

content = content.replace(targetImport, newImport);

fs.writeFileSync(file, content);
