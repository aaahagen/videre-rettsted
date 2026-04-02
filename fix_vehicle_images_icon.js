const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// I need to import Star
const targetImport = `import { UploadCloud, Trash2, Loader2, FileText, Download, Plus } from 'lucide-react';`;
const newImport = `import { UploadCloud, Trash2, Loader2, FileText, Download, Plus, Star } from 'lucide-react';`;

content = content.replace(targetImport, newImport);

fs.writeFileSync(file, content);
