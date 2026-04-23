const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/places/[id]/page.tsx', 'utf8');

code = code.replace(
  "import { MapPin, Clock, Edit, FileText, ChevronLeft, Map, ExternalLink, Printer, Info, Navigation, Bookmark, BookmarkCheck } from 'lucide-react';",
  "import { MapPin, Clock, Edit, FileText, ChevronLeft, Map, ExternalLink, Printer, Info, Navigation, Bookmark, BookmarkCheck, PhoneCall, Mail } from 'lucide-react';"
);

fs.writeFileSync('src/app/dashboard/places/[id]/page.tsx', code);
