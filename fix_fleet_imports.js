const fs = require('fs');
const path = require('path');

let fleetPath = path.join(__dirname, 'src/app/dashboard/fleet/page.tsx');
let fleetCode = fs.readFileSync(fleetPath, 'utf8');

// Update Card imports to include CardHeader and CardTitle
fleetCode = fleetCode.replace(
    "import { Card, CardContent } from '@/components/ui/card';",
    "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';"
);

fs.writeFileSync(fleetPath, fleetCode);
