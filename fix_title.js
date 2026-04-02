const fs = require('fs');
const file = 'src/app/dashboard/messages/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<CheckCheck className="h-3 w-3 text-blue-500" title="Lest" \/>/g, '<span title="Lest"><CheckCheck className="h-3 w-3 text-blue-500" /></span>');
content = content.replace(/<Check className="h-3 w-3 text-slate-400" title="Levert" \/>/g, '<span title="Levert"><Check className="h-3 w-3 text-slate-400" /></span>');

fs.writeFileSync(file, content);
