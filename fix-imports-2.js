const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

code = code.replace(
  "import { Map, ArrowLeft, Calendar, User as UserIcon, Tag, Navigation, Edit3, Loader2, Maximize2, X, Clipboard, FileText, Printer, Trash2, ImageOff, Info } from 'lucide-react';",
  "import { Map, ArrowLeft, Calendar, User as UserIcon, Tag, Navigation, Edit3, Loader2, Maximize2, X, Clipboard, FileText, Printer, Trash2, ImageOff, Info, PhoneCall, Mail } from 'lucide-react';"
);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
