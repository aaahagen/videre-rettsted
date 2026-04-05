const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Remove duplicate Briefcase
const importSearch = "ChevronUp, MapPin, Phone, AlertCircle, Heart, Baby, CalendarClock, StickyNote, Hash, Building2, UserCircle2, Briefcase, GraduationCap, Banknote, Landmark, BookOpenCheck, ShieldCheck } from 'lucide-react';";
const importReplacement = "ChevronUp, MapPin, Phone, AlertCircle, Heart, Baby, CalendarClock, StickyNote, Hash, Building2, UserCircle2, GraduationCap, Banknote, Landmark, BookOpenCheck, ShieldCheck } from 'lucide-react';";

content = content.replace(importSearch, importReplacement);

fs.writeFileSync(pagePath, content);
console.log("Fixed HR page imports");
