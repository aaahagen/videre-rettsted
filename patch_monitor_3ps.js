const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/monitor/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the Search logic to include 3PS names
const searchLogicOld = `    const lowerQuery = searchQuery.toLowerCase();
    return routes.filter(route => {
      const routeNameMatch = route.name?.toLowerCase().includes(lowerQuery);
      const driverNameMatch = route.driverId && users[route.driverId]?.name?.toLowerCase().includes(lowerQuery);
      
      return routeNameMatch || driverNameMatch;
    });`;

const searchLogicNew = `    const lowerQuery = searchQuery.toLowerCase();
    return routes.filter(route => {
      const routeNameMatch = route.name?.toLowerCase().includes(lowerQuery);
      const driverNameMatch = route.driverId && users[route.driverId]?.name?.toLowerCase().includes(lowerQuery);
      const supplierMatch = route.isThirdParty && route.thirdPartySupplier?.toLowerCase().includes(lowerQuery);
      
      return routeNameMatch || driverNameMatch || supplierMatch;
    });`;

content = content.replace(searchLogicOld, searchLogicNew);

// 2. Update the variable that determines the display name
const driverNameLogicOld = `const driverName = route.driverId ? users[route.driverId]?.name || users[route.driverId]?.email || 'Ukjent sjåfør' : 'Ikke tildelt';`;

const driverNameLogicNew = `const driverName = route.isThirdParty 
                ? (route.thirdPartySupplier ? \`3PS: \${route.thirdPartySupplier}\` : '3PS (Ekstern)') 
                : (route.driverId ? users[route.driverId]?.name || users[route.driverId]?.email || 'Ukjent sjåfør' : 'Ikke tildelt');`;

content = content.replace(driverNameLogicOld, driverNameLogicNew);

// 3. Optional: hide vehicle info if it's a 3PS route, as we don't track their vehicles
const oldCardDetails = `<span className="flex items-center gap-1" title="Kjøretøy">
                             <Car className="h-4 w-4" /> {route.vehicleId ? (vehicles[route.vehicleId]?.name || 'Ukjent') : 'Ikke tildelt'}
                         </span>`;
                         
const newCardDetails = `{!route.isThirdParty && (
                             <span className="flex items-center gap-1" title="Kjøretøy">
                                 <Car className="h-4 w-4" /> {route.vehicleId ? (vehicles[route.vehicleId]?.name || 'Ukjent') : 'Ikke tildelt'}
                             </span>
                         )}`;
content = content.replace(oldCardDetails, newCardDetails);

fs.writeFileSync(filePath, content);
console.log('Updated monitor page to support 3PS display');
