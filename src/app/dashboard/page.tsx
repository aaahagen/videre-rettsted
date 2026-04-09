'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { Loader2, Route as RouteIcon, MessageSquare, MapPin, User as UserIcon, Shield } from 'lucide-react';
import { User, Route } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { doc, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useSearch } from '@/hooks/use-search';
import { TimeStampCard } from '@/components/workforce/time-stamp-card';
import Link from 'next/link';


import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { PendingInvitations } from '@/components/admin/pending-invitations';
import { DriverProfile, Route as RouteType, Place } from '@/lib/types';
import { getDriverStatus } from "@/lib/workforce-utils";
import { UserCheck, Activity, Palmtree, Coffee, Briefcase, Truck } from 'lucide-react';



export default function DashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [allRoutes, setAllRoutes] = useState<RouteType[]>([]);
  const [monitorStats, setMonitorStats] = useState({ total: 0, active: 0, finished: 0, totalPlaces: 0, completedPlaces: 0 });
  const [fleetStats, setFleetStats] = useState({ ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 });

  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const { setContext } = useSearch();
  const router = useRouter();

  useEffect(() => {
    setContext('Steder', '/dashboard/places');
  }, [setContext]);

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    }
  }, [authUser, loadingAuth, router]);

  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(doc(db, 'users', authUser.uid), (doc) => {
      if (doc.exists()) {
        setUserData({ ...doc.data(), id: doc.id } as User);
      }
    });
    return () => unsub();
  }, [authUser]);

  useEffect(() => {
    async function fetchActiveRoute() {
      if (userData?.id) {
        try {
          const q = query(
            collection(db, 'routes'),
            where('driverId', '==', userData.id),
            where('status', '==', 'active'),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setActiveRoute({ id: snap.docs[0].id, ...snap.docs[0].data() } as Route);
          }
        } catch (e) {
          console.error("Error fetching active route", e);
        } finally {
          setLoadingRoute(false);
        }
      }
    }
    if (userData?.id) {
      fetchActiveRoute();
    }
  }, [userData?.id]);

  
  useEffect(() => {
    if (userData?.orgId && userData.role === 'admin') {
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

      
      const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
        const newStats = { ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 };
        snapshot.forEach((doc) => {
           const v = doc.data();
           if (v.orgId === userData.orgId) {
               const statuses = v.currentStatuses || [];
               if (statuses.length === 0) {
                   if (v.status === 'active') newStats.ready++;
                   if (v.status === 'maintenance') newStats.workshop++;
               } else {
                   statuses.forEach((s: string) => {
                       if (newStats[s as keyof typeof newStats] !== undefined) {
                            newStats[s as keyof typeof newStats]++;
                       }
                   });
               }
           }
        });
        setFleetStats(newStats);
      });

      return () => {
        unsubRoutes();
        unsubVehicles();
      };
    }
  }, [userData?.orgId, userData?.role === 'admin']);

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

  if (loadingAuth || (loadingRoute && !userData)) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!authUser || !userData) return null;

  const isAdmin = userData.role === 'admin';

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {isAdmin ? (
        /* ADMIN VIEW */
        <div className="space-y-8 max-w-5xl mx-auto">
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <UserIcon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Personell</h2>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-blue-900">{workforceStats.working}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-blue-700 uppercase tracking-tighter">På jobb</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-red-900">{workforceStats.sick}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-red-700 uppercase tracking-tighter">Syk</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <Palmtree className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-green-900">{workforceStats.vacation}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-green-700 uppercase tracking-tighter">Ferie</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-slate-700">{workforceStats.off}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Fridag</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mb-1" />
                        <p className="text-lg sm:text-2xl font-bold text-amber-900">{workforceStats.contractors}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-amber-700 uppercase tracking-tighter">Innleid</p>
                    </div>
                </div>
            </div>

            
            {/* FLEET STATS */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <Truck className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Kjøretøypark</h2>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <p className="text-lg sm:text-2xl font-bold text-green-600">{fleetStats.ready}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Klar</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <p className="text-lg sm:text-2xl font-bold text-blue-600">{fleetStats.on_tour}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">På rute</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <p className="text-lg sm:text-2xl font-bold text-slate-600">{fleetStats.parked}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Parkert</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <p className="text-lg sm:text-2xl font-bold text-yellow-600">{fleetStats.observation}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Obs.</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <p className="text-lg sm:text-2xl font-bold text-orange-600">{fleetStats.pending_workshop}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Venter</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors">
                        <p className="text-lg sm:text-2xl font-bold text-red-600">{fleetStats.workshop}</p>
                        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter">Verksted</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <RouteIcon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Ruter & Stopp</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-3xl font-bold text-slate-900">{monitorStats.total}</span>
                    <span className="text-sm text-muted-foreground">Totale Ruter</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-100/50">
                    <span className="text-3xl font-bold text-blue-600">{monitorStats.active}</span>
                    <span className="text-sm text-blue-600/80">Aktive Ruter</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-100/50">
                    <span className="text-3xl font-bold text-green-600">{monitorStats.finished}</span>
                    <span className="text-sm text-green-600/80">Fullførte Ruter</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="text-3xl font-bold text-primary">{monitorStats.totalPlaces}</span>
                    <span className="text-sm text-primary/80">Totale Stopp</span>
                    </div>
                </div>
                
                <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Total Fremdrift for Dagen</span>
                    <span className="text-muted-foreground font-medium">{monitorStats.completedPlaces} / {monitorStats.totalPlaces} stopp fullført ({Math.round(overallProgress)}%)</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>
            </div>

            {userData.orgId && <AnalyticsDashboard orgId={userData.orgId} />}
            {userData.orgId && <PendingInvitations orgId={userData.orgId} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeStampCard user={userData} />
                
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                <RouteIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Operativ oversikt</h3>
                        </div>
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
        </div>
      ) : (
        /* DRIVER VIEW */
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        God dag, {userData.name.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 text-sm">Velkommen til ditt kontrollpanel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeStampCard user={userData} />
                
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <RouteIcon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900">Din Rute</h3>
                            </div>
                            {activeRoute && <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Aktiv</span>}
                        </div>

                        {activeRoute ? (
                            <div className="flex-1 space-y-4">
                                <div>
                                    <p className="text-lg font-bold text-slate-900">{activeRoute.name}</p>
                                    <p className="text-xs text-slate-500">{activeRoute.places.length} stopp i dag</p>
                                </div>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/routes/${activeRoute.id}`}>
                                        Åpne Rute
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                                <p className="text-slate-400 text-sm font-medium mb-4">Ingen rute tildelt i dag</p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/dashboard/routes">Se alle ruter</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/dashboard/places" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-lg transition-colors">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-primary">Steder</span>
                    </div>
                </Link>
                
                <Link href="/dashboard/messages" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-lg transition-colors">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-primary">Meldinger</span>
                    </div>
                </Link>

                <Link href="/dashboard/routes" className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-lg transition-colors">
                            <RouteIcon className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-primary">Alle Ruter</span>
                    </div>
                </Link>
            </div>
        </div>
      )}
    </div>
  );
}
