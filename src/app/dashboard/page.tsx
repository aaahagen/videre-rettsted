'use client';

import { useEffect, useState } from 'react';
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
import AdminDashboardContent from './admin/admin-content';

export default function DashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
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

  if (loadingAuth || (loadingRoute && !userData)) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!authUser || !userData) return null;

  const isAdmin = userData.role === 'admin';

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {isAdmin ? (
        /* ADMIN VIEW */
        <div className="space-y-12">
            <AdminDashboardContent authUser={authUser} />
            
            <div className="pt-8 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                        <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Egen Arbeidstid</h2>
                        <p className="text-slate-500 text-sm">Her kan du stemple inn/ut som administrator.</p>
                    </div>
                </div>
                
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
