
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft } from 'lucide-react';
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
  const [route, setRoute] = useState<Route | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const [routePlaces, setRoutePlaces] = useState<Place[]>([]);
  const [distance, setDistance] = useState('N/A');
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
          return;
        }
        setIsCalculating(true);
        try {
          const placeIds = places.map((p) => p.id);
          const result = await calculateDistanceFn({ placeIds });
          const data = result.data as { distance: number, waypointOrder: number[] };
          setDistance(`${data.distance.toFixed(1)} km`);
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
          if (userDoc?.orgId) {
            const [routeData, placesData, usersData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
            ]);
            setOrganizationUsers(usersData);
            
            setRoute(routeData);
            setAllPlaces(placesData);

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
      const data = result.data as { distance: number, waypointOrder: number[] };
      
      setDistance(`${data.distance.toFixed(1)} km`);
      
      if (data.waypointOrder && data.waypointOrder.length > 0) {
        // Reconstruct the array based on waypoint_order from Google Maps
        // Note: waypoint_order ONLY contains intermediate points.
        // The first point (origin) and last point (destination) remain unchanged.
        const origin = routePlaces[0];
        const destination = routePlaces[routePlaces.length - 1];
        const intermediatePoints = routePlaces.slice(1, -1);
        
        const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
        
        const optimizedPlaces = [origin, ...optimizedIntermediate, destination];
        setRoutePlaces(optimizedPlaces);
        
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
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-4 hover:text-foreground transition-colors w-fit">
          <ChevronLeft className="h-4 w-4" />
          <Link href="/dashboard/routes" className="text-sm font-medium">Tilbake til Ruter</Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <RouteIcon className="h-8 w-8 text-primary" />
              </div>
              <Input 
                className="text-3xl font-bold h-auto py-2 border-transparent hover:border-input focus:border-input bg-transparent shadow-none" 
                value={route.name} 
                onChange={(e) => setRoute({...route, name: e.target.value})}
                placeholder="Navn på rute..."
              />
            </div>
            
            <div className="mt-2 pl-14">
              <Select 
                value={route.driverId || "unassigned"} 
                onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}
              >
                <SelectTrigger className="w-[280px] h-9 bg-background/50 backdrop-blur-sm border-slate-200 shadow-sm text-sm">
                  <SelectValue placeholder="Tildel til sjåfør..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                  {organizationUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm px-2 mt-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{routePlaces.length} {routePlaces.length === 1 ? 'stopp' : 'stopp'}</span>
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-2">
                {isCalculating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Badge variant={distance === 'Error' ? 'destructive' : 'secondary'} className="text-sm px-3 py-1">
                    {distance === 'Error' ? 'Kunne ikke beregne' : distance}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start">
            {routePlaces.length > 2 && (
               <Button 
                 variant="outline" 
                 size="lg"
                 className="shadow-sm font-semibold"
                 onClick={handleOptimizeRoute} 
                 disabled={isOptimizing || isSaving}
               >
                 {isOptimizing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5 text-indigo-500" />}
                 Optimer Rute
               </Button>
            )}
            <Button 
              size="lg" 
              className="shadow-sm font-semibold px-8"
              onClick={handleSave} 
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Lagre Endringer
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-5 h-fit sticky top-6 border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Legg til Stopp</CardTitle></CardHeader>
          <CardContent>
            <Select onValueChange={handleAddPlace}>
              <SelectTrigger><SelectValue placeholder="Velg et sted..." /></SelectTrigger>
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
        
        <Card className="lg:col-span-5 h-fit sticky top-6 border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Stopp på Ruten</CardTitle></CardHeader>
          <CardContent>
            {routePlaces.length === 0 ? (
              <p className="text-muted-foreground">Ingen stopp er lagt til enda.</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={routePlaces.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {routePlaces.map((place, index) => (
                      <SortableItem key={place.id} id={place.id}>
                        <li className="flex-grow flex items-center justify-between p-2 rounded-md bg-secondary">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="flex items-center justify-center bg-background rounded-full h-6 w-6 text-xs font-medium text-muted-foreground shrink-0 border shadow-sm">
                              {index + 1}
                            </span>
                            <span className="font-medium truncate">{place.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleRemovePlace(place.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      </SortableItem>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
