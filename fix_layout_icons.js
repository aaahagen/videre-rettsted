const fs = require('fs');
const path = require('path');

let layoutPath = path.join(__dirname, 'src/app/dashboard/layout.tsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

// Add UserPlus and Truck to lucide-react imports
layoutCode = layoutCode.replace(
    "import { FilePlus2, Search, X, RefreshCw, Route as RouteIcon, Activity } from 'lucide-react';",
    "import { FilePlus2, Search, X, RefreshCw, Route as RouteIcon, Activity, UserPlus, Truck } from 'lucide-react';"
);

// Update logic for desktop button icon
layoutCode = layoutCode.replace(
    "{contextName === 'Ruter' ? <RouteIcon className=\"mr-2 h-4 w-4\" /> : <FilePlus2 className=\"mr-2 h-4 w-4\" />}",
    "{contextName === 'Ruter' ? <RouteIcon className=\"mr-2 h-4 w-4\" /> : contextName === 'Personell' ? <UserPlus className=\"mr-2 h-4 w-4\" /> : contextName === 'Kjøretøy' ? <Truck className=\"mr-2 h-4 w-4\" /> : <FilePlus2 className=\"mr-2 h-4 w-4\" />}"
);

// Update logic for mobile button icon
layoutCode = layoutCode.replace(
    "{contextName === 'Ruter' ? <RouteIcon className=\"h-5 w-5\" /> : <FilePlus2 className=\"h-5 w-5\" />}",
    "{contextName === 'Ruter' ? <RouteIcon className=\"h-5 w-5\" /> : contextName === 'Personell' ? <UserPlus className=\"h-5 w-5\" /> : contextName === 'Kjøretøy' ? <Truck className=\"h-5 w-5\" /> : <FilePlus2 className=\"h-5 w-5\" />}"
);

fs.writeFileSync(layoutPath, layoutCode);
