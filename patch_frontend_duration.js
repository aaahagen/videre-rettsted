const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/routes/[id]/page.tsx', 'utf8');

// Add duration state
content = content.replace(
  /const \[distance, setDistance\] = useState\('N\/A'\);/g,
  `const [distance, setDistance] = useState('N/A');
  const [duration, setDuration] = useState('N/A');`
);

content = content.replace(
  /import \{ Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft \} from 'lucide-react';/g,
  `import { Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft, Clock, Car } from 'lucide-react';`
);

content = content.replace(
  /        if \(places\.length < 2\) \{\n          setDistance\('N\/A'\);\n          return;\n        \}/g,
  `        if (places.length < 2) {
          setDistance('N/A');
          setDuration('N/A');
          return;
        }`
);

content = content.replace(
  /          const data = result\.data as \{ distance: number, waypointOrder: number\[\] \};\n          setDistance\(\`\$\{data\.distance\.toFixed\(1\)\} km\`\);/g,
  `          const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
          setDistance(\`\${data.distance.toFixed(1)} km\`);
          
          if (data.duration) {
            const hours = Math.floor(data.duration / 3600);
            const minutes = Math.floor((data.duration % 3600) / 60);
            if (hours > 0) {
              setDuration(\`\${hours} t \${minutes} min\`);
            } else {
              setDuration(\`\${minutes} min\`);
            }
          } else {
            setDuration('N/A');
          }`
);

content = content.replace(
  /      const data = result\.data as \{ distance: number, waypointOrder: number\[\] \};\n      \n      setDistance\(\`\$\{data\.distance\.toFixed\(1\)\} km\`\);/g,
  `      const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
      
      setDistance(\`\${data.distance.toFixed(1)} km\`);
      if (data.duration) {
        const hours = Math.floor(data.duration / 3600);
        const minutes = Math.floor((data.duration % 3600) / 60);
        if (hours > 0) {
          setDuration(\`\${hours} t \${minutes} min\`);
        } else {
          setDuration(\`\${minutes} min\`);
        }
      }`
);

// Completely rewrite the UI Layout
const newLayout = `
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-2">
        <ChevronLeft className="h-4 w-4" />
        <Link href="/dashboard/routes" className="text-sm font-medium">Tilbake til Ruter</Link>
      </div>

      {/* Top Box: Route Info */}
      <Card className="border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                <RouteIcon className="h-8 w-8 text-primary" />
              </div>
              <Input 
                className="text-3xl font-bold h-auto py-2 px-3 bg-white/50 border-slate-200 hover:border-slate-300 focus:bg-white shadow-sm" 
                value={route.name} 
                onChange={(e) => setRoute({...route, name: e.target.value})}
                placeholder="Navn på rute..."
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stopp</span>
                  <span className="font-bold text-lg">{routePlaces.length}</span>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Distanse</span>
                  {isCalculating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
                  ) : (
                    <span className={\`font-bold text-lg \${distance === 'Error' ? 'text-destructive' : ''}\`}>
                      {distance === 'Error' ? 'Feil' : distance}
                    </span>
                  )}
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Tid</span>
                  {isCalculating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
                  ) : (
                    <span className="font-bold text-lg">{duration}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Box: Driver Assignment */}
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
              {userData?.role === 'admin' ? (
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
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-md font-medium border border-slate-200">
                    {organizationUsers.find(u => u.id === route.driverId)?.name || 'Ikke tildelt'}
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Places Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Add Places */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Legg til Stopp</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleAddPlace}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Søk og velg et sted..." />
                </SelectTrigger>
                <SelectContent>
                  {allPlaces.map(place => (
                    <SelectItem key={place.id} value={place.id} disabled={routePlaces.some(p => p.id === place.id)}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {/* Action Buttons Moved Here for better flow */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
             <CardContent className="p-6 space-y-4">
                {routePlaces.length > 2 && (
                   <Button 
                     variant="outline" 
                     className="w-full shadow-sm font-semibold h-12 bg-white"
                     onClick={handleOptimizeRoute} 
                     disabled={isOptimizing || isSaving}
                   >
                     {isOptimizing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5 text-indigo-500" />}
                     Optimer Rekkefølge
                   </Button>
                )}
                <Button 
                  className="w-full shadow-sm font-bold h-12 text-md"
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Lagre Rute
                </Button>
             </CardContent>
          </Card>
        </div>
        
        {/* Right Col: Current Route */}
        <Card className="lg:col-span-7 border-slate-200 shadow-sm flex flex-col h-[600px]">
          <CardHeader className="pb-4 shrink-0 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Rekkefølge</CardTitle>
              <span className="text-xs text-muted-foreground">Dra og slipp for å endre</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            {routePlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 p-8">
                 <MapPin className="h-12 w-12 text-slate-200" />
                 <p className="text-center">Ingen stopp er lagt til enda. <br/>Bruk menyen til venstre for å bygge ruten.</p>
              </div>
            ) : (
              <div className="p-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={routePlaces.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-3">
                    {routePlaces.map((place, index) => (
                      <SortableItem key={place.id} id={place.id}>
                        <li className="flex-grow flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-primary/50 transition-colors group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="flex items-center justify-center bg-slate-100 rounded-full h-7 w-7 text-xs font-bold text-slate-600 shrink-0 shadow-inner">
                              {index + 1}
                            </span>
                            <span className="font-semibold text-slate-700 truncate">{place.name}</span>
                          </div>
                          <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-slate-300 hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                             onClick={() => handleRemovePlace(place.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      </SortableItem>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );`;

// We will split the file on the "return (" to replace the entire bottom part safely
const parts = content.split(/  return \(\n    <div className="container mx-auto/);
if (parts.length === 2) {
   const newFileContent = parts[0] + newLayout;
   fs.writeFileSync('src/app/dashboard/routes/[id]/page.tsx', newFileContent);
}

