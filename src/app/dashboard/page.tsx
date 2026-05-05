'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { Loader2, Route as RouteIcon, MessageSquare, MapPin, User as UserIcon, Shield, GraduationCap, Bell } from 'lucide-react';
import { User, Route, WorkLog, Organization, CourseAssignment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { doc, onSnapshot, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { useSearch } from '@/hooks/use-search';
import { TimeStampCard } from '@/components/workforce/time-stamp-card';
import Link from 'next/link';
import { NewestPlaceCard } from '@/components/places/newest-place-card';
import { cn } from '@/lib/utils';


import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { PendingInvitations } from '@/components/admin/pending-invitations';
import { DriverProfile, Route as RouteType, Place, Order, Manifest, Message } from '@/lib/types';
import { getDriverStatus } from "@/lib/workforce-utils";
import { UserCheck, Activity, Palmtree, Coffee, Briefcase, Truck, Package, Clock, CheckCircle2, BarChart3, ArrowRight, LogIn, LogOut, Users2, HelpCircle } from 'lucide-react';



export default function DashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [allRoutes, setAllRoutes] = useState<RouteType[]>([]);
  const [monitorStats, setMonitorStats] = useState({ total: 0, active: 0, finished: 0, totalPlaces: 0, completedPlaces: 0 });
  const [fleetStats, setFleetStats] = useState({ ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, loaded: 0, delivered: 0, failed: 0 });
  const [manifestStats, setManifestStats] = useState({ totalManifests: 0, activeManifests: 0, totalKolli: 0, loadedKolli: 0 });
  const [todayWorkLogs, setTodayWorkLogs] = useState<WorkLog[]>([]);

  // Driver dynamic data
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [activeManifest, setActiveManifest] = useState<Manifest | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingCoursesCount, setPendingCoursesCount] = useState(0);

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
    const unsub = onSnapshot(doc(db, 'users', authUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const uData = { ...docSnap.data(), id: docSnap.id } as User;
        setUserData(uData);
        
        // Fetch org data
        if (uData.orgId) {
            const orgRef = doc(db, 'organizations', uData.orgId);
            onSnapshot(orgRef, (oSnap) => {
                if (oSnap.exists()) {
                    setOrg({ ...oSnap.data(), id: oSnap.id } as Organization);
                }
            });
        }
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

  // Listen for dynamic driver notification data
  useEffect(() => {
    if (!userData?.id || !userData?.orgId) return;

    // 1. Unread Messages
    const msgQ = query(collection(db, 'messages'), where('orgId', '==', userData.orgId));
    const unsubMsgs = onSnapshot(msgQ, (snap) => {
        let count = 0;
        snap.forEach(d => {
            const m = d.data() as Message;
            const isForMe = m.recipientId === 'all' || m.recipientId === userData.id;
            if (isForMe && m.senderId !== userData.id && !(m.readBy || []).includes(userData.id)) {
                count++;
            }
        });
        setUnreadMessagesCount(count);
    });

    // 2. Pending Courses
    const courseQ = query(
        collection(db, 'courseAssignments'), 
        where('userId', '==', userData.id),
        where('status', 'in', ['assigned', 'in_progress'])
    );
    const unsubCourses = onSnapshot(courseQ, (snap) => {
        setPendingCoursesCount(snap.size);
    });

    return () => {
        unsubMsgs();
        unsubCourses();
    };
  }, [userData?.id, userData?.orgId]);

  
  useEffect(() => {
    const isPrivileged = userData?.role === 'admin' || userData?.role === 'super_admin';
    if (userData?.orgId && isPrivileged) {
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

          if (manifest.orders && Array.isArray(manifest.orders)) {
            manifest.orders.forEach(item => {
              totalKolli += (item.totalItems || 0);
              loadedKolli += (item.loadedItems || 0);
            });
          }
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
  }, [userData?.orgId, userData?.role]);

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
  if (activeManifest && activeManifest.orders) {
      activeManifest.orders.forEach(item => {
          driverTotalKolli += (item.totalItems || 0);
          driverLoadedKolli += (item.loadedItems || 0);
      });
  }
  const driverManifestProgress = driverTotalKolli > 0 ? (driverLoadedKolli / driverTotalKolli) * 100 : 0;

  const safeProgress = (val: number) => isNaN(val) ? 0 : val;

  if (loadingAuth || (loadingRoute && !userData)) {
    return <SplashScreen />;
  }

  if (!authUser || !userData) return null;

  const isAdmin = userData.role === 'admin' || userData.role === 'super_admin';
  const isLogisticsEnabled = org?.modules?.logistics !== false;
  const isMessagesEnabled = org?.modules?.messages !== false;
  const isLearningEnabled = org?.modules?.learning !== false;

  return (
    <div className={cn(
        "min-h-screen p-4 sm:p-6 lg:p-8 w-full",
        isAdmin ? "bg-slate-100/50" : "bg-background"
    )}>
      
      {isAdmin ? (
        
        /* ADMIN VIEW - Refined Bento Box */
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1600px] mx-auto">
            
            {/* MAIN CANVAS (Left - 66%) */}
            <div className="w-full lg:w-2/3 space-y-8">
                
                {/* 1. OPERATIONAL STATUS (White with blue metrics) */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <RouteIcon className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Operativ status</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direkte data</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div className="flex flex-col items-start p-5 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:bg-white">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">Totale Ruter</span>
                                <span className="text-4xl font-black text-slate-900">{monitorStats.total}</span>
                            </div>
                            <div className="flex flex-col items-start p-5 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:bg-white">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">Aktive</span>
                                <span className="text-4xl font-black text-primary">{monitorStats.active}</span>
                            </div>
                            <div className="flex flex-col items-start p-5 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:bg-white">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">Fullførte</span>
                                <span className="text-4xl font-black text-emerald-600">{monitorStats.finished}</span>
                            </div>
                            <div className="flex flex-col items-start p-5 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:bg-white">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">Totale Stopp</span>
                                <span className="text-4xl font-black text-slate-900">{monitorStats.totalPlaces}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gjennomføringsgrad</span>
                                    <div className="text-2xl font-black text-slate-800">{Math.round(safeProgress(overallProgress))}%</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {monitorStats.completedPlaces} av {monitorStats.totalPlaces} stopp ferdigstilt
                                    </span>
                                </div>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${safeProgress(overallProgress)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOGISTICS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LASTERAMPE (Indigo tinted) */}
                    <div className="bg-indigo-50/30 rounded-xl border border-indigo-100/50 p-8 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:bg-indigo-50/50">
                        <div>
                            <div className="flex justify-between items-center mb-8 border-b border-indigo-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Terminal</span>
                                </div>
                                <Link href="/dashboard/manifests" className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-600 flex items-center gap-1 group transition-colors">
                                    Gå til ruter <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="flex justify-between items-end mb-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">Lastefremdrift</span>
                                    <div className="text-4xl font-black text-indigo-600">{Math.round(safeProgress(manifestProgress))}%</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono font-bold text-indigo-500 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                                        {manifestStats.loadedKolli} / {manifestStats.totalKolli} kolli
                                    </span>
                                </div>
                            </div>
                            
                            <div className="h-2 w-full bg-indigo-100/50 rounded-full overflow-hidden border border-indigo-200/20 mb-10">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
                                    style={{ width: `${safeProgress(manifestProgress)}%` }} 
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-indigo-100 flex flex-col shadow-sm">
                                <span className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Aktive planer</span>
                                <span className="text-2xl font-black text-indigo-600">{manifestStats.activeManifests}</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-indigo-100 flex flex-col shadow-sm">
                                <span className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Totale planer</span>
                                <span className="text-2xl font-black text-indigo-600">{manifestStats.totalManifests}</span>
                            </div>
                        </div>
                    </div>

                    {/* ORDER STATS (Clean White) */}
                    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Package className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ordre</span>
                            </div>
                            <Link href="/dashboard/orders" className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 flex items-center gap-1 group transition-colors">
                                Se alle <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col items-start p-4 bg-slate-50/30 border border-slate-100 rounded-xl">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-2">Totalt</span>
                                <span className="text-2xl font-black text-slate-900">{orderStats.total}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-amber-50/20 border border-amber-100/50 rounded-xl group">
                                <span className="text-[10px] text-amber-600/60 font-black uppercase tracking-tighter mb-2 flex items-center gap-2">
                                    <Clock className="h-3 w-3"/> Venter
                                </span>
                                <span className="text-2xl font-black text-amber-500">{orderStats.pending}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-blue-50/20 border border-blue-100/50 rounded-xl group">
                                <span className="text-[10px] text-blue-600/60 font-black uppercase tracking-tighter mb-2 flex items-center gap-2">
                                    <BarChart3 className="h-3 w-3"/> Lastet
                                </span>
                                <span className="text-2xl font-black text-blue-500">{orderStats.loaded}</span>
                            </div>
                            <div className="flex flex-col items-start p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-xl group">
                                <span className="text-[10px] text-emerald-600/60 font-black uppercase tracking-tighter mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3"/> Levert
                                </span>
                                <span className="text-2xl font-black text-emerald-600">{orderStats.delivered}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TELEMETRY ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* WORKFORCE LIST (Blue Tinted) */}
                    <div className="bg-blue-50/30 rounded-xl border border-blue-100/50 p-8 shadow-sm flex flex-col transition-all hover:shadow-md hover:bg-blue-50/50">
                        <div className="flex justify-between items-center mb-8 border-b border-blue-100 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Mannskap</span>
                            </div>
                            <Link href="/dashboard/workforce" className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-600 flex items-center gap-1 group transition-colors">
                                Vaktplan <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02] cursor-default">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-md"><UserCheck className="h-4 w-4"/></div>
                                    På jobb
                                </span>
                                <span className="text-lg font-black text-blue-600">{workforceStats.working}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02] cursor-default">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="p-1.5 bg-amber-50 text-amber-500 rounded-md"><Briefcase className="h-4 w-4"/></div>
                                    Innleid
                                </span>
                                <span className="text-lg font-black text-amber-600">{workforceStats.contractors}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02] cursor-default">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="p-1.5 bg-red-50 text-red-500 rounded-md"><Activity className="h-4 w-4"/></div>
                                    Sykemelding
                                </span>
                                <span className="text-lg font-black text-red-600">{workforceStats.sick}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02] cursor-default">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-md"><Palmtree className="h-4 w-4"/></div>
                                    Ferie
                                </span>
                                <span className="text-lg font-black text-emerald-600">{workforceStats.vacation}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02] cursor-default">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="p-1.5 bg-slate-50 text-slate-500 rounded-md"><Coffee className="h-4 w-4"/></div>
                                    Fri
                                </span>
                                <span className="text-lg font-black text-slate-600">{workforceStats.off}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02] cursor-default">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md"><HelpCircle className="h-4 w-4"/></div>
                                    Annet
                                </span>
                                <span className="text-lg font-black text-slate-600">{workforceStats.other}</span>
                            </div>
                        </div>
                    </div>

                    {/* FLEET LIST (Slate tinted) */}
                    <div className="bg-slate-100/50 rounded-xl border border-slate-200/50 p-8 shadow-sm flex flex-col transition-all hover:shadow-md hover:bg-slate-100/80">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-200 rounded-lg text-slate-700">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Bilpark</span>
                            </div>
                            <Link href="/dashboard/fleet" className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 flex items-center gap-1 group transition-colors">
                                Kjøretøy <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> 
                                    Operative
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.ready}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> 
                                    På rute
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.on_tour}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" /> 
                                    Servicebehov
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.pending_workshop + fleetStats.observation}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" /> 
                                    Verksted
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.workshop}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]" /> 
                                    Parkert
                                </span>
                                <span className="text-lg font-black text-slate-900">{fleetStats.parked}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ACTION SIDEBAR (Right - 33%) */}
            <div className="w-full lg:w-1/3 space-y-8">
                {/* ATTENDANCE CARD (Emerald tinted) */}
                <div className="bg-emerald-50/30 rounded-xl border border-emerald-100/50 p-8 shadow-sm transition-all hover:shadow-md hover:bg-emerald-50/50">
                    <div className="flex justify-between items-center mb-8 border-b border-emerald-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <Users2 className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Oppmøte</span>
                        </div>
                        <span className="bg-white text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100 shadow-sm">I dag</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-white border border-emerald-100 rounded-xl shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                    <LogIn className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-black text-slate-700">Til stede</span>
                            </div>
                            <span className="text-3xl font-black text-emerald-600">{attendanceStats.present}</span>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-white border border-blue-100 rounded-xl shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-black text-slate-700">Ferdig</span>
                            </div>
                            <span className="text-3xl font-black text-emerald-600">{attendanceStats.finished}</span>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-white border border-amber-100 rounded-xl shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-black text-slate-700">Venter</span>
                            </div>
                            <span className="text-3xl font-black text-amber-600">{attendanceStats.waiting}</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-emerald-100 flex justify-between items-center text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">
                        <span>Dagens plan</span>
                        <span className="text-slate-900 font-black">{workforceStats.working} ansatte</span>
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
                
                {isLogisticsEnabled && (
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
                                            <div className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${safeProgress(driverManifestProgress)}%` }} />
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
                )}

                {/* DYNAMIC MODULE CARDS (Messages & Learning) */}
                <div className="flex flex-col gap-6 h-full">
                    {isMessagesEnabled && (
                        <Link href="/dashboard/messages" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-600 transition-all hover:shadow-md border-b-4 border-b-slate-200 hover:border-b-blue-600 flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform rounded-xl">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm">Meldinger</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kommunikasjon</span>
                                </div>
                            </div>
                            {unreadMessagesCount > 0 && (
                                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs animate-bounce shadow-lg shadow-blue-200">
                                    {unreadMessagesCount}
                                </div>
                            )}
                        </Link>
                    )}

                    {isLearningEnabled && (
                        <Link href="/dashboard/learning" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-600 transition-all hover:shadow-md border-b-4 border-b-slate-200 hover:border-b-indigo-600 flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform rounded-xl">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm">Læringsportal</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kurs & Opplæring</span>
                                </div>
                            </div>
                            {pendingCoursesCount > 0 && (
                                <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-200">
                                    {pendingCoursesCount}
                                </div>
                            )}
                        </Link>
                    )}
                </div>

                <div className="h-full">
                    {userData.orgId && <NewestPlaceCard orgId={userData.orgId} />}
                </div>
            </div>

            {/* Bottom Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
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

                {isLogisticsEnabled && (
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
                )}
                
                {/* Favorites - Always available if Places are available */}
                <Link href="/dashboard/favorites" className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-yellow-500 transition-all hover:shadow-md border-b-4 border-b-slate-200 hover:border-b-yellow-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-yellow-50 group-hover:text-yellow-600 rounded-xl transition-all group-hover:scale-110">
                            <Star className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 group-hover:text-yellow-600 transition-colors uppercase tracking-tight text-sm">Favoritter</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dine lagrede steder</span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
      )}
    </div>
  );
}
