const fs = require('fs');
let code = fs.readFileSync('src/components/places/print-place.tsx', 'utf8');

code = code.replace(
  "import { MapPin, Clipboard, FileText, Tag, User, Info } from 'lucide-react';",
  "import { MapPin, Clipboard, FileText, Tag, User, Info, PhoneCall, Mail } from 'lucide-react';"
);

fs.writeFileSync('src/components/places/print-place.tsx', code);
