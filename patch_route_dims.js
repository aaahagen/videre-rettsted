const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Vehicle to state
const targetState = `  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);`;
const newState = `  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const [assignedVehicle, setAssignedVehicle] = useState<any>(null);`;
content = content.replace(targetState, newState);

// 2. Fetch vehicle if route has one
const targetFetch = `            const [routeData, placesData, usersData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
            ]);`;
const newFetch = `            const [routeData, placesData, usersData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
            ]);
            
            if (routeData && routeData.vehicleId) {
               try {
                   const vehicle = await firebaseDB.getVehicle(routeData.vehicleId);
                   setAssignedVehicle(vehicle);
               } catch (e) {
                   console.error("Failed to load vehicle", e);
               }
            }`;
content = content.replace(targetFetch, newFetch);

// 3. Render it next to distance in the top stats bar
const targetRender = `              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Distanse</span>`;

const newRender = `              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Distanse
                  </span>`;

content = content.replace(targetRender, newRender);

const targetRender2 = `              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
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
            </div>`;

const newRender2 = `              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
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
              
              {assignedVehicle && (assignedVehicle.dimensions?.height || assignedVehicle.dimensions?.width || assignedVehicle.dimensions?.length) && (
                <>
                  <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scaling text-amber-600"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M14 15H9v-5"/><path d="M16 3h5v5"/><path d="M21 3l-6 6"/></svg>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Kjøretøy: {assignedVehicle.name}</span>
                      <span className="font-semibold text-sm text-slate-800">
                        {assignedVehicle.dimensions.height && <span className="mr-2">H: {assignedVehicle.dimensions.height}m</span>}
                        {assignedVehicle.dimensions.width && <span className="mr-2">B: {assignedVehicle.dimensions.width}m</span>}
                        {assignedVehicle.dimensions.length && <span>L: {assignedVehicle.dimensions.length}m</span>}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>`;

content = content.replace(targetRender2, newRender2);

fs.writeFileSync(file, content);
