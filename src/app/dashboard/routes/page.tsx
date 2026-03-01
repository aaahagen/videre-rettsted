
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function RoutesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [routes, setRoutes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // In a real app, you would get the orgId from the user's claims
      // or from a document in Firestore. For now, we'll hardcode it.
      const orgId = 'mock-org-id'; 
      firebaseDB.getRoutes(orgId).then(setRoutes);
    }
  }, [user]);

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
                  {route.distance ? `${route.distance} km` : 'Ingen distanse angitt'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Opprettet: {route.createdAt?.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
