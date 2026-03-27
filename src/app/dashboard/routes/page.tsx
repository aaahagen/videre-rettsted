
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Trash2, MapPin, Route as RouteIcon, Car, Clock, SearchX } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
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
  const { query: searchQuery, setQuery } = useSearch();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(userDoc => {
        if (userDoc) {
          setUserData(userDoc);
          if (userDoc.orgId) {
            firebaseDB.getRoutes(userDoc.orgId).then(setRoutes);
            firebaseDB.getUsers(userDoc.orgId).then(setOrganizationUsers);
          }
        }
      });
    }
  }, [user]);
  
  const displayedRoutes = useMemo(() => {
    if (!userData) return [];

    let filtered = routes;

    // Filter by driver if not admin
    if (userData.role !== 'admin') {
        filtered = filtered.filter(route => route.driverId === userData.id);
    }

    // Filter by search query
    if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(route => 
            route.name.toLowerCase().includes(lowerQuery) ||
            (route.driverId && organizationUsers.find(u => u.id === route.driverId)?.name?.toLowerCase().includes(lowerQuery))
        );
    }

    return filtered;
  }, [routes, userData, searchQuery, organizationUsers]);

  
  const handleDeleteClick = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation();
    setRouteToDelete(route);
    setDeleteConfirmation('');
  };

  const confirmDeleteRoute = async () => {
    if (!routeToDelete) return;
    setIsDeleting(true);
    try {
      await firebaseDB.deleteRoute(routeToDelete.id as string);
      setRoutes(routes.filter(r => r.id !== routeToDelete.id));
      setRouteToDelete(null);
    } catch (err) {
      console.error('Error deleting route:', err);
      alert('Kunne ikke slette ruten.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateRoute = () => {
    router.push('/dashboard/routes/new');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p>Feil: {error.message}</p>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {searchQuery ? `Søkeresultater for "${searchQuery}"` : 'Ruter'}
        </h1>
        {searchQuery && (
          <Button variant="outline" size="sm" onClick={() => setQuery('')}>
            Nullstill søk
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
            <Button 
              variant="link" 
              onClick={() => setQuery('')}
              className="mt-4"
            >
              Vis alle ruter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRoutes.map(route => (
            <Card 
              key={route.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden flex flex-col h-full bg-white hover:-translate-y-1"
              onClick={() => router.push(`/dashboard/routes/${route.id}`)}
            >
              <div className="h-2 w-full bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500" />
              <CardHeader className="flex flex-row items-start justify-between pb-2 pt-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <RouteIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 transition-colors">
                      {route.name}
                    </CardTitle>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Opprettet {new Date(route.createdAt as any).toLocaleDateString()}
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
                  <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100 w-full">
                    <div className="flex-1 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stopp</span>
                        <span className="text-sm font-bold text-slate-700 leading-none">{route.places?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-slate-200 mx-2 shrink-0" />
                    
                    <div className="flex-1 flex items-center gap-2 justify-start">
                      <RouteIcon className="h-5 w-5 text-slate-500 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distanse</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none">
                          {route.distanceString || '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Time & Driver */}
                  <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100 w-full">
                    <div className="flex-1 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Tid</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none">
                          {route.duration || '--'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-slate-200 mx-2 shrink-0" />
                    
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <Car className="h-5 w-5 text-slate-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sjåfør</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none truncate" title={organizationUsers.find(u => u.id === route.driverId)?.name || 'Ingen'}>
                           {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name?.split(' ')[0] || 'Tildelt') : <span className="text-rose-500 italic text-xs">Mangler</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-2">
                   {route.places?.length === 0 ? (
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
          ))}
        </div>
      )}
          
      <Dialog open={!!routeToDelete} onOpenChange={(open) => !open && setRouteToDelete(null)}>
        <DialogContent>
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
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Slett rute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}