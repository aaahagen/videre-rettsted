
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { calculateRouteDistance } from '@/lib/distance';
import { Place, Route } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function RouteDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [route, setRoute] = useState<Route | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [routePlaces, setRoutePlaces] = useState<Place[]>([]);
  const [distance, setDistance] = useState('N/A');
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;
  const { toast } = useToast();

  const updateDistance = useCallback((places: Place[]) => {
    if (places.length > 1) {
      const totalDistance = calculateRouteDistance(places);
      setDistance(`${totalDistance.toFixed(1)} km`);
    } else {
      setDistance('N/A');
    }
  }, []);

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

            if (routeData && routeData.places) {
              const currentRoutePlaces = placesData.filter(p => routeData.places.includes(p.id));
              setRoutePlaces(currentRoutePlaces);
              updateDistance(currentRoutePlaces);
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
  }, [user, routeId, toast, updateDistance]);

  const handleAddPlace = (placeId: string) => {
    const placeToAdd = allPlaces.find(p => p.id === placeId);
    if (placeToAdd && !routePlaces.some(p => p.id === placeId)) {
      const newRoutePlaces = [...routePlaces, placeToAdd];
      setRoutePlaces(newRoutePlaces);
      updateDistance(newRoutePlaces);
    }
  };

  const handleRemovePlace = (placeId: string) => {
    const newRoutePlaces = routePlaces.filter(p => p.id !== placeId);
    setRoutePlaces(newRoutePlaces);
    updateDistance(newRoutePlaces);
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
          <span className="text-xl font-bold">{distance}</span>
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
              <ul className="space-y-2">
                {routePlaces.map((place, index) => (
                  <li key={place.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                    <span>{index + 1}. {place.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemovePlace(place.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
