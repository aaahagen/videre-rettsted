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
import { DriverProfile, Route as RouteType, Place, Order } from '@/lib/types';
import { getDriverStatus } from "@/lib/workforce-utils";
import { UserCheck, Activity, Palmtree, Coffee, Briefcase, Truck, Package, Clock, CheckCircle2, BarChart3 } from 'lucide-react';



export default function DashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [allRoutes, setAllRoutes] = useState<RouteType[]>([]);
  const [monitorStats, setMonitorStats] = useState({ total: 0, active: 0, finished: 0, totalPlaces: 0, completedPlaces: 0 });
  const [fleetStats, setFleetStats] = useState({ ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, loaded: 0, delivered: 0, failed: 0 });

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
      
      const qRoutes = query(collection(db, 'routes'), where('orgId', '==', userData.orgId));
      const unsubRoutes = onSnapshot(qRoutes, (snapshot) => {
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

      const unsubOrders = onSnapshot(collection(db, 'organizations', userData.orgId, 'orders'), (snapshot) => {
          let total = 0;
          let pending = 0;
          let loaded = 0;
          let delivered = 0;
          let failed = 0;
          
          snapshot.forEach((doc) => {
              total++;
              const order = doc.data() as Order;
              if (order.status === 'pending') pending++;
              if (order.status === 'loaded') loaded++;
              if (order.status === 'delivered') delivered++;
              if (order.status === 'failed') failed++;
          });
          
          setOrderStats({ total, pending, loaded, delivered, failed });
      });

      return () => {
        unsubRoutes();
        unsubVehicles();
        unsubOrders();
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
        
        /* ADMIN VIEW - Bento Box Layout */
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
            
            {/* MAIN CANVAS (Left - 66%) */}
            <div className="w-full lg:w-2/3 space-y-6">
                
                {/* 1. ROUTE PROGRESS (Hero Metric) */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <RouteIcon className="h-5 w-5 text-primary" />
                                Ruter & Stopp
                            </h2>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">I dag</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="flex flex-col items-start p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-sm text-muted-foreground font-medium uppercase tracking-tighter">Totale Ruter</span>
                                <span className="text-3xl font-black text-slate-900">{monitorStats.total}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                <span className="text-sm text-blue-600/80 font-medium uppercase tracking-tighter">Aktive</span>
                                <span className="text-3xl font-black text-blue-600">{monitorStats.active}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-green-50/50 rounded-lg border border-green-100/50">
                                <span className="text-sm text-green-700/80 font-medium uppercase tracking-tighter">Fullførte</span>
                                <span className="text-3xl font-black text-green-600">{monitorStats.finished}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <span className="text-sm text-primary/80 font-medium uppercase tracking-tighter">Totale Stopp</span>
                                <span className="text-3xl font-black text-primary">{monitorStats.totalPlaces}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-slate-700">Total Fremdrift for Dagen</span>
                                <span className="text-muted-foreground font-bold">{monitorStats.completedPlaces} / {monitorStats.totalPlaces} stopp ({Math.round(overallProgress)}%)</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${overallProgress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ORDER STATS */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                        <Package className="h-5 w-5 text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-900">Ordrestatistikk</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col items-start p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-tighter flex items-center gap-1"><Package className="h-3 w-3"/> Totalt</span>
                            <span className="text-2xl font-black text-slate-900">{orderStats.total}</span>
                        </div>
                        <div className="flex flex-col items-start p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <span className="text-sm text-amber-600/80 font-medium uppercase tracking-tighter flex items-center gap-1"><Clock className="h-3 w-3"/> Venter</span>
                            <span className="text-2xl font-black text-amber-600">{orderStats.pending}</span>
                        </div>
                        <div className="flex flex-col items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <span className="text-sm text-blue-600/80 font-medium uppercase tracking-tighter flex items-center gap-1"><BarChart3 className="h-3 w-3"/> Lastet</span>
                            <span className="text-2xl font-black text-blue-600">{orderStats.loaded}</span>
                        </div>
                        <div className="flex flex-col items-start p-4 bg-green-50 rounded-lg border border-green-100">
                            <span className="text-sm text-green-700/80 font-medium uppercase tracking-tighter flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Levert</span>
                            <span className="text-2xl font-black text-green-600">{orderStats.delivered}</span>
                        </div>
                    </div>
                </div>

                {/* 2. DENSE TELEMETRY ROW (Workforce & Fleet side-by-side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* WORKFORCE LIST */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 shrink-0">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-slate-900">Personell</h3>
                        </div>
                        <div className="space-y-3 flex-1 flex flex-col justify-around">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><UserCheck className="h-4 w-4 text-blue-500"/> På jobb</span>
                                <span className="font-bold text-slate-900">{workforceStats.working}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><Briefcase className="h-4 w-4 text-amber-500"/> Innleid</span>
                                <span className="font-bold text-slate-900">{workforceStats.contractors}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><Activity className="h-4 w-4 text-red-500"/> Syk</span>
                                <span className="font-bold text-slate-900">{workforceStats.sick}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><Palmtree className="h-4 w-4 text-green-500"/> Ferie</span>
                                <span className="font-bold text-slate-900">{workforceStats.vacation}</span>
                            </div>
                            <div className="flex items-center justify-between opacity-50">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><Coffee className="h-4 w-4"/> Fridag</span>
                                <span className="font-bold text-slate-900">{workforceStats.off}</span>
                            </div>
                        </div>
                    </div>

                    {/* FLEET LIST */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 shrink-0">
                            <Truck className="h-5 w-5 text-slate-700" />
                            <h3 className="text-lg font-bold text-slate-900">Kjøretøypark</h3>
                        </div>
                        <div className="space-y-3 flex-1 flex flex-col justify-around">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Klar</span>
                                <span className="font-bold text-slate-900">{fleetStats.ready}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> På rute</span>
                                <span className="font-bold text-slate-900">{fleetStats.on_tour}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400" /> Venter verksted</span>
                                <span className="font-bold text-slate-900">{fleetStats.pending_workshop}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> På verksted</span>
                                <span className="font-bold text-slate-900">{fleetStats.workshop}</span>
                            </div>
                            <div className="flex items-center justify-between opacity-50">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300" /> Parkert</span>
                                <span className="font-bold text-slate-900">{fleetStats.parked}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {userData.orgId && <AnalyticsDashboard orgId={userData.orgId} />}
            </div>

            {/* ACTION SIDEBAR (Right - 33%) */}
            <div className="w-full lg:w-1/3 space-y-6">
                <TimeStampCard user={userData} />
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
