const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/layout/sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('/dashboard/workforce')) {
    // Import Users icon
    content = content.replace(
        "import {\n  Clock, Star,\n  Truck,",
        "import {\n  Clock, Star,\n  Truck,\n  Users,"
    );

    // Add nav item
    const newNavItem = `  { href: '/dashboard/workforce', icon: Users, label: 'Personell', adminOnly: true },`;
    
    // Find the right place to insert (after Fleet)
    content = content.replace(
        "{ href: '/dashboard/fleet', icon: Truck, label: 'Kjøretøy', adminOnly: true },",
        "{ href: '/dashboard/fleet', icon: Truck, label: 'Kjøretøy', adminOnly: true },\n" + newNavItem
    );

    fs.writeFileSync(filePath, content);
    console.log('Added Workforce to sidebar');
} else {
    console.log('Workforce already in sidebar');
}
