'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

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
import { NewestPlaceCard } from '@/components/places/newest-place-card';


import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { PendingInvitations } from '@/components/admin/pending-invitations';
import { DriverProfile, Route as RouteType, Place, Order, Manifest } from '@/lib/types';
import { getDriverStatus } from "@/lib/workforce-utils";
import { UserCheck, Activity, Palmtree, Coffee, Briefcase, Truck, Package, Clock, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';



export default function DashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [allRoutes, setAllRoutes] = useState<RouteType[]>([]);
  const [monitorStats, setMonitorStats] = useState({ total: 0, active: 0, finished: 0, totalPlaces: 0, completedPlaces: 0 });
  const [fleetStats, setFleetStats] = useState({ ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, loaded: 0, delivered: 0, failed: 0 });
  const [manifestStats, setManifestStats] = useState({ totalManifests: 0, activeManifests: 0, totalKolli: 0, loadedKolli: 0 });

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

      return () => {
        unsubRoutes();
        unsubVehicles();
        unsubOrders();
        unsubManifests();
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
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 w-full">
      
      {isAdmin ? (
        
        /* ADMIN VIEW - Bento Box Layout */
        <div className="flex flex-col lg:flex-row gap-6 w-full">
            
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

                {/* LOGISTICS ROW (Lasterampe & Ordre side-by-side) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LASTERAMPE (Manifests) */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-indigo-600" />
                                    Lasterampe
                                </h3>
                                <Link href="/dashboard/manifests" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group">
                                    Gå til <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="flex justify-between items-end mb-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Lastefremdrift</span>
                                    <div className="text-3xl font-black text-slate-800">{Math.round(manifestProgress)}%</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                        {manifestStats.loadedKolli} / {manifestStats.totalKolli} KOLli
                                    </span>
                                </div>
                            </div>
                            
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner mb-6">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                                    style={{ width: `${manifestProgress}%` }} 
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-500">Aktive planer</span>
                                <span className="text-lg font-black text-slate-800">{manifestStats.activeManifests}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-500">Totale planer</span>
                                <span className="text-lg font-black text-slate-800">{manifestStats.totalManifests}</span>
                            </div>
                        </div>
                    </div>

                    {/* ORDER STATS */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-indigo-600" />
                                Ordrestatistikk
                            </h3>
                            <Link href="/dashboard/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group">
                                Se ordre <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter flex items-center gap-1"> Totalt</span>
                                <span className="text-xl font-black text-slate-900">{orderStats.total}</span>
                            </div>
                            <div className="flex flex-col items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <span className="text-[10px] text-amber-600/80 font-bold uppercase tracking-tighter flex items-center gap-1"><Clock className="h-3 w-3"/> Venter</span>
                                <span className="text-xl font-black text-amber-600">{orderStats.pending}</span>
                            </div>
                            <div className="flex flex-col items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-[10px] text-blue-600/80 font-bold uppercase tracking-tighter flex items-center gap-1"><BarChart3 className="h-3 w-3"/> Lastet</span>
                                <span className="text-xl font-black text-blue-600">{orderStats.loaded}</span>
                            </div>
                            <div className="flex flex-col items-start p-3 bg-green-50 rounded-lg border border-green-100">
                                <span className="text-[10px] text-green-700/80 font-bold uppercase tracking-tighter flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Levert</span>
                                <span className="text-xl font-black text-green-600">{orderStats.delivered}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DENSE TELEMETRY ROW (Workforce & Fleet side-by-side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* WORKFORCE LIST */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-blue-600" />
                                Personell
                            </h3>
                            <Link href="/dashboard/workforce" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group">
                                Se plan <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
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
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2"><Shield className="h-4 w-4 text-purple-500"/> Annet</span>
                                <span className="font-bold text-slate-900">{workforceStats.other}</span>
                            </div>
                        </div>
                    </div>

                    {/* FLEET LIST */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3 shrink-0">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-slate-700" />
                                Kjøretøypark
                            </h3>
                            <Link href="/dashboard/fleet" className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1 group">
                                Se flåte <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
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

            </div>

            {/* ACTION SIDEBAR (Right - 33%) */}
            <div className="w-full lg:w-1/3 space-y-6">
                <TimeStampCard user={userData} />
                {userData.orgId && <AnalyticsDashboard orgId={userData.orgId} />}
                {userData.orgId && <NewestPlaceCard orgId={userData.orgId} />}
            </div>
        </div>
      ) : (
        /* DRIVER VIEW */
        <div className="space-y-8 w-full">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TimeStampCard user={userData} />
                
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

                            {activeManifest && (
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lastefremdrift</span>
                                        <span className="text-xs font-bold text-slate-700 font-mono">{driverLoadedKolli} / {driverTotalKolli}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${driverManifestProgress}%` }} />
                                    </div>
                                    <div>
                                        {activeManifest.status === 'verified' ? (
                                            <span className="text-[10px] text-green-700 bg-green-100 px-2 py-1 rounded font-bold flex items-center gap-1 w-fit"><CheckCircle2 className="h-3 w-3"/> Verifisert & Klar</span>
                                        ) : activeManifest.status === 'loading' ? (
                                            <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-1 rounded font-bold flex items-center gap-1 w-fit"><Loader2 className="h-3 w-3 animate-spin"/> Laster...</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-1 rounded font-bold flex items-center gap-1 w-fit"><Clock className="h-3 w-3"/> Venter på lasting</span>
                                        )}
                                    </div>
                                </div>
                            )}

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
                {userData.orgId && <NewestPlaceCard orgId={userData.orgId} />}
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
