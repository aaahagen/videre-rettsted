const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/routes/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// We need to add UI for 3PS toggle and input
const oldDriverSection = `{/* Driver Assignment - Only for Admins */}
      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h3 className="font-semibold text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Tildelt Sjåfør
               </h3>
               <p className="text-sm text-muted-foreground">Velg hvem som skal kjøre denne ruten.</p>
            </div>
            <div>
                <Select 
                  value={route.driverId || "unassigned"} 
                  onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}
                >
                  <SelectTrigger className="w-full sm:w-[300px] h-10 border-slate-200 shadow-sm">
                    <SelectValue placeholder="Velg sjåfør..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                    {organizationUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>
      )}`;

const newDriverSection = `{/* Driver Assignment - Only for Admins */}
      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-4 flex-1">
               <div>
                   <h3 className="font-semibold text-lg flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Rutetildeling
                   </h3>
                   <p className="text-sm text-muted-foreground">Velg hvem som skal kjøre denne ruten.</p>
               </div>
               
               <div className="flex items-center gap-2 mt-4">
                    <Switch 
                        id="is3ps" 
                        checked={route.isThirdParty || false} 
                        onCheckedChange={(val) => setRoute({...route, isThirdParty: val, driverId: val ? '' : route.driverId})}
                    />
                    <Label htmlFor="is3ps" className="cursor-pointer">Kjøres av Tredjepart (3PS)</Label>
               </div>
            </div>
            
            <div className="flex-1 w-full flex justify-end">
                {route.isThirdParty ? (
                    <div className="w-full sm:w-[300px] space-y-2">
                        <Label htmlFor="3ps-name" className="text-xs text-muted-foreground">Navn på transportør (3PS)</Label>
                        <Input 
                            id="3ps-name"
                            placeholder="F.eks. Bring, PostNord..." 
                            value={route.thirdPartySupplier || ''}
                            onChange={(e) => setRoute({...route, thirdPartySupplier: e.target.value})}
                            className="h-10 border-slate-200 shadow-sm"
                        />
                    </div>
                ) : (
                    <Select 
                      value={route.driverId || "unassigned"} 
                      onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}
                    >
                      <SelectTrigger className="w-full sm:w-[300px] h-10 border-slate-200 shadow-sm mt-6">
                        <SelectValue placeholder="Velg intern sjåfør..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                        {organizationUsers.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                )}
            </div>
          </CardContent>
        </Card>
      )}`;

content = content.replace(oldDriverSection, newDriverSection);

fs.writeFileSync(filePath, content);
console.log('Added 3PS toggle to route editor page');
