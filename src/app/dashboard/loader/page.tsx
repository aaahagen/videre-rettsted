'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { User, Manifest, Route } from '@/lib/types';
import { SplashScreen } from "@/components/ui/splash-screen";
import { 
  Truck, 
  Package, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Search,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Local interface for extended manifest data since Route info is in another collection
interface ExtendedManifest extends Manifest {
  routeName?: string;
}

export default function LoaderDashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [manifests, setManifests] = useState<ExtendedManifest[]>([]);
  const [loadingManifests, setLoadingManifests] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    }
  }, [authUser, loadingAuth, router]);

  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(doc(db, 'users', authUser.uid), (doc) => {
      if (doc.exists()) {
        const data = { ...doc.data(), id: doc.id } as User;
        setUserData(data);
        if (data.role !== 'loader' && data.role !== 'admin') {
          router.push('/dashboard');
        }
      }
    });
    return () => unsub();
  }, [authUser, router]);

  useEffect(() => {
    if (!userData?.orgId) return;

    // Listen for all non-archived manifests
    const q = query(
      collection(db, 'organizations', userData.orgId, 'manifests'),
      where('status', 'in', ['pending', 'loading', 'verified']),
      limit(50)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const manifestList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ExtendedManifest));
      
      // Fetch route names for each manifest
      const manifestsWithRouteNames = await Promise.all(manifestList.map(async (m) => {
        try {
          const rDoc = await getDocs(query(collection(db, 'routes'), where('__name__', '==', m.routeId), limit(1)));
          if (!rDoc.empty) {
            return { ...m, routeName: rDoc.docs[0].data().name };
          }
        } catch (e) {
          console.error("Error fetching route name", e);
        }
        return m;
      }));

      setManifests(manifestsWithRouteNames.sort((a, b) => {
        const priority = { 'loading': 0, 'pending': 1, 'verified': 2 };
        return (priority[a.status as keyof typeof priority] ?? 99) - (priority[b.status as keyof typeof priority] ?? 99);
      }));
      setLoadingManifests(false);
    });

    return () => unsub();
  }, [userData?.orgId]);

  if (loadingAuth || !userData) {
    return <SplashScreen />;
  }

  const filteredManifests = manifests.filter(m => 
    m.routeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-indigo-600" />
            Lasterampe
          </h1>
          <p className="text-slate-500 font-medium">Oversikt over dagens lastinger og manifester.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Søk rute eller bil..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loadingManifests ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-bold">Henter manifester...</p>
        </div>
      ) : filteredManifests.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Ingen aktive manifester</h3>
          <p className="text-slate-500">Det er ingen ruter som venter på lasting akkurat nå.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManifests.map((manifest) => {
            const totalKolli = manifest.orders.reduce((acc, curr) => acc + (curr.totalItems || 0), 0);
            const loadedKolli = manifest.orders.reduce((acc, curr) => acc + (curr.loadedItems || 0), 0);
            const progress = totalKolli > 0 ? (loadedKolli / totalKolli) * 100 : 0;
            const hasIssues = manifest.notes?.some(n => n.type === 'issue');

            return (
              <Link 
                key={manifest.id} 
                href={`/dashboard/manifests/${manifest.id}`}
                className="group block bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                          {manifest.routeName || 'Henter navn...'}
                        </h3>
                        {hasIssues && <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />}
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {manifest.vehicleId || 'Ingen bil tildelt'}
                      </p>
                    </div>
                    <Badge variant="outline" className={`capitalize font-black px-3 py-1 ${
                      manifest.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 
                      manifest.status === 'loading' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {manifest.status === 'pending' ? 'Venter' : 
                       manifest.status === 'loading' ? 'Laster' : 
                       manifest.status === 'verified' ? 'Ferdig' : manifest.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                      <span className="text-slate-500">Progress</span>
                      <span className={progress === 100 ? 'text-green-600' : 'text-slate-700'}>
                        {loadedKolli} / {totalKolli} KOLli
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          manifest.status === 'verified' ? 'bg-green-500' : 
                          progress > 0 ? 'bg-indigo-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                        <Clock className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Åpne manifest <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
