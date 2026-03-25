const fs = require('fs');
const file = 'src/app/dashboard/routes/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export default function RoutesPage\(\) \{\n  const \[user, loading, error\] = useAuthState\(auth\);\n  const \[routes, setRoutes\] = useState<Route\[\]>\(\[\]\);\n  const \[organizationUsers, setOrganizationUsers\] = useState<any\[\]>\(\[\]\);\n  const router = useRouter\(\);\n\n  useEffect\(\(\) => \{\n    if \(user\) \{\n      firebaseDB\.getUser\(user\.uid\)\.then\(userDoc => \{\n        if \(userDoc\?\.orgId\) \{\n          firebaseDB\.getRoutes\(userDoc\.orgId\)\.then\(setRoutes\);\n          firebaseDB\.getUsers\(userDoc\.orgId\)\.then\(setOrganizationUsers\);\n        \}\n      \}\);\n    \}\n  \}, \[user\]\);/g,
  `export default function RoutesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(userDoc => {
        if (userDoc) {
          setUserData(userDoc);
          if (userDoc.orgId) {
            firebaseDB.getRoutes(userDoc.orgId).then(setRoutes);
            firebaseDB.getUsers(userDoc.orgId).then(setOrganizationUsers);
          }
        }
      });
    }
  }, [user]);
  
  const displayedRoutes = routes.filter(route => {
    if (!userData) return false;
    if (userData.role === 'admin') return true; // Admins see all routes
    return route.driverId === userData.id; // Drivers only see their own routes
  });`
);

content = content.replace(
  /      \{routes\.length === 0 \? \(/g,
  `      {displayedRoutes.length === 0 ? (`
);

content = content.replace(
  /          \{routes\.map\(route => \(/g,
  `          {displayedRoutes.map(route => (`
);

content = content.replace(
  /        <h1 className="text-3xl font-bold">Ruter<\/h1>\n        <Button onClick=\{handleCreateRoute\}>\n          <Plus className="mr-2 h-4 w-4" \/>\n          Opprett Rute\n        <\/Button>/g,
  `        <h1 className="text-3xl font-bold">Ruter</h1>
        {userData?.role === 'admin' && (
          <Button onClick={handleCreateRoute}>
            <Plus className="mr-2 h-4 w-4" />
            Opprett Rute
          </Button>
        )}`
);

fs.writeFileSync(file, content);
