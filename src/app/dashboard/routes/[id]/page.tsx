
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { firebaseDB } from '../../../../lib/firebase/database';
import { auth } from '../../../../lib/firebase/firebase';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Loader2 } from 'lucide-react';

export default function RouteDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [route, setRoute] = useState<any>(null);
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      firebaseDB.getRoute(id as string).then(routeData => {
        if (routeData) {
          setRoute(routeData);
          setName(routeData.name);
          setDistance(routeData.distance.toString());
        }
      });
    }
  }, [user, id]);

  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (route) {
      setIsSubmitting(true);
      try {
        await firebaseDB.updateRoute(route.id, { name, distance: parseFloat(distance) });
        router.push('/dashboard/routes');
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteRoute = async () => {
    if (route && window.confirm('Er du sikker på at du vil slette denne ruten?')) {
      await firebaseDB.deleteRoute(route.id);
      router.push('/dashboard/routes');
    }
  };

  const handleNameChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setName(value);
  };

  const handleDistanceChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setDistance(value);
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
    return null; 
  }

  if (!route) {
    return <p>Rute ble ikke funnet.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rediger Rute</h1>
      <form onSubmit={handleUpdateRoute} className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Navn</Label>
          <Input
            id="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="distance">Distanse (i km)</Label>
          <Input
            type="number"
            id="distance"
            value={distance}
            onChange={handleDistanceChange}
            required
          />
        </div>
        <div className="flex justify-between gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lagre Endringer'}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDeleteRoute} className="flex-1">
            Slett Rute
          </Button>
        </div>
      </form>
    </div>
  );
}
