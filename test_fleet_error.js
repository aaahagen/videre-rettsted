const fs = require('fs');
const path = require('path');

let fleetPath = path.join(__dirname, 'src/app/dashboard/fleet/page.tsx');
let fleetCode = fs.readFileSync(fleetPath, 'utf8');

// The error is likely caused by searchQuery being undefined initially if the store hasn't initialized 
// OR because the `.toLowerCase()` is called on undefined values.

// Let's check the filter function
const badFilter = `    const filteredVehicles = vehicles.filter(v => 
        (v.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (v.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );`;

const safeSearchQuery = `    const safeQuery = (searchQuery || '').toLowerCase();
    const filteredVehicles = vehicles.filter(v => 
        (v.name?.toLowerCase().includes(safeQuery) || false) ||
        (v.registrationNumber?.toLowerCase().includes(safeQuery) || false)
    );`;

if (fleetCode.includes(badFilter)) {
    fleetCode = fleetCode.replace(badFilter, safeSearchQuery);
}

// Also check the SearchX import
if (!fleetCode.includes('SearchX')) {
    fleetCode = fleetCode.replace("import { Truck, Plus, Loader2, Edit, Trash2, FileText } from 'lucide-react';", "import { Truck, SearchX, Plus, Loader2, Edit, Trash2, FileText } from 'lucide-react';");
}


fs.writeFileSync(fleetPath, fleetCode);
