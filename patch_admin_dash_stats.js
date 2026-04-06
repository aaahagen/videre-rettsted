const fs = require('fs');
const path = './src/app/dashboard/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// I need to add the imports for fetching drivers and routes, and displaying the stats.

const importsToAdd = `
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { PendingInvitations } from '@/components/admin/pending-invitations';
import { DriverProfile, Route as RouteType, Place } from '@/lib/types';
import { getDriverStatus } from "@/lib/workforce-utils";
import { UserCheck, Activity, Palmtree, Coffee, Briefcase } from 'lucide-react';
`;

code = code.replace(`import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';\nimport { PendingInvitations } from '@/components/admin/pending-invitations';`, importsToAdd);

// Add state for stats
const stateToAdd = `
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [allRoutes, setAllRoutes] = useState<RouteType[]>([]);
  const [monitorStats, setMonitorStats] = useState({ total: 0, active: 0, finished: 0, totalPlaces: 0, completedPlaces: 0 });
`;

code = code.replace(`const [userData, setUserData] = useState<User | null>(null);`, `const [userData, setUserData] = useState<User | null>(null);\n${stateToAdd}`);

// Add effects to fetch drivers and all routes for stats
const effectsToAdd = `
  useEffect(() => {
    if (userData?.orgId && isAdmin) {
      const fetchDrivers = async () => {
        try {
          const users = await firebaseDB.getUsers(userData.orgId!);
          setDrivers(users.filter(u => u.role === 'driver' || u.role === 'contractor') as DriverProfile[]);
        } catch (e) {
            console.error("Error fetching drivers", e);
        }
      };
      fetchDrivers();
      
      const q = query(collection(db, 'routes'), where('orgId', '==', userData.orgId));
      const unsubRoutes = onSnapshot(q, (snapshot) => {
        const routesData: RouteType[] = [];
        let total = 0;
        let active = 0;
        let finished = 0;
        let totalPlaces = 0;
        let completedPlaces = 0;

        snapshot.forEach((doc) => {
            const r = { id: doc.id, ...doc.data() } as RouteType;
            routesData.push(r);
            
            total++;
            const placesCount = r.places?.length || 0;
            let expectedItems = placesCount;
            if (r.prepTimeStart && r.prepTimeStart > 0) expectedItems++;
            if (r.prepTimeEnd && r.prepTimeEnd > 0) expectedItems++;
            if (r.breakTime && r.breakTime > 0) expectedItems++;
            if (r.fuelServiceTime && r.fuelServiceTime > 0) expectedItems++;
            
            const completedCount = r.completedStops?.length || 0;
            totalPlaces += placesCount;
            const currentCompletedPlaces = r.completedStops?.filter(stopId => stopId.startsWith('place_')).length || 0;
            completedPlaces += currentCompletedPlaces;

            if (expectedItems > 0 && completedCount >= expectedItems) {
                finished++;
            } else if (expectedItems > 0) {
                active++;
            }
        });
        
        setAllRoutes(routesData);
        setMonitorStats({ total, active, finished, totalPlaces, completedPlaces });
      });

      return () => unsubRoutes();
    }
  }, [userData?.orgId, isAdmin]);

  const workforceStats = useMemo(() => {
        let working = 0;
        let sick = 0;
        let vacation = 0;
        let off = 0;
        let contractors = 0;

        const today = new Date();

        drivers.forEach(driver => {
            if (driver.role === 'contractor' || driver.employmentType === 'external') {
                contractors++;
            }
            
            const statusInfo = getDriverStatus(driver, today);
            if (statusInfo.type === 'working') working++;
            else if (statusInfo.type === 'sick') sick++;
            else if (statusInfo.type === 'vacation') vacation++;
            else if (statusInfo.type === 'off') off++;
        });

        return { working, sick, vacation, off, contractors };
  }, [drivers]);
  
  const overallProgress = monitorStats.totalPlaces > 0 ? (monitorStats.completedPlaces / monitorStats.totalPlaces) * 100 : 0;
`;

code = code.replace(`if (loadingAuth || (loadingRoute && !userData)) {`, `${effectsToAdd}\n  if (loadingAuth || (loadingRoute && !userData)) {`);


// Inject UI
const uiToReplace = `        <div className="space-y-8 max-w-5xl mx-auto">
            {userData.orgId && <AnalyticsDashboard orgId={userData.orgId} />}
            {userData.orgId && <PendingInvitations orgId={userData.orgId} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeStampCard user={userData} />
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Operativ oversikt</h3>
                    <p className="text-slate-500 text-sm">
                        Bruk navigasjonen under for rask tilgang til operative verktøy.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/monitor">Overvåkning</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/routes">Alle Ruter</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>`;

const newUI = `        <div className="space-y-8 max-w-5xl mx-auto">
            
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <UserIcon className="h-6 w-6 text-primary" />
                    Personell
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-blue-900">{workforceStats.working}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-blue-700 uppercase tracking-tighter">På jobb</p>
                    </div>
                    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-red-900">{workforceStats.sick}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-red-700 uppercase tracking-tighter">Syk</p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-100 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <Palmtree className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-green-900">{workforceStats.vacation}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-green-700 uppercase tracking-tighter">Ferie</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-slate-700">{workforceStats.off}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Fridag</p>
                    </div>
                    <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-3 flex flex-col items-center justify-center text-center">
                        <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-amber-900">{workforceStats.contractors}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-amber-700 uppercase tracking-tighter">Innleid</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <RouteIcon className="h-6 w-6 text-primary" />
                    Dagens Status
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                        <span className="text-3xl font-bold text-slate-900">{monitorStats.total}</span>
                        <span className="text-sm text-muted-foreground">Totale Ruter</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                        <span className="text-3xl font-bold text-blue-600">{monitorStats.active}</span>
                        <span className="text-sm text-blue-600/80">Aktive Ruter</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                        <span className="text-3xl font-bold text-green-600">{monitorStats.finished}</span>
                        <span className="text-sm text-green-600/80">Fullførte Ruter</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                        <span className="text-3xl font-bold text-primary">{monitorStats.totalPlaces}</span>
                        <span className="text-sm text-primary/80">Totale Stopp</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">Total Fremdrift for Dagen</span>
                        <span className="text-muted-foreground">{monitorStats.completedPlaces} / {monitorStats.totalPlaces} stopp fullført ({Math.round(overallProgress)}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-primary transition-all duration-500" style={{ width: \`\${overallProgress}%\` }} />
                        </div>
                    </div>
                </div>
            </div>

            {userData.orgId && <AnalyticsDashboard orgId={userData.orgId} />}
            {userData.orgId && <PendingInvitations orgId={userData.orgId} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeStampCard user={userData} />
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Operativ oversikt</h3>
                    <p className="text-slate-500 text-sm">
                        Bruk navigasjonen under for rask tilgang til operative verktøy.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/monitor">Overvåkning</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/routes">Alle Ruter</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>`;

code = code.replace(uiToReplace, newUI);

// The useMemo hook was missing
code = code.replace(`import { useEffect, useState } from 'react';`, `import { useEffect, useState, useMemo } from 'react';`);

fs.writeFileSync(path, code);
console.log("Updated admin dashboard with stats");