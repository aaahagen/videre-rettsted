const fs = require('fs');
const file = 'src/components/layout/sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetNavItems = `const navItems = [
  { href: '/dashboard', icon: Home, label: 'Leveringssteder' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Meldinger' },
  { href: '/dashboard/new', icon: PlusCircle, label: 'Nytt sted' },
  { href: '/dashboard/favorites', icon: Star, label: 'Favoritter' },
  { href: '/dashboard/routes', icon: Route, label: 'Ruter' },`;

const newNavItems = `const navItems = [
  { href: '/dashboard', icon: Home, label: 'Leveringssteder' },
  { href: '/dashboard/new', icon: PlusCircle, label: 'Nytt sted' },
  { href: '/dashboard/favorites', icon: Star, label: 'Favoritter' },
  { href: '/dashboard/routes', icon: Route, label: 'Ruter' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Meldinger' },`;

content = content.replace(targetNavItems, newNavItems);
fs.writeFileSync(file, content);
