const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add userData state
content = content.replace(
  /  const \[user, loading, error\] = useAuthState\(auth\);\n  const \[route, setRoute\] = useState<Route \| null>\(null\);/g,
  `  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [route, setRoute] = useState<Route | null>(null);`
);

// Fetch userData
content = content.replace(
  /          const userDoc = await firebaseDB\.getUser\(user\.uid\);\n          if \(userDoc\?\.orgId\) \{/g,
  `          const userDoc = await firebaseDB.getUser(user.uid);
          if (userDoc) {
            setUserData(userDoc);
          }
          if (userDoc?.orgId) {`
);

// Restrict Select dropdown to admins
content = content.replace(
  /            <div className="mt-2 pl-14">\n              <Select /g,
  `            <div className="mt-2 pl-14">
              {userData?.role === 'admin' ? (
              <Select `
);

content = content.replace(
  /                <\/SelectContent>\n              <\/Select>\n            <\/div>/g,
  `                </SelectContent>
              </Select>
              ) : (
                route.driverId && (
                   <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {organizationUsers.find(u => u.id === route.driverId)?.name || 'Tildelt sjåfør'}
                   </div>
                )
              )}
            </div>`
);

fs.writeFileSync(file, content);
