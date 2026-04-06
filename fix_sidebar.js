const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/layout/sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldNav = `  { href: '/dashboard', icon: Home, label: 'Leveringssteder' },
  { href: '/dashboard/new', icon: PlusCircle, label: 'Nytt sted' },`;

const newNav = `  { href: '/dashboard', icon: Home, label: 'Oversikt' },
  { href: '/dashboard/places', icon: MapPin, label: 'Leveringssteder' },
  { href: '/dashboard/new', icon: PlusCircle, label: 'Nytt sted' },`;

content = content.replace(oldNav, newNav);

// Add MapPin to lucide-react imports if it's missing (it's actually there in my head but I should check)
// Looking at the previous cat output, MapPin is NOT in the sidebar imports.
content = content.replace("Scale,", "Scale, MapPin,");

fs.writeFileSync(filePath, content);
console.log('Updated Sidebar navigation');
