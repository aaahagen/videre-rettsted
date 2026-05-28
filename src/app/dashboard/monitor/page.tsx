'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Clock, MapPin, Car, CheckCircle2, Circle, AlertCircle, Route as RouteIcon, Activity, ChevronDown, ChevronUp, ExternalLink, Users, AlertTriangle, MessageSquare, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/firebase';
import { firebaseDB } from '@/lib/firebase/database';
import { type Route, type Place, type User, type Vehicle, type CompletedStopEvent, type Manifest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSearch } from '@/hooks/use-search';
import { cn } from '@/lib/utils';

export default function MonitorPage() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [manifests, setManifests] = useState<Record<string, Manifest>>({});
  const [places, setPlaces] = useState<Record<string, Place>>({});
  const [users, setUsers] = useState<Record<string, User>>({});
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();
  
  const { query: searchQuery, setContext } = useSearch();
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});

  const toggleRouteExpansion = (routeId: string) => {
    setExpandedRoutes(prev => ({ ...prev, [routeId]: !prev[routeId] }));
  };

  useEffect(() => {
    setContext('Ruter', '/dashboard/routes/new');
    return () => setContext('Steder', '/dashboard/new'); 
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

    const manifestsRef = collection(db, 'organizations', userData.orgId, 'manifests');
    const unsubscribeManifests = onSnapshot(manifestsRef, (snapshot) => {
        const manifestsMap: Record<string, Manifest> = {};
        snapshot.forEach(doc => {
            manifestsMap[doc.id] = { id: doc.id, ...doc.data() } as Manifest;
        });
        setManifests(manifestsMap);
    });

    const fetchStaticData = async () => {
       try {
           const [fetchedPlaces, fetchedUsers, fetchedVehicles] = await Promise.all([
               firebaseDB.getPlaces(userData.orgId),
               firebaseDB.getUsers(userData.orgId),
               firebaseDB.getVehicles(userData.orgId)
           ]);
           
           const placesMap: Record<string, Place> = {};
           fetchedPlaces.forEach(p => placesMap[p.id] = p);
           setPlaces(placesMap);
           
           const usersMap: Record<string, User> = {};
           fetchedUsers.forEach(u => usersMap[u.id] = u);
           setUsers(usersMap);
           
           const vehiclesMap: Record<string, Vehicle> = {};
           fetchedVehicles.forEach(v => vehiclesMap[v.id] = v);
           setVehicles(vehiclesMap);
       } catch(err) {
           console.error("Error fetching places/users for monitor:", err);
       } finally {
           setIsDataLoading(false);
       }
    };
    
    fetchStaticData();

    return () => {
      unsubscribeRoutes();
      unsubscribeManifests();
    };
  }, [userData?.orgId]);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return routes;
    
    const lowerQuery = searchQuery.toLowerCase();
    return routes.filter(route => {
      const routeNameMatch = route.name?.toLowerCase().includes(lowerQuery);
      const driverNameMatch = route.driverId && users[route.driverId]?.name?.toLowerCase().includes(lowerQuery);
      const supplierMatch = route.isThirdParty && route.thirdPartySupplier?.toLowerCase().includes(lowerQuery);
      
      return routeNameMatch || driverNameMatch || supplierMatch;
    });
  }, [routes, searchQuery, users]);


  if (loading || isDataLoading || !userData) {
    return <SplashScreen />;
  }

  const totalRoutes = filteredRoutes.length;
  let finishedRoutes = 0;
  let activeRoutes = 0;
  let totalPlacesOverall = 0;
  let completedPlacesOverall = 0;

  filteredRoutes.forEach(route => {
    const placesCount = route.places?.length || 0;
    
    let expectedItems = placesCount;
    if (route.prepTimeStart && route.prepTimeStart > 0) expectedItems++;
    if (route.prepTimeEnd && route.prepTimeEnd > 0) expectedItems++;
    if (route.breakTime && route.breakTime > 0) expectedItems++;
    if (route.fuelServiceTime && route.fuelServiceTime > 0) expectedItems++;
    
    const completedCount = route.completedStops?.length || 0;

    totalPlacesOverall += placesCount;
    
    const currentCompletedPlaces = route.completedStops?.filter(stopId => stopId.startsWith('place_')).length || 0;
    completedPlacesOverall += currentCompletedPlaces;

    if (expectedItems > 0 && completedCount >= expectedItems) {
      finishedRoutes++;
    } else if (expectedItems > 0) {
      activeRoutes++;
    }
  });

  const overallProgress = totalPlacesOverall > 0 ? (completedPlacesOverall / totalPlacesOverall) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
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
              <span className="text-3xl font-bold text-primary">{totalPlacesOverall}</span>
              <span className="text-sm text-primary/80">Totale Stopp</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Total Fremdrift for Dagen</span>
              <span className="text-muted-foreground">{completedPlacesOverall} / {totalPlacesOverall} stopp fullført ({Math.round(overallProgress)}%)</span>
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
             const completedPlacesCount = route.completedStops?.filter(id => id.startsWith('place_')).length || 0;
             
             let totalExpectedItems = totalStops;
             if (route.prepTimeStart && route.prepTimeStart > 0) totalExpectedItems++;
             if (route.prepTimeEnd && route.prepTimeEnd > 0) totalExpectedItems++;
             if (route.breakTime && route.breakTime > 0) totalExpectedItems++;
             if (route.fuelServiceTime && route.fuelServiceTime > 0) totalExpectedItems++;
             const isFinished = totalExpectedItems > 0 && (route.completedStops?.length || 0) >= totalExpectedItems;

             const progress = totalStops > 0 ? (completedPlacesCount / totalStops) * 100 : 0;
             const driverName = route.isThirdParty 
                ? (route.thirdPartySupplier ? `3PS: ${route.thirdPartySupplier}` : '3PS (Ekstern)') 
                : (route.driverId ? users[route.driverId]?.name || users[route.driverId]?.email || 'Ukjent sjåfør' : 'Ikke tildelt');
             
             // Get manifest for this route
             const manifest = manifests[route.id] || Object.values(manifests).find(m => m.routeId === route.id);
             const hasIssues = manifest?.notes?.some(n => n.type === 'issue');
             const latestNote = manifest?.notes?.[manifest.notes.length - 1];

             return (
              <Card key={route.id} className={`overflow-hidden transition-all duration-500 ${isFinished ? "border-green-200 bg-green-50/30" : "border-slate-200 hover:shadow-md"}`}>
                <div className={`h-2 w-full ${isFinished ? "bg-green-200" : "bg-red-200"}`} />
                
                <CardHeader className="pb-2 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => toggleRouteExpansion(route.id)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {route.name}
                        {isFinished && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {hasIssues && <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                         <span className="flex items-center gap-1" title="Sjåfør">
                             <Users className="h-4 w-4" /> {driverName}
                         </span>
                         {!route.isThirdParty && (
                             <span className="flex items-center gap-1" title="Kjøretøy">
                                 <Car className="h-4 w-4" /> {route.vehicleId ? (vehicles[route.vehicleId]?.name || 'Ukjent') : 'Ikke tildelt'}
                             </span>
                         )}
                         {route.duration && <span className="flex items-center gap-1" title="Estimert Kjøretid"><Clock className="h-4 w-4" /> {route.duration}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant={isFinished ? 'default' : 'secondary'} className={isFinished ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {completedPlacesCount} / {totalStops} fullført
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label="Toggle Route Details" asChild>
                            <div>
                                {expandedRoutes[route.id] ? <ChevronUp className="h-4 w-4 pointer-events-none" /> : <ChevronDown className="h-4 w-4 pointer-events-none" />}
                            </div>
                        </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                   
                   <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-2">
                       <div 
                           className={`h-full w-full flex-1 transition-all duration-1000 ease-in-out ${isFinished ? "bg-green-500" : "bg-red-500"}`}
                           style={{ transform: `translateX(-${100 - (progress || 0)}%)` }}
                       />
                   </div>

                   {/* Manifest Alerts in Monitor */}
                   {!isFinished && manifest && (
                       <div className="mt-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Truck className={cn("h-3 w-3", manifest.status === 'verified' ? "text-green-500" : "text-blue-500")} />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                                        Status Lasterampe: {manifest.status === 'verified' ? 'Klar' : 'Laster'}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono">
                                    {manifest.orders.reduce((sum, o) => sum + o.loadedItems, 0)} / {manifest.orders.reduce((sum, o) => sum + o.totalItems, 0)} KOLli
                                </span>
                            </div>
                            {latestNote && (
                                <div className={cn(
                                    "p-2 rounded border text-xs flex items-start gap-2",
                                    latestNote.type === 'issue' ? "bg-red-50 border-red-100 text-red-800" : "bg-slate-50 border-slate-100 text-slate-600"
                                )}>
                                    {latestNote.type === 'issue' ? <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" /> : <MessageSquare className="h-3 w-3 shrink-0 mt-0.5" />}
                                    <div className="min-w-0 flex-1">
                                        <span className="font-bold mr-1">{latestNote.userName}:</span>
                                        <span className="italic">"{latestNote.content}"</span>
                                    </div>
                                </div>
                            )}
                       </div>
                   )}

                   {isFinished && <div className="text-xs text-green-600 font-medium mb-4 flex items-center gap-1 mt-2"><CheckCircle2 className="h-3 w-3" /> Rute ferdigstilt</div>}
                   
                   <div className="space-y-3 mt-6">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Neste stopp / Status
                      </h4>
                      <div className="relative border-l-2 border-slate-100 ml-3 pl-4 space-y-4">
                          {route.places?.map((placeId, index) => {
                             const isCompleted = route.completedStops?.includes(`place_${placeId}`);
                             const place = places[placeId];
                             
                             const firstUncompletedIndex = route.places.findIndex(id => !(route.completedStops?.includes(`place_${id}`)));
                             const isCurrent = index === firstUncompletedIndex;
                             
                             const isExpanded = expandedRoutes[route.id];
                             const shouldShow = isExpanded || index === 0 || index === totalStops - 1 || isCurrent || index === firstUncompletedIndex - 1 || index === firstUncompletedIndex + 1;
                             
                             if (!shouldShow) {
                                if (isFinished) {
                                    if (index === 1 && totalStops > 2) return <div key={`ellipsis-${index}`} className="text-xs text-muted-foreground pl-2 py-1">... {totalStops - 2} fullførte stopp skjult ...</div>;
                                    return null;
                                } else {
                                    if (index === 1 && firstUncompletedIndex > 2) return <div key={`ellipsis-${index}`} className="text-xs text-muted-foreground pl-2 py-1">... {firstUncompletedIndex - 1} fullførte stopp skjult ...</div>;
                                    if (index === firstUncompletedIndex + 2 && index < totalStops - 1) return <div key={`ellipsis-${index}`} className="text-xs text-muted-foreground pl-2 py-1">... {totalStops - 1 - (firstUncompletedIndex + 1)} gjenstående stopp skjult ...</div>;
                                    return null;
                                }
                             }

                             return (
                               <div key={placeId} className={`relative flex items-center justify-between p-2 rounded-md ${isCurrent ? "bg-primary/5 border border-primary/20 shadow-sm -ml-5 pl-5 z-10" : ""} ${isCompleted ? "opacity-60" : "hover:bg-slate-50"}`}>
                                  <div className={`absolute -left-[21px] flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-white ${isCompleted ? "bg-green-500" : isCurrent ? "bg-primary animate-pulse" : "bg-slate-300"}`} />
                                  
                                  <div className="flex flex-col min-w-0 pr-4">
                                      <Link href={`/dashboard/places/${placeId}`} className="hover:underline flex items-center gap-2 group">
                                          <span className={`text-sm font-medium truncate ${isCompleted ? "line-through text-slate-500" : isCurrent ? "text-primary" : "text-slate-700"}`}>
                                              {place?.name || 'Laster sted...'}
                                          </span>
                                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                      </Link>
                                      {place?.address && <span className="text-xs text-muted-foreground truncate">{place.address}</span>}
                                  </div>
                                  
                                  <div className="shrink-0 flex flex-col items-end justify-center gap-1">
                                      <div className="flex items-center gap-2">
                                          {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : isCurrent ? <Badge variant="default" className="text-[10px] h-5">Neste</Badge> : <Circle className="h-4 w-4 text-slate-200" />}
                                      </div>
                                      {isCompleted && route.completedStopEvents && route.completedStopEvents[`place_${placeId}`] && (
                                          <div className="flex flex-col items-end">
                                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                  {format(new Date((route.completedStopEvents[`place_${placeId}`].timestamp as any)?.toDate?.() || route.completedStopEvents[`place_${placeId}`].timestamp), "HH:mm")}
                                              </span>
                                              {route.completedStopEvents[`place_${placeId}`].coordinates && (
                                                  <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${route.completedStopEvents[`place_${placeId}`].coordinates?.lat},${route.completedStopEvents[`place_${placeId}`].coordinates?.lng}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                      <MapPin className="h-2 w-2" /> Vis kart
                                                  </a>
                                              )}
                                          </div>
                                      )}
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
