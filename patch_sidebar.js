const fs = require('fs');
const file = 'src/components/layout/sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetImport = `  ChevronDown
} from 'lucide-react';`;

const newImport = `  ChevronDown,
  MessageSquare
} from 'lucide-react';`;

content = content.replace(targetImport, newImport);

const targetNavItems = `const navItems = [
  { href: '/dashboard', icon: Home, label: 'Leveringssteder' },`;

const newNavItems = `const navItems = [
  { href: '/dashboard', icon: Home, label: 'Leveringssteder' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Meldinger' },`;

content = content.replace(targetNavItems, newNavItems);

fs.writeFileSync(file, content);
