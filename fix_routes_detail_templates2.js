const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetSave = `    if (!route) return;
    setIsSaving(true);
    try {
      const currentCompletedStops = Object.entries(completedStops)
        .filter(([_, isCompleted]) => isCompleted)
        .map(([id]) => id);
        
      const placeIds = routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!);

      const updatedRoute: Partial<Route> = {
        ...route,
        places: placeIds,
        startAddress,
        endAddress,
        notes: routeNotes,
        completedStops: currentCompletedStops,
        completedStopEvents: completedStopEvents,
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? undefined : duration,
        distanceString: distance === 'N/A' || distance === 'Error' ? undefined : distance,
      };`;

const newSave = `    if (!route) return;
    setIsSaving(true);
    try {
      const currentCompletedStops = Object.entries(completedStops)
        .filter(([_, isCompleted]) => isCompleted)
        .map(([id]) => id);
        
      const placeIds = routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!);

      const updatedRoute: Partial<Route> = {
        ...route,
        places: placeIds,
        startAddress,
        endAddress,
        notes: routeNotes,
        completedStops: currentCompletedStops,
        completedStopEvents: completedStopEvents,
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? undefined : duration,
        distanceString: distance === 'N/A' || distance === 'Error' ? undefined : distance,
      };
      
      // Prevent saving an active route if it was a template that we are now "starting"
      // Actually, if it's a template, maybe we shouldn't let them complete it.
      // We will handle "starting a template" by copying it to a new active route instead.
      `;

content = content.replace(targetSave, newSave);

const topHeaderPattern = `                 <CardTitle className="text-lg flex items-center gap-2">Rekkefølge {isEditMode && <Badge variant="outline" className="text-[10px] ml-2">Redigeringsmodus</Badge>}</CardTitle>
                 {isEditMode && <span className="text-xs text-muted-foreground mt-1 block">Dra og slipp for å endre rekkefølge</span>}
              </div>`;

const newTopHeader = `                 <CardTitle className="text-lg flex items-center gap-2">
                    Rekkefølge 
                    {isEditMode && <Badge variant="outline" className="text-[10px] ml-2">Redigeringsmodus</Badge>}
                    {route?.status === 'template' && <Badge variant="secondary" className="text-[10px] ml-2 bg-indigo-100 text-indigo-700">MAL</Badge>}
                 </CardTitle>
                 {isEditMode && <span className="text-xs text-muted-foreground mt-1 block">Dra og slipp for å endre rekkefølge</span>}
              </div>`;

content = content.replace(topHeaderPattern, newTopHeader);

const finishGuardPattern = `                  {/* Finish Route Button for Drivers */}
                  {!isAdmin && !isEditMode && routeItems.length > 0 && route?.status !== 'completed' && (`;

const newFinishGuardPattern = `                  {/* Finish Route Button for Drivers */}
                  {!isAdmin && !isEditMode && routeItems.length > 0 && route?.status !== 'completed' && route?.status !== 'template' && (`;

content = content.replace(finishGuardPattern, newFinishGuardPattern);

// If it's a template, show "Use Template" button for admins
const actionButtonsPattern = `                <div className="flex gap-4">
                  <Button 
                     variant="secondary"`;

const newActionButtonsPattern = `                {route?.status === 'template' ? (
                   <Button 
                     className="w-full shadow-sm font-bold h-12 text-md bg-indigo-600 hover:bg-indigo-700 text-white"
                     onClick={async () => {
                         if (!route) return;
                         setIsSaving(true);
                         try {
                           const placeIds = routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!);
                           const newRoute = await firebaseDB.createRoute({
                             name: \`Ny rute fra \${route.name}\`,
                             orgId: route.orgId,
                             status: 'active',
                             places: placeIds,
                             startAddress,
                             endAddress,
                             notes: routeNotes,
                             prepTimeStart,
                             prepTimeEnd,
                             breakTime,
                             fuelServiceTime,
                           });
                           toast({ title: 'Rute Opprettet', description: 'En ny aktiv rute ble opprettet fra malen.' });
                           router.push(\`/dashboard/routes/\${newRoute.id}\`);
                         } catch(e) {
                           toast({ title: 'Feil', description: 'Kunne ikke opprette rute fra mal', variant: 'destructive' });
                         } finally { setIsSaving(false); }
                     }} 
                     disabled={isSaving || isCalculating}
                  >
                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RouteIcon className="mr-2 h-5 w-5" />}
                     Opprett ny rute fra denne malen
                  </Button>
                ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                     variant="secondary"`;

content = content.replace(actionButtonsPattern, newActionButtonsPattern);

const closeDivPattern = `                  <Button 
                     className="w-2/3 shadow-sm font-bold h-12 text-md"
                     onClick={handleSave} 
                     disabled={isSaving || isCalculating}
                  >
                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Lagre Endringer
                  </Button>
                </div>
             </CardContent>`;

const newCloseDivPattern = `                  <Button 
                     className="w-full sm:w-2/3 shadow-sm font-bold h-12 text-md"
                     onClick={handleSave} 
                     disabled={isSaving || isCalculating}
                  >
                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Lagre Endringer
                  </Button>
                </div>
                )}
             </CardContent>`;

content = content.replace(closeDivPattern, newCloseDivPattern);
fs.writeFileSync(file, content);
