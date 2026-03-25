const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add users to state
content = content.replace(
  /  const \[allPlaces, setAllPlaces\] = useState<Place\[\]>\(\[\]\);/g,
  `  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);`
);

// Fetch users in useEffect
content = content.replace(
  /            const \[routeData, placesData\] = await Promise\.all\(\[\n              firebaseDB\.getRoute\(routeId\),\n              firebaseDB\.getPlaces\(userDoc\.orgId\),\n            \]\);/g,
  `            const [routeData, placesData, usersData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
            ]);
            setOrganizationUsers(usersData);`
);

// Add the user selector UI
content = content.replace(
  /            <div className="flex flex-wrap items-center gap-4 text-sm px-2">/g,
  `            <div className="mt-2 pl-14">
              <Select 
                value={route.driverId || "unassigned"} 
                onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}
              >
                <SelectTrigger className="w-[280px] h-9 bg-background/50 backdrop-blur-sm border-slate-200 shadow-sm text-sm">
                  <SelectValue placeholder="Tildel til sjåfør..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                  {organizationUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm px-2 mt-4">`
);

fs.writeFileSync(file, content);
