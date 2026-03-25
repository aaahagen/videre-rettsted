
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, Trash2, GripVertical } from 'lucide-react';
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
  const [routePlaces, setRoutePlaces] = useState<Place[]>([]);
  const [distance, setDistance] = useState('N/A');
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

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
          const data = result.data as { distance: number };
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
            const [routeData, placesData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
            ]);
            
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Input className="text-3xl font-bold" value={route.name} onChange={(e) => setRoute({...route, name: e.target.value})}/>
        <div className="flex items-center gap-4">
          {isCalculating ? <Loader2 className="h-6 w-6 animate-spin" /> : <span className="text-xl font-bold">{distance}</span>}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lagre'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
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
        
        <Card>
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
                          <span>{index + 1}. {place.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleRemovePlace(place.id)}>
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
