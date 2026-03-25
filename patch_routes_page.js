const fs = require('fs');
const file = 'src/app/dashboard/routes/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add users state to route listing
content = content.replace(
  /  const \[routes, setRoutes\] = useState<Route\[\]>\(\[\]\);/g,
  `  const [routes, setRoutes] = useState<Route[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);`
);

content = content.replace(
  /        if \(userDoc\?\.orgId\) \{\n          firebaseDB\.getRoutes\(userDoc\.orgId\)\.then\(setRoutes\);\n        \}/g,
  `        if (userDoc?.orgId) {
          firebaseDB.getRoutes(userDoc.orgId).then(setRoutes);
          firebaseDB.getUsers(userDoc.orgId).then(setOrganizationUsers);
        }`
);

// Add driver badge to the card
content = content.replace(
  /              <CardHeader>\n                <CardTitle className="text-xl">\{route\.name\}<\/CardTitle>\n              <\/CardHeader>\n              <CardContent>\n                <p className="text-muted-foreground">\n                  \{route\.places\?\.length \|\| 0\} stopp\n                <\/p>/g,
  `              <CardHeader>
                <CardTitle className="text-xl">{route.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                   <p className="text-sm font-medium">{route.places?.length || 0} stopp</p>
                </div>
                {route.driverId ? (
                   <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {organizationUsers.find(u => u.id === route.driverId)?.name || 'Ukjent sjåfør'}
                   </div>
                ) : (
                   <div className="flex items-center gap-2 text-sm text-slate-400 italic">
                      Ikke tildelt sjåfør
                   </div>
                )}`
);

fs.writeFileSync(file, content);
