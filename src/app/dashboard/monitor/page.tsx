'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, MapPin, Car, CheckCircle2, Circle, AlertCircle, Route as RouteIcon, Activity } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/firebase';
import { firebaseDB } from '@/lib/firebase/database';
import { type Route, type Place, type User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSearch } from '@/hooks/use-search';

export default function MonitorPage() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [places, setPlaces] = useState<Record<string, Place>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();
  
  const { query: searchQuery, setContext } = useSearch();

  useEffect(() => {
    // Set context for global search
    setContext('Ruter', '/dashboard/routes/new');
    return () => setContext('Steder', '/dashboard/new'); // Reset context on unmount
  }, [setContext]);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const uDoc = await firebaseDB.getUser(user.uid);
        setUserData(uDoc);
        
        if (uDoc?.role !== 'admin') {
            router.push('/dashboard');
        }
      };
      fetchUserData();
    }
  }, [user, router]);

  useEffect(() => {
    if (!userData?.orgId) return;

    const routesRef = collection(db, 'routes');
    const q = query(routesRef, where('orgId', '==', userData.orgId));
    
    const unsubscribeRoutes = onSnapshot(q, (snapshot) => {
      const routesData: Route[] = [];
      snapshot.forEach((doc) => {
        routesData.push({ id: doc.id, ...doc.data() } as Route);
      });
      routesData.sort((a, b) => {
        const timeA = a.updatedAt ? ('toMillis' in a.updatedAt ? (a.updatedAt as any).toMillis() : new Date(a.updatedAt as any).getTime()) : 0;
        const timeB = b.updatedAt ? ('toMillis' in b.updatedAt ? (b.updatedAt as any).toMillis() : new Date(b.updatedAt as any).getTime()) : 0;
        return timeB - timeA;
      });
      setRoutes(routesData);
    });

    const fetchStaticData = async () => {
       try {
           const [fetchedPlaces, fetchedUsers] = await Promise.all([
               firebaseDB.getPlaces(userData.orgId),
               firebaseDB.getUsers(userData.orgId)
           ]);
           
           const placesMap: Record<string, Place> = {};
           fetchedPlaces.forEach(p => placesMap[p.id] = p);
           setPlaces(placesMap);
           
           const usersMap: Record<string, User> = {};
           fetchedUsers.forEach(u => usersMap[u.id] = u);
           setUsers(usersMap);
       } catch(err) {
           console.error("Error fetching places/users for monitor:", err);
       } finally {
           setIsDataLoading(false);
       }
    };
    
    fetchStaticData();

    return () => {
      unsubscribeRoutes();
    };
  }, [userData?.orgId]);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return routes;
    
    const lowerQuery = searchQuery.toLowerCase();
    return routes.filter(route => {
      const routeNameMatch = route.name?.toLowerCase().includes(lowerQuery);
      const driverNameMatch = route.driverId && users[route.driverId]?.name?.toLowerCase().includes(lowerQuery);
      
      // We could potentially search by place names within the route as well
      // const placesMatch = route.places?.some(placeId => places[placeId]?.name?.toLowerCase().includes(lowerQuery));
      
      return routeNameMatch || driverNameMatch; // || placesMatch;
    });
  }, [routes, searchQuery, users]);


  if (loading || isDataLoading || !userData) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const totalRoutes = filteredRoutes.length;
  let finishedRoutes = 0;
  let activeRoutes = 0;
  let totalStopsOverall = 0;
  let completedStopsOverall = 0;

  filteredRoutes.forEach(route => {
    const totalStops = route.places?.length || 0;
    const completedStopsCount = route.completedStops?.length || 0;
    
    totalStopsOverall += totalStops;
    completedStopsOverall += completedStopsCount;

    if (totalStops > 0 && completedStopsCount === totalStops) {
      finishedRoutes++;
    } else if (totalStops > 0) {
      activeRoutes++;
    }
  });

  const overallProgress = totalStopsOverall > 0 ? (completedStopsOverall / totalStopsOverall) * 100 : 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Ruteovervåkning
        </h1>
        <p className="text-muted-foreground mt-2">
          Sanntidsoversikt over alle aktive ruter og leveringsstatus.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Dagens Status {searchQuery && '(Filtrert)'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
              <span className="text-3xl font-bold text-slate-900">{totalRoutes}</span>
              <span className="text-sm text-muted-foreground">Totale Ruter</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-3xl font-bold text-blue-600">{activeRoutes}</span>
              <span className="text-sm text-blue-600/80">Aktive Ruter</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <span className="text-3xl font-bold text-green-600">{finishedRoutes}</span>
              <span className="text-sm text-green-600/80">Fullførte Ruter</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
              <span className="text-3xl font-bold text-primary">{totalStopsOverall}</span>
              <span className="text-sm text-primary/80">Totale Stopp</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Total Fremdrift for Dagen</span>
              <span className="text-muted-foreground">{completedStopsOverall} / {totalStopsOverall} stopp fullført ({Math.round(overallProgress)}%)</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {filteredRoutes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
            <RouteIcon className="h-12 w-12 opacity-20" />
            <p>Ingen ruter funnet{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          {filteredRoutes.map((route) => {
             const totalStops = route.places?.length || 0;
             const completedStopsCount = route.completedStops?.length || 0;
             const progress = totalStops > 0 ? (completedStopsCount / totalStops) * 100 : 0;
             const isFinished = totalStops > 0 && completedStopsCount === totalStops;
             const driverName = route.driverId ? users[route.driverId]?.name || users[route.driverId]?.email || 'Ukjent sjåfør' : 'Ikke tildelt';
             
             return (
              <Card key={route.id} className={`overflow-hidden transition-all duration-500 ${isFinished ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:shadow-md'}`}>
                <div className={`h-2 w-full ${isFinished ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progress}%`, transition: 'width 1s ease-in-out' }} />
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {route.name}
                        {isFinished && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                         <span className="flex items-center gap-1"><Car className="h-4 w-4" /> {driverName}</span>
                         {route.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {route.duration}</span>}
                      </div>
                    </div>
                    <Badge variant={isFinished ? 'default' : 'secondary'} className={isFinished ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {completedStopsCount} / {totalStops} fullført
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                   <Progress value={progress} className="h-2 mb-4 bg-slate-100" />
                   
                   <div className="space-y-3 mt-6">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Neste stopp / Status
                      </h4>
                      <div className="relative border-l-2 border-slate-100 ml-3 pl-4 space-y-4">
                          {route.places?.map((placeId, index) => {
                             const isCompleted = route.completedStops?.includes(placeId);
                             const place = places[placeId];
                             
                             const firstUncompletedIndex = route.places.findIndex(id => !(route.completedStops?.includes(id)));
                             const isCurrent = index === firstUncompletedIndex;
                             
                             const shouldShow = index === 0 || index === totalStops - 1 || isCurrent || index === firstUncompletedIndex - 1 || index === firstUncompletedIndex + 1;
                             
                             if (!shouldShow) {
                                if (index === 1 && firstUncompletedIndex > 2) return <div key={`ellipsis-${index}`} className="text-xs text-muted-foreground pl-2 py-1">... flere fullførte stopp ...</div>;
                                if (index === firstUncompletedIndex + 2 && index < totalStops - 1) return <div key={`ellipsis-${index}`} className="text-xs text-muted-foreground pl-2 py-1">... flere gjenstående stopp ...</div>;
                                return null;
                             }

                             return (
                               <div key={placeId} className={`relative flex items-center justify-between p-2 rounded-md ${isCurrent ? 'bg-primary/5 border border-primary/20 shadow-sm -ml-5 pl-5 z-10' : ''} ${isCompleted ? 'opacity-50' : ''}`}>
                                  <div className={`absolute -left-[21px] flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-white ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary animate-pulse' : 'bg-slate-300'}`} />
                                  
                                  <div className="flex flex-col min-w-0">
                                      <span className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-slate-500' : isCurrent ? 'text-primary' : 'text-slate-700'}`}>
                                          {place?.name || 'Laster sted...'}
                                      </span>
                                      {place?.address && <span className="text-xs text-muted-foreground truncate">{place.address}</span>}
                                  </div>
                                  
                                  <div className="shrink-0">
                                      {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : isCurrent ? <Badge variant="default" className="text-[10px] h-5">Neste</Badge> : <Circle className="h-4 w-4 text-slate-200" />}
                                  </div>
                               </div>
                             );
                          })}
                          
                          {totalStops === 0 && (
                             <div className="text-sm text-muted-foreground py-2 italic flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Ruten har ingen stopp enda.
                             </div>
                          )}
                      </div>
                   </div>
                </CardContent>
              </Card>
             );
          })}
        </div>
      )}
    </div>
  );
}
