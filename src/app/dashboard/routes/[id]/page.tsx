
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft, Clock, Car } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Place, Route } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center">
      <GripVertical className="cursor-grab mr-2 text-muted-foreground" />
      {children}
    </div>
  );
}

export default function RouteDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const [routePlaces, setRoutePlaces] = useState<Place[]>([]);
  const [distance, setDistance] = useState('N/A');
  const [duration, setDuration] = useState('N/A');
  const [prepTimeStart, setPrepTimeStart] = useState<number>(0);
  const [prepTimeEnd, setPrepTimeEnd] = useState<number>(0);
  const [breakTime, setBreakTime] = useState<number>(0);
  const [fuelServiceTime, setFuelServiceTime] = useState<number>(0);
  const [baseDurationSeconds, setBaseDurationSeconds] = useState<number>(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor));

  const debouncedCalculateDistance = useMemo(
    () =>
      debounce(async (places: Place[]) => {
        const functions = getFunctions();
        const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
        if (places.length < 2) {
          setDistance('N/A');
          setDuration('N/A');
          return;
        }
        setIsCalculating(true);
        try {
          const placeIds = places.map((p) => p.id);
          const result = await calculateDistanceFn({ placeIds });
          const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
          setDistance(`${data.distance.toFixed(1)} km`);
          
          if (data.duration) {
            setBaseDurationSeconds(data.duration);
          } else {
            setBaseDurationSeconds(0);
          }
        } catch (err: any) {
          console.error('Detailed error calculating distance:', err);
          setDistance('Error');
          toast({
            title: 'Error Calculating Distance',
            description: err.details?.error_message || err.message || 'An unknown error occurred.',
            variant: 'destructive',
          });
        } finally {
          setIsCalculating(false);
        }
      }, 500),
    [toast]
  );

  useEffect(() => {
    if (user && routeId) {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          const userDoc = await firebaseDB.getUser(user.uid);
          if (userDoc) {
            setUserData(userDoc);
          }
          if (userDoc?.orgId) {
            const [routeData, placesData, usersData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
            ]);
            setOrganizationUsers(usersData);
            
            setRoute(routeData);
            setAllPlaces(placesData);
            setPrepTimeStart(routeData?.prepTimeStart || 0);
            setPrepTimeEnd(routeData?.prepTimeEnd || 0);
            setBreakTime(routeData?.breakTime || 0);
            setFuelServiceTime(routeData?.fuelServiceTime || 0);


            if (routeData?.places) {
              const orderedPlaces = routeData.places
                .map(placeId => placesData.find(p => p.id === placeId))
                .filter((p): p is Place => p !== undefined);
              setRoutePlaces(orderedPlaces);
              debouncedCalculateDistance(orderedPlaces);
            }
          }
        } catch (err) {
          console.error('Error fetching route data:', err);
          toast({ title: 'Feil', description: 'Kunne ikke laste rutedata.', variant: 'destructive' });
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, routeId, toast]);

  const updateRoutePlaces = (newPlaces: Place[]) => {
    setRoutePlaces(newPlaces);
    debouncedCalculateDistance(newPlaces);
  };


  useEffect(() => {
    if (baseDurationSeconds > 0) {
      const totalSeconds = baseDurationSeconds + (prepTimeStart * 60) + (prepTimeEnd * 60) + (breakTime * 60) + (fuelServiceTime * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) {
        setDuration(`${hours} t ${minutes} min`);
      } else {
        setDuration(`${minutes} min`);
      }
    } else {
      setDuration('N/A');
    }
  }, [baseDurationSeconds, prepTimeStart, prepTimeEnd, breakTime, fuelServiceTime]);

  const handleAddPlace = (placeId: string) => {
    const placeToAdd = allPlaces.find(p => p.id === placeId);
    if (placeToAdd && !routePlaces.some(p => p.id === placeId)) {
      updateRoutePlaces([...routePlaces, placeToAdd]);
    }
  };

  const handleRemovePlace = (placeId: string) => {
    updateRoutePlaces(routePlaces.filter(p => p.id !== placeId));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = routePlaces.findIndex(item => item.id === active.id);
      const newIndex = routePlaces.findIndex(item => item.id === over.id);
      updateRoutePlaces(arrayMove(routePlaces, oldIndex, newIndex));
    }
  };

  const handleOptimizeRoute = async () => {
    if (routePlaces.length <= 2) {
      toast({ title: 'Info', description: 'Du trenger minst 3 stopp for å optimere ruten.' });
      return;
    }
    
    if (routePlaces.length > 27) { // API limit is 25 intermediate + 2 endpoints
        toast({ 
            title: 'For mange stopp', 
            description: 'Google Maps tillater maks 25 mellomstopp for automatisk optimalisering.', 
            variant: 'destructive' 
        });
        return;
    }

    setIsOptimizing(true);
    try {
      const placeIds = routePlaces.map(p => p.id);
      const functions = getFunctions();
      const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
      const result = await calculateDistanceFn({ placeIds });
      const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
      
      setDistance(`${data.distance.toFixed(1)} km`);
      if (data.duration) {
        setBaseDurationSeconds(data.duration);
      } else {
        setBaseDurationSeconds(0);
      }
      
      if (data.waypointOrder && data.waypointOrder.length > 0) {
        // Reconstruct the array based on waypoint_order from Google Maps
        // Note: waypoint_order ONLY contains intermediate points.
        // The first point (origin) and last point (destination) remain unchanged.
        const origin = routePlaces[0];
        const destination = routePlaces[routePlaces.length - 1];
        const intermediatePoints = routePlaces.slice(1, -1);
        
        const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
        
        const optimizedPlaces = [origin, ...optimizedIntermediate, destination];
        
        // Ensure state is updated correctly by checking array length
        if (optimizedPlaces.length === routePlaces.length) {
            setRoutePlaces(optimizedPlaces);
        } else {
            console.error('Mismatch in optimized places array length', optimizedPlaces, routePlaces);
        }
        
        toast({ title: 'Suksess', description: 'Ruten ble optimalisert for korteste kjøretid!' });
      } else {
         toast({ title: 'Info', description: 'Ruten er allerede optimal.' });
      }
    } catch (err: any) {
      console.error('Error optimizing:', err);
      toast({ title: 'Feil', description: 'Kunne ikke optimalisere ruten.', variant: 'destructive' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async () => {
    if (!route) return;
    setIsSaving(true);
    try {
      const updatedRoute = {
        ...route,
        places: routePlaces.map(p => p.id),
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime
      };
      await firebaseDB.updateRoute(routeId, updatedRoute);
      toast({ title: 'Suksess', description: 'Ruten er lagret.' });
      router.push('/dashboard/routes');
    } catch (err) {
      console.error('Error saving route:', err);
      toast({ title: 'Feil', description: 'Kunne ikke lagre ruten.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isDataLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (error || !user) {
    router.push('/login');
    return null;
  }
  if (!route) {
    return <div className="text-center py-12">Ruten ble ikke funnet.</div>;
  }


  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-2">
        <ChevronLeft className="h-4 w-4" />
        <Link href="/dashboard/routes" className="text-sm font-medium">Tilbake til Ruter</Link>
      </div>

      {/* Top Box: Route Info */}
      <Card className="border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                <RouteIcon className="h-8 w-8 text-primary" />
              </div>
              <Input 
                className="text-3xl font-bold h-auto py-2 px-3 bg-white/50 border-slate-200 hover:border-slate-300 focus:bg-white shadow-sm" 
                value={route.name} 
                onChange={(e) => setRoute({...route, name: e.target.value})}
                placeholder="Navn på rute..."
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stopp</span>
                  <span className="font-bold text-lg">{routePlaces.length}</span>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Distanse</span>
                  {isCalculating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
                  ) : (
                    <span className={`font-bold text-lg ${distance === 'Error' ? 'text-destructive' : ''}`}>
                      {distance === 'Error' ? 'Feil' : distance}
                    </span>
                  )}
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Tid</span>
                  {isCalculating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
                  ) : (
                    <span className="font-bold text-lg">{duration}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Time Settings Box */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
             <Clock className="h-5 w-5 text-slate-500" />
             Tidsinnstillinger
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Klargjøring (start)</label>
              <Select 
                value={prepTimeStart.toString()} 
                onValueChange={(val) => setPrepTimeStart(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg tid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ferdigstilling (slutt)</label>
              <Select 
                value={prepTimeEnd.toString()} 
                onValueChange={(val) => setPrepTimeEnd(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg tid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="25">25 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pause</label>
              <Select 
                value={breakTime.toString()} 
                onValueChange={(val) => setBreakTime(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg tid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Drivstoff / Service</label>
              <Select 
                value={fuelServiceTime.toString()} 
                onValueChange={(val) => setFuelServiceTime(Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Velg tid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Box: Driver Assignment */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
             <h3 className="font-semibold text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Tildelt Sjåfør
             </h3>
             <p className="text-sm text-muted-foreground">Velg hvem som skal kjøre denne ruten.</p>
          </div>
          <div>
              {userData?.role === 'admin' ? (
              <Select 
                value={route.driverId || "unassigned"} 
                onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}
              >
                <SelectTrigger className="w-full sm:w-[300px] h-10 border-slate-200 shadow-sm">
                  <SelectValue placeholder="Velg sjåfør..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                  {organizationUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-md font-medium border border-slate-200">
                    {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name || 'Ukjent sjåfør') : 'Ikke tildelt'}
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Places Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Add Places */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Legg til Stopp</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleAddPlace}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Søk og velg et sted..." />
                </SelectTrigger>
                <SelectContent>
                  {allPlaces.map(place => (
                    <SelectItem key={place.id} value={place.id} disabled={routePlaces.some(p => p.id === place.id)}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {/* Action Buttons Moved Here for better flow */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
             <CardContent className="p-6 space-y-4">
                {routePlaces.length > 2 && (
                   <Button 
                     variant="outline" 
                     className="w-full shadow-sm font-semibold h-12 bg-white"
                     onClick={handleOptimizeRoute} 
                     disabled={isOptimizing || isSaving}
                   >
                     {isOptimizing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5 text-indigo-500" />}
                     Optimer Rekkefølge
                   </Button>
                )}
                <Button 
                  className="w-full shadow-sm font-bold h-12 text-md"
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Lagre Rute
                </Button>
             </CardContent>
          </Card>
        </div>
        
        {/* Right Col: Current Route */}
        <Card className="lg:col-span-7 border-slate-200 shadow-sm flex flex-col h-[600px]">
          <CardHeader className="pb-4 shrink-0 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Rekkefølge</CardTitle>
              <span className="text-xs text-muted-foreground">Dra og slipp for å endre</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            {routePlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 p-8">
                 <MapPin className="h-12 w-12 text-slate-200" />
                 <p className="text-center">Ingen stopp er lagt til enda. <br/>Bruk menyen til venstre for å bygge ruten.</p>
              </div>
            ) : (
              <div className="p-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={routePlaces.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-3">
                    {routePlaces.map((place, index) => (
                      <SortableItem key={place.id} id={place.id}>
                        <li className="flex-grow flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-primary/50 transition-colors group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="flex items-center justify-center bg-slate-100 rounded-full h-7 w-7 text-xs font-bold text-slate-600 shrink-0 shadow-inner">
                              {index + 1}
                            </span>
                            <span className="font-semibold text-slate-700 truncate">{place.name}</span>
                          </div>
                          <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-slate-300 hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                             onClick={() => handleRemovePlace(place.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      </SortableItem>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );}
