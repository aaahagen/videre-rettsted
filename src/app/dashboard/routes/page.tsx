
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Trash2, MapPin, Route as RouteIcon, Car, Clock } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route } from '@/lib/types';

export default function RoutesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
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
  
  const displayedRoutes = routes.filter(route => {
    if (!userData) return false;
    if (userData.role === 'admin') return true; // Admins see all routes
    return route.driverId === userData.id; // Drivers only see their own routes
  });

  
  const handleDeleteRoute = async (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    if (confirm('Er du sikker på at du vil slette denne ruten?')) {
      try {
        await firebaseDB.deleteRoute(routeId);
        setRoutes(routes.filter(r => r.id !== routeId));
      } catch (err) {
        console.error('Error deleting route:', err);
        alert('Kunne ikke slette ruten.');
      }
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
        <h1 className="text-3xl font-bold">Ruter</h1>
        {userData?.role === 'admin' && (
          <Button onClick={handleCreateRoute}>
            <Plus className="mr-2 h-4 w-4" />
            Opprett Rute
          </Button>
        )}
      </div>
      
      {displayedRoutes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Ingen ruter funnet. Opprett din første rute for å komme i gang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRoutes.map(route => (
            <Card 
              key={route.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden flex flex-col h-full bg-white hover:-translate-y-1"
              onClick={() => router.push(`/dashboard/routes/${route.id}`)}
            >
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardHeader className="flex flex-row items-start justify-between pb-2 pt-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <RouteIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
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
                    onClick={(e) => handleDeleteRoute(e, route.id as string)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4 pt-4 flex-grow flex flex-col justify-between">
                
                {/* Stats Row */}
                <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stopp</span>
                      <span className="text-lg font-bold text-slate-700 leading-none">{route.places?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-200" />
                  
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sjåfør</span>
                      <span className="text-sm font-semibold text-slate-700 leading-none truncate max-w-[100px]" title={organizationUsers.find(u => u.id === route.driverId)?.name || 'Ingen'}>
                         {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name?.split(' ')[0] || 'Tildelt') : <span className="text-amber-500 italic">Mangler</span>}
                      </span>
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
    </div>
  );
}
