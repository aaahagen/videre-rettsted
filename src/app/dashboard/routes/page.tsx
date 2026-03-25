
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
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
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/dashboard/routes/${route.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{route.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                   <p className="text-sm font-medium">{route.places?.length || 0} stopp</p>
                </div>
                {route.driverId ? (
                   <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {organizationUsers.find(u => u.id === route.driverId)?.name || 'Ukjent sjåfør'}
                   </div>
                ) : (
                   <div className="flex items-center gap-2 text-sm text-slate-400 italic">
                      Ikke tildelt sjåfør
                   </div>
                )}
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
