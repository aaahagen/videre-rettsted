'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Trash2, MapPin, Route as RouteIcon, Car, Clock, SearchX, CheckCircle2 } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { firebaseDB } from '@/lib/firebase/database';
import { db, auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Route } from '@/lib/types';
import { useSearch } from '@/hooks/use-search';

export default function RoutesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const { query: searchQuery, setContext } = useSearch();
  const router = useRouter();

  // Set context for global search
  useEffect(() => {
    setContext('Ruter', '/dashboard/routes/new');
    return () => setContext('Steder', '/dashboard/new'); // Reset context on unmount
  }, [setContext]);

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(userDoc => {
        setUserData(userDoc);
        if (userDoc?.orgId) {
          firebaseDB.getUsers(userDoc.orgId).then(setOrganizationUsers);

          // Use a real-time listener instead of a one-time fetch so the UI updates
          // automatically when a driver finishes a route
          const routesRef = collection(db, 'routes');
          const q = query(routesRef, where('orgId', '==', userDoc.orgId));
          
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const routesData: Route[] = [];
            snapshot.forEach((doc) => {
              routesData.push({ id: doc.id, ...doc.data() } as Route);
            });
            // Sort by created/updated
            routesData.sort((a, b) => {
                const timeA = a.createdAt ? ('toMillis' in a.createdAt ? (a.createdAt as any).toMillis() : new Date(a.createdAt as any).getTime()) : 0;
                const timeB = b.createdAt ? ('toMillis' in b.createdAt ? (b.createdAt as any).toMillis() : new Date(b.createdAt as any).getTime()) : 0;
                return timeB - timeA;
            });
            setRoutes(routesData);
          });
          
          return () => unsubscribe();
        }
      });
    }
  }, [user]);

  const displayedRoutes = useMemo(() => {
    let filtered = routes;
    
    // Admin sees all, drivers see only their own
    if (userData?.role !== 'admin') {
      filtered = filtered.filter(route => route.driverId === user?.uid);
    }
    
    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(route => 
        route.name.toLowerCase().includes(lowerQuery) || 
        (route.shipmentNumber && route.shipmentNumber.toLowerCase().includes(lowerQuery)) ||
        organizationUsers.find(u => u.id === route.driverId)?.name?.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filtered;
  }, [routes, userData, user?.uid, searchQuery, organizationUsers]);

  const handleDeleteClick = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation(); // Prevent card click
    setRouteToDelete(route);
    setDeleteConfirmation('');
  };

  const confirmDeleteRoute = async () => {
    if (!routeToDelete || deleteConfirmation.toLowerCase() !== 'slett rute') return;
    
    setIsDeleting(true);
    try {
      await firebaseDB.deleteRoute(routeToDelete.id as string);
      // We don't need to manually update state because the onSnapshot listener will handle it
      setRouteToDelete(null);
    } catch (err) {
      console.error('Error deleting route:', err);
      alert('Kunne ikke slette ruten.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation('');
    }
  };

  const handleCreateRoute = () => {
    // Generate a temporary ID or just navigate to the 'new' page
    // For now, we'll navigate to a 'new' page that handles creation
    router.push('/dashboard/routes/new');
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (error || !user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 container mx-auto px-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ruter</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
             {userData?.role === 'admin' 
               ? "Administrer leveringsruter. Opprett nye ruter og tildel dem til sjåfører." 
               : "Her er en oversikt over rutene som er tildelt deg."}
          </p>
        </div>
        {userData?.role === 'admin' && (
          <Button onClick={handleCreateRoute} className="shadow-md hover:shadow-lg transition-shadow whitespace-nowrap shrink-0">
            <Plus className="mr-2 h-5 w-5" /> Ny Rute
          </Button>
        )}
      </div>

      {displayedRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-slate-100 p-6 mb-4">
            {searchQuery ? <SearchX className="h-12 w-12 text-slate-300" /> : <RouteIcon className="h-12 w-12 text-slate-300" />}
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            {searchQuery 
              ? `Ingen ruter matchet "${searchQuery}"` 
              : "Ingen ruter funnet"}
          </h2>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            {searchQuery 
              ? "Prøv å søke etter et annet rutenavn eller sjåfør."
              : userData?.role === 'admin' ? "Opprett din første rute for å komme i gang." : "Du har ingen ruter tildelt deg ennå."}
          </p>
          {(searchQuery) && (
             <p className="text-sm text-slate-400 mt-4 cursor-pointer hover:underline" onClick={() => {
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if(searchInput) {
                   searchInput.value = '';
                   // React won't detect this programmatic change, so we dispatch an event
                   const event = new Event('input', { bubbles: true });
                   searchInput.dispatchEvent(event);
                }
             }}>
                Tøm søk
             </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedRoutes.map(route => {
            const totalStops = route.places?.length || 0;
            
            let totalExpectedItems = route.places?.length || 0;
            if (route.prepTimeStart && route.prepTimeStart > 0) totalExpectedItems++;
            if (route.prepTimeEnd && route.prepTimeEnd > 0) totalExpectedItems++;
            if (route.breakTime && route.breakTime > 0) totalExpectedItems++;
            if (route.fuelServiceTime && route.fuelServiceTime > 0) totalExpectedItems++;
            
            const completedStopsCount = route.completedStops?.length || 0;
            const isFinished = totalExpectedItems > 0 && completedStopsCount >= totalExpectedItems;
            
            const createdAtDate = (route.createdAt as any)?.toDate ? (route.createdAt as any).toDate() : new Date(route.createdAt as any);

            return (
            <Card 
              key={route.id} 
              className={`group cursor-pointer transition-all duration-300 overflow-hidden flex flex-col h-full bg-white hover:-translate-y-1 ${isFinished ? 'border-green-200 shadow-sm hover:shadow-md' : 'border-slate-200 hover:shadow-xl'}`}
              onClick={() => router.push(`/dashboard/routes/${route.id}`)}
            >
              <div className={`h-2 w-full ${isFinished ? 'bg-green-500' : 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500'}`} />
              <CardHeader className="flex flex-row items-start justify-between pb-2 pt-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-colors ${isFinished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-800 group-hover:bg-slate-800 group-hover:text-white'}`}>
                    {isFinished ? <CheckCircle2 className="h-6 w-6" /> : <RouteIcon className="h-6 w-6" />}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 transition-colors">
                      {route.name}
                    </CardTitle>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Opprettet {isNaN(createdAtDate.getTime()) ? 'Ukjent dato' : createdAtDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {userData?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => handleDeleteClick(e, route)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4 flex-grow flex flex-col justify-between">
                
                {/* Stats Rows */}
                <div className="flex flex-col gap-2">
                  {/* Row 1: Stops & Distance */}
                  <div className={`flex items-center p-3 rounded-lg border w-full ${isFinished ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex-1 flex items-center gap-2">
                      <MapPin className={`h-5 w-5 shrink-0 ${isFinished ? 'text-green-500' : 'text-slate-400'}`} />
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isFinished ? 'text-green-600' : 'text-slate-400'}`}>Stopp</span>
                        <span className="text-sm font-bold text-slate-700 leading-none">{totalStops}</span>
                      </div>
                    </div>
                    
                    <div className={`w-px h-8 mx-2 shrink-0 ${isFinished ? 'bg-green-200' : 'bg-slate-200'}`} />
                    
                    <div className="flex-1 flex items-center gap-2 justify-start">
                      <RouteIcon className={`h-5 w-5 shrink-0 ${isFinished ? 'text-green-500' : 'text-slate-500'}`} />
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isFinished ? 'text-green-600' : 'text-slate-400'}`}>Distanse</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none">
                          {route.distanceString || '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Time & Driver */}
                  <div className={`flex items-center p-3 rounded-lg border w-full ${isFinished ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex-1 flex items-center gap-2">
                      <Clock className={`h-5 w-5 shrink-0 ${isFinished ? 'text-green-500' : 'text-slate-400'}`} />
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isFinished ? 'text-green-600' : 'text-slate-400'}`}>Est. Tid</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none">
                          {route.duration || '--'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`w-px h-8 mx-2 shrink-0 ${isFinished ? 'bg-green-200' : 'bg-slate-200'}`} />
                    
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <Car className={`h-5 w-5 shrink-0 ${isFinished ? 'text-green-500' : 'text-slate-400'}`} />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isFinished ? 'text-green-600' : 'text-slate-400'}`}>Sjåfør</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none truncate" title={organizationUsers.find(u => u.id === route.driverId)?.name || 'Ingen'}>
                           {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name?.split(' ')[0] || 'Tildelt') : <span className="text-rose-500 italic text-xs">Mangler</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-2">
                   {isFinished ? (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                         <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                         Rute fullført
                      </div>
                   ) : route.places?.length === 0 ? (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                         <Clock className="h-3.5 w-3.5 mr-1" />
                         Tom rute - krever oppsett
                      </div>
                   ) : route.driverId ? (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                         Klar for kjøring
                      </div>
                   ) : (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                         Venter på sjåfør
                      </div>
                   )}
                </div>

              </CardContent>
            </Card>
          )})}
        </div>
      )}
          
      <Dialog open={!!routeToDelete} onOpenChange={(open) => !open && setRouteToDelete(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Slett rute</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette ruten <strong>{routeToDelete?.name}</strong>? Denne handlingen kan ikke angres.
              For å bekrefte, skriv <strong>slett rute</strong> i feltet under.
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Skriv 'slett rute'"
            className="mt-4"
          />
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setRouteToDelete(null)} disabled={isDeleting}>Avbryt</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRoute}
              disabled={deleteConfirmation.toLowerCase() !== 'slett rute' || isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Slett permanent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
