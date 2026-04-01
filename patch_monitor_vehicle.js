const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/monitor/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Vehicle to imports
content = content.replace(
    "import { type Route, type Place, type User } from '@/lib/types';",
    "import { type Route, type Place, type User, type Vehicle } from '@/lib/types';"
);

// 2. Add vehicles state
content = content.replace(
    "const [users, setUsers] = useState<Record<string, User>>({});",
    "const [users, setUsers] = useState<Record<string, User>>({});\n  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});"
);

// 3. Fetch vehicles in fetchStaticData
const oldFetch = `           const [fetchedPlaces, fetchedUsers] = await Promise.all([
               firebaseDB.getPlaces(userData.orgId),
               firebaseDB.getUsers(userData.orgId)
           ]);`;
           
const newFetch = `           const [fetchedPlaces, fetchedUsers, fetchedVehicles] = await Promise.all([
               firebaseDB.getPlaces(userData.orgId),
               firebaseDB.getUsers(userData.orgId),
               firebaseDB.getVehicles(userData.orgId)
           ]);`;
content = content.replace(oldFetch, newFetch);

const oldMaps = `           const usersMap: Record<string, User> = {};
           fetchedUsers.forEach(u => usersMap[u.id] = u);
           setUsers(usersMap);`;
           
const newMaps = `           const usersMap: Record<string, User> = {};
           fetchedUsers.forEach(u => usersMap[u.id] = u);
           setUsers(usersMap);
           
           const vehiclesMap: Record<string, Vehicle> = {};
           fetchedVehicles.forEach(v => vehiclesMap[v.id] = v);
           setVehicles(vehiclesMap);`;
content = content.replace(oldMaps, newMaps);

// 4. Update the Card rendering to show the vehicle
const oldCardDetails = `                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                         <span className="flex items-center gap-1"><Car className="h-4 w-4" /> {driverName}</span>
                         {route.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {route.duration}</span>}
                      </div>`;
                      
const newCardDetails = `                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                         <span className="flex items-center gap-1" title="Sjåfør">
                             <Users className="h-4 w-4" /> {driverName}
                         </span>
                         <span className="flex items-center gap-1" title="Kjøretøy">
                             <Car className="h-4 w-4" /> {route.vehicleId ? (vehicles[route.vehicleId]?.name || 'Ukjent') : 'Ikke tildelt'}
                         </span>
                         {route.duration && <span className="flex items-center gap-1" title="Estimert Kjøretid"><Clock className="h-4 w-4" /> {route.duration}</span>}
                      </div>`;
content = content.replace(oldCardDetails, newCardDetails);

// Add Users import
content = content.replace(
    "Loader2, Clock, MapPin, Car, CheckCircle2, Circle, AlertCircle, Route as RouteIcon, Activity, ChevronDown, ChevronUp, ExternalLink",
    "Loader2, Clock, MapPin, Car, CheckCircle2, Circle, AlertCircle, Route as RouteIcon, Activity, ChevronDown, ChevronUp, ExternalLink, Users"
);

fs.writeFileSync(filePath, content);
console.log('Added Vehicle to Monitor page');
