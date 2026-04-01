const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/layout/sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('/dashboard/fleet')) {
    // Import Truck icon
    content = content.replace(
        "import {\n  Clock, Star,",
        "import {\n  Clock, Star,\n  Truck,"
    );

    // Add nav item
    const newNavItem = `  { href: '/dashboard/fleet', icon: Truck, label: 'Kjøretøy', adminOnly: true },`;
    
    // Find the right place to insert (after Routes)
    content = content.replace(
        "{ href: '/dashboard/routes', icon: Route, label: 'Ruter' },",
        "{ href: '/dashboard/routes', icon: Route, label: 'Ruter' },\n" + newNavItem
    );

    fs.writeFileSync(filePath, content);
    console.log('Added Fleet to sidebar');
} else {
    console.log('Fleet already in sidebar');
}
