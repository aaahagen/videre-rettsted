'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { Loader2, Route as RouteIcon, MessageSquare, MapPin, User as UserIcon, Shield } from 'lucide-react';
import { User, Route, WorkLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { doc, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useSearch } from '@/hooks/use-search';
import { TimeStampCard } from '@/components/workforce/time-stamp-card';
import Link from 'next/link';
import { NewestPlaceCard } from '@/components/places/newest-place-card';
import { cn } from '@/lib/utils';


import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { PendingInvitations } from '@/components/admin/pending-invitations';
import { DriverProfile, Route as RouteType, Place, Order, Manifest } from '@/lib/types';
import { getDriverStatus } from "@/lib/workforce-utils";
import { UserCheck, Activity, Palmtree, Coffee, Briefcase, Truck, Package, Clock, CheckCircle2, BarChart3, ArrowRight, LogIn, LogOut, Users2 } from 'lucide-react';



export default function DashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [allRoutes, setAllRoutes] = useState<RouteType[]>([]);
  const [monitorStats, setMonitorStats] = useState({ total: 0, active: 0, finished: 0, totalPlaces: 0, completedPlaces: 0 });
  const [fleetStats, setFleetStats] = useState({ ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, loaded: 0, delivered: 0, failed: 0 });
  const [manifestStats, setManifestStats] = useState({ totalManifests: 0, activeManifests: 0, totalKolli: 0, loadedKolli: 0 });
  const [todayWorkLogs, setTodayWorkLogs] = useState<WorkLog[]>([]);

  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [activeManifest, setActiveManifest] = useState<Manifest | null>(null);
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
    if (!userData?.orgId || !activeRoute?.id) return;
    const q = query(
      collection(db, 'organizations', userData.orgId, 'manifests'),
      where('routeId', '==', activeRoute.id),
      limit(1)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveManifest({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Manifest);
      } else {
        setActiveManifest(null);
      }
    });
    return () => unsub();
  }, [userData?.orgId, activeRoute?.id]);

  
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

      const unsubManifests = onSnapshot(collection(db, 'organizations', userData.orgId, 'manifests'), (snapshot) => {
        let totalManifests = 0;
        let activeManifests = 0;
        let totalKolli = 0;
        let loadedKolli = 0;

        snapshot.forEach((docSnap) => {
          totalManifests++;
          const manifest = docSnap.data() as Manifest;
          if (manifest.status === 'loading' || manifest.status === 'pending') activeManifests++;

          manifest.orders.forEach(item => {
            totalKolli += item.totalItems || 0;
            loadedKolli += item.loadedItems || 0;
          });
        });

        setManifestStats({ totalManifests, activeManifests, totalKolli, loadedKolli });
      });

      // Listen for today's workLogs
      const today = new Date().toISOString().split('T')[0];
      const qWorkLogs = query(
        collection(db, 'workLogs'), 
        where('orgId', '==', userData.orgId),
        where('actualPunchIn', '>=', today)
      );
      const unsubWorkLogs = onSnapshot(qWorkLogs, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkLog));
        setTodayWorkLogs(logs);
      });

      return () => {
        unsubRoutes();
        unsubVehicles();
        unsubOrders();
        unsubManifests();
        unsubWorkLogs();
      };
    }
  }, [userData?.orgId, userData?.role === 'admin']);

  const workforceStats = useMemo(() => {
        let working = 0;
        let sick = 0;
        let vacation = 0;
        let off = 0;
        let contractors = 0;
        let other = 0;

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
            else if (statusInfo.type === 'other') other++;
        });

        return { working, sick, vacation, off, contractors, other };
  }, [drivers]);

  const attendanceStats = useMemo(() => {
    const present = todayWorkLogs.filter(log => !log.actualPunchOut).length;
    const finished = todayWorkLogs.filter(log => log.actualPunchOut).length;
    const waiting = Math.max(0, workforceStats.working - present - finished);
    
    return { present, finished, waiting };
  }, [todayWorkLogs, workforceStats.working]);
  
  const overallProgress = monitorStats.totalPlaces > 0 ? (monitorStats.completedPlaces / monitorStats.totalPlaces) * 100 : 0;
  const manifestProgress = manifestStats.totalKolli > 0 ? (manifestStats.loadedKolli / manifestStats.totalKolli) * 100 : 0;

  let driverLoadedKolli = 0;
  let driverTotalKolli = 0;
  if (activeManifest) {
      activeManifest.orders.forEach(item => {
          driverTotalKolli += item.totalItems || 0;
          driverLoadedKolli += item.loadedItems || 0;
      });
  }
  const driverManifestProgress = driverTotalKolli > 0 ? (driverLoadedKolli / driverTotalKolli) * 100 : 0;

  if (loadingAuth || (loadingRoute && !userData)) {
    return <SplashScreen />;
  }

  if (!authUser || !userData) return null;

  const isAdmin = userData.role === 'admin';

  return (
    <div className={cn(
        "min-h-screen p-4 sm:p-6 lg:p-8 w-full",
        isAdmin ? "bg-slate-100/50" : "bg-background"
    )}>
      
      {isAdmin ? (
        
        /* ADMIN VIEW - Bento Box Layout */
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1600px] mx-auto">
            
            {/* MAIN CANVAS (Left - 66%) */}
            <div className="w-full lg:w-2/3 space-y-8">
                
                {/* 1. ROUTE PROGRESS (Hero Metric) */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden border-l-4 border-l-primary">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <RouteIcon className="h-5 w-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Operativ status</span>
                            </h2>
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-primary/20">Sanntid</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="flex flex-col items-start p-4 bg-slate-50/50 rounded-lg border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Totale Ruter</span>
                                <span className="text-3xl font-black text-slate-900">{monitorStats.total}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-blue-50/30 rounded-lg border border-blue-100/50 transition-all hover:bg-white hover:shadow-sm">
                                <span className="text-[10px] text-blue-600/80 font-bold uppercase tracking-tight mb-1">Aktive</span>
                                <span className="text-3xl font-black text-blue-600">{monitorStats.active}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-green-50/30 rounded-lg border border-green-100/50 transition-all hover:bg-white hover:shadow-sm">
                                <span className="text-[10px] text-green-700/80 font-bold uppercase tracking-tight mb-1">Fullførte</span>
                                <span className="text-3xl font-black text-green-600">{monitorStats.finished}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-primary/5 rounded-lg border border-primary/10 transition-all hover:bg-white hover:shadow-sm">
                                <span className="text-[10px] text-primary/80 font-bold uppercase tracking-tight mb-1">Totale Stopp</span>
                                <span className="text-3xl font-black text-primary">{monitorStats.totalPlaces}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Total Fremdrift</span>
                                    <div className="text-lg font-black text-slate-800">{Math.round(overallProgress)}% fullført</div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{monitorStats.completedPlaces} av {monitorStats.totalPlaces} leveringer</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${overallProgress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOGISTICS ROW (Lasterampe & Ordre side-by-side) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LASTERAMPE (Manifests) */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between border-l-4 border-l-indigo-600">
                        <div>
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-indigo-600" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Terminal</span>
                                </div>
                                <Link href="/dashboard/manifests" className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group">
                                    Gå til lasterampe <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="flex justify-between items-end mb-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Lastefremdrift</span>
                                    <div className="text-4xl font-black text-slate-800">{Math.round(manifestProgress)}%</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                                        {manifestStats.loadedKolli} / {manifestStats.totalKolli} kolli
                                    </span>
                                </div>
                            </div>
                            
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50 mb-8">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)]" 
                                    style={{ width: `${manifestProgress}%` }} 
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col transition-all hover:bg-white">
                                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Aktive planer</span>
                                <span className="text-xl font-black text-slate-800">{manifestStats.activeManifests}</span>
                            </div>
                            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col transition-all hover:bg-white">
                                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Totale planer</span>
                                <span className="text-xl font-black text-slate-800">{manifestStats.totalManifests}</span>
                            </div>
                        </div>
                    </div>

                    {/* ORDER STATS */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-l-4 border-l-indigo-400">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-indigo-500" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Ordrehåndtering</span>
                            </div>
                            <Link href="/dashboard/orders" className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group">
                                Se oversikt <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-start p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white transition-all">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mb-2">Totale Ordre</span>
                                <span className="text-2xl font-black text-slate-900">{orderStats.total}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-amber-50/30 rounded-xl border border-amber-100 hover:bg-white transition-all group">
                                <span className="text-[10px] text-amber-600 font-black uppercase tracking-tighter mb-2 flex items-center gap-1">
                                    <Clock className="h-3 w-3 group-hover:rotate-12 transition-transform"/> Venter
                                </span>
                                <span className="text-2xl font-black text-amber-600">{orderStats.pending}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-blue-50/30 rounded-xl border border-blue-100 hover:bg-white transition-all group">
                                <span className="text-[10px] text-blue-600 font-black uppercase tracking-tighter mb-2 flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3 group-hover:scale-110 transition-transform"/> Lastet
                                </span>
                                <span className="text-2xl font-black text-blue-600">{orderStats.loaded}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-green-50/30 rounded-xl border border-green-100 hover:bg-white transition-all group">
                                <span className="text-[10px] text-green-700 font-black uppercase tracking-tighter mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 group-hover:scale-110 transition-transform"/> Levert
                                </span>
                                <span className="text-2xl font-black text-green-600">{orderStats.delivered}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DENSE TELEMETRY ROW (Workforce & Fleet side-by-side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* WORKFORCE LIST */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col border-l-4 border-l-blue-600">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-blue-600" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Mannskap</span>
                            </div>
                            <Link href="/dashboard/workforce" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 flex items-center gap-1 group">
                                Se vaktplan <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="space-y-4 flex-1 flex flex-col justify-around">
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md"><UserCheck className="h-4 w-4"/></div>
                                    På jobb
                                </span>
                                <span className="text-lg font-black text-slate-900">{workforceStats.working}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md"><Briefcase className="h-4 w-4"/></div>
                                    Innleid
                                </span>
                                <span className="text-lg font-black text-slate-900">{workforceStats.contractors}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="p-1.5 bg-red-100 text-red-600 rounded-md"><Activity className="h-4 w-4"/></div>
                                    Sykemelding
                                </span>
                                <span className="text-lg font-black text-slate-900">{workforceStats.sick}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="p-1.5 bg-green-100 text-green-600 rounded-md"><Palmtree className="h-4 w-4"/></div>
                                    Ferie
                                </span>
                                <span className="text-lg font-black text-slate-900">{workforceStats.vacation}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md"><Shield className="h-4 w-4"/></div>
                                    Annet
                                </span>
                                <span className="text-lg font-black text-slate-900">{workforceStats.other}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 opacity-40">
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-3">
                                    <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md"><Coffee className="h-4 w-4"/></div>
                                    Fridag
                                </span>
                                <span className="text-lg font-black text-slate-500">{workforceStats.off}</span>
                            </div>
                        </div>
                    </div>

                    {/* FLEET LIST */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col border-l-4 border-l-slate-700">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-slate-700" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Bilpark</span>
                            </div>
                            <Link href="/dashboard/fleet" className="text-[10px] font-black uppercase text-slate-600 hover:text-slate-800 flex items-center gap-1 group">
                                Se kjøretøy <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="space-y-4 flex-1 flex flex-col justify-around">
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" /> 
                                    Operative biler
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.ready}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> 
                                    Biler på rute
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.on_tour}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]" /> 
                                    Venter verksted
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.pending_workshop}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" /> 
                                    På verksted
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.workshop}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 opacity-40">
                                <span className="text-sm font-bold text-slate-500 flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" /> 
                                    Parkert
                                </span>
                                <span className="text-lg font-black text-slate-500">{fleetStats.parked}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ACTION SIDEBAR (Right - 33%) */}
            <div className="w-full lg:w-1/3 space-y-8">
                {/* ATTENDANCE CARD */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm border-l-4 border-l-emerald-600">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Users2 className="h-5 w-5 text-emerald-600" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Oppmøtestatus</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-emerald-100">Live</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-white transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <LogIn className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-700">Til stede nå</span>
                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Stemplet inn</span>
                                </div>
                            </div>
                            <span className="text-3xl font-black text-emerald-600">{attendanceStats.present}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-white transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-700">Fullført vakt</span>
                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Ferdig for dagen</span>
                                </div>
                            </div>
                            <span className="text-3xl font-black text-blue-600">{attendanceStats.finished}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100 hover:bg-white transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-700">Venter på vakt</span>
                                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">Ikke kommet ennå</span>
                                </div>
                            </div>
                            <span className="text-3xl font-black text-amber-600">{attendanceStats.waiting}</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        <span>Dagens vaktplan</span>
                        <span className="text-slate-900">{workforceStats.working} personer</span>
                    </div>
                </div>

                <div className="space-y-8">
                    <TimeStampCard user={userData} />
                    {userData.orgId && <AnalyticsDashboard orgId={userData.orgId} />}
                    {userData.orgId && <NewestPlaceCard orgId={userData.orgId} />}
                </div>
            </div>
        </div>
      ) : (
        /* DRIVER VIEW */
        <div className="space-y-8 w-full max-w-[1200px] mx-auto">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <UserIcon className="h-7 w-7 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        God dag, {userData.name.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 font-medium italic">Velkommen til ditt kontrollpanel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TimeStampCard user={userData} />
                
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full border-l-4 border-l-blue-600">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <RouteIcon className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Aktiv Rute</span>
                        </div>
                        {activeRoute && <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">Live</span>}
                    </div>

                    {activeRoute ? (
                        <div className="flex-1 space-y-6">
                            <div>
                                <p className="text-xl font-black text-slate-900 leading-tight">{activeRoute.name}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mt-1">{activeRoute.places.length} leveringer i dag</p>
                            </div>

                            {activeManifest && (
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lasting</span>
                                        <span className="text-xs font-black text-slate-700 font-mono bg-white px-2 py-0.5 rounded border">{driverLoadedKolli} / {driverTotalKolli}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${driverManifestProgress}%` }} />
                                    </div>
                                    <div className="flex justify-center">
                                        {activeManifest.status === 'verified' ? (
                                            <span className="text-[10px] text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-200 font-black uppercase tracking-tighter flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5"/> Verifisert & Klar</span>
                                        ) : activeManifest.status === 'loading' ? (
                                            <span className="text-[10px] text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 font-black uppercase tracking-tighter flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin"/> Laster...</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 bg-slate-200 px-3 py-1 rounded-full border border-slate-300 font-black uppercase tracking-tighter flex items-center gap-1.5"><Clock className="h-3.5 w-3.5"/> Venter på lasting</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button asChild size="lg" className="w-full font-black uppercase tracking-widest h-12 shadow-lg shadow-primary/20">
                                <Link href={`/dashboard/routes/${activeRoute.id}`}>
                                    Åpne Kontrollpanel
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                            <div className="p-4 bg-slate-50 rounded-full mb-4">
                                <RouteIcon className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-tight mb-6">Ingen planlagt rute</p>
                            <Button variant="outline" size="sm" asChild className="font-black uppercase tracking-tighter">
                                <Link href="/dashboard/routes">Se alle ruter</Link>
                            </Button>
                        </div>
                    )}
                </div>
                {userData.orgId && <NewestPlaceCard orgId={userData.orgId} />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Link href="/dashboard/places" className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary transition-all hover:shadow-md border-b-4 border-b-slate-200 hover:border-b-primary">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-xl transition-all group-hover:scale-110">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 group-hover:text-primary transition-colors uppercase tracking-tight text-sm">Kart & Register</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alle lokasjoner</span>
                        </div>
                    </div>
                </Link>
                
                <Link href="/dashboard/messages" className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary transition-all hover:shadow-md border-b-4 border-b-slate-200 hover:border-b-primary">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-xl transition-all group-hover:scale-110">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 group-hover:text-primary transition-colors uppercase tracking-tight text-sm">Kommunikasjon</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Meldinger</span>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/routes" className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary transition-all hover:shadow-md border-b-4 border-b-slate-200 hover:border-b-primary">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary rounded-xl transition-all group-hover:scale-110">
                            <RouteIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 group-hover:text-primary transition-colors uppercase tracking-tight text-sm">Ruteoversikt</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Planlagte turer</span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
      )}
    </div>
  );
}
