const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

content = content.replace(
  /                  <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt<\/SelectItem>\n                  \{organizationUsers\.map\(u => \(\n                    <SelectItem key=\{u\.id\} value=\{u\.id\}>\{u\.name \|\| u\.email\}<\/SelectItem>\n                  \)\)\}\n                <\/SelectContent>\n              <\/Select>\n              \) : \(\n                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-md font-medium border border-slate-200">\n                    \{organizationUsers\.find\(u => u\.id === route\.driverId\)\?\.name \|\| 'Ikke tildelt'\}\n                <\/div>\n              \)\}/g,
  `                  <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                  {organizationUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-md font-medium border border-slate-200">
                    {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name || 'Ukjent sjåfør') : 'Ikke tildelt'}
                </div>
              )}`
);

fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', content);
