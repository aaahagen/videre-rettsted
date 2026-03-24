
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateRouteDistance } from '@/lib/distance';
import { Place, Route } from '@/lib/types';

export default function RoutesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [distances, setDistances] = useState<{ [key: string]: string }>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const router = useRouter();

  const calculateDistances = useCallback(async (routesToProcess: Route[]) => {
    if (routesToProcess.length === 0) return;
    setIsCalculating(true);
    const newDistances: { [key: string]: string } = {};

    for (const route of routesToProcess) {
      if (route.places && route.places.length > 1) {
        try {
          const placeDocs = await Promise.all(
            route.places.map(placeId => firebaseDB.getPlace(placeId))
          );
          const validPlaces = placeDocs.filter(p => p !== null && p.coordinates) as Place[];
          if (validPlaces.length > 1) {
            const distance = calculateRouteDistance(validPlaces);
            newDistances[route.id] = `${distance.toFixed(1)} km`;
          } else {
            newDistances[route.id] = 'N/A';
          }
        } catch (error) {
          console.error(`Error calculating distance for route ${route.id}:`, error);
          newDistances[route.id] = 'Error';
        }
      } else {
        newDistances[route.id] = 'N/A';
      }
    }
    setDistances(newDistances);
    setIsCalculating(false);
  }, []);

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(userDoc => {
        if (userDoc?.orgId) {
          firebaseDB.getRoutes(userDoc.orgId).then(fetchedRoutes => {
            setRoutes(fetchedRoutes);
            calculateDistances(fetchedRoutes);
          });
        }
      });
    }
  }, [user, calculateDistances]);

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
        <Button onClick={handleCreateRoute}>
          <Plus className="mr-2 h-4 w-4" />
          Opprett Rute
        </Button>
      </div>
      
      {routes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Ingen ruter funnet. Opprett din første rute for å komme i gang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map(route => (
            <Card 
              key={route.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/dashboard/routes/${route.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{route.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {route.places?.length || 0} stopp
                </p>
                <p className="text-sm font-semibold mt-2">
                  Distanse: {isCalculating && !distances[route.id] ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : distances[route.id] || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Opprettet: {new Date(route.createdAt as any).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
