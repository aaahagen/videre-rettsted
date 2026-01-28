
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '../../../lib/firebase/database';
import { auth } from '../../../lib/firebase/firebase';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Loader2 } from 'lucide-react';

export default function NewRoutePage() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setIsSubmitting(true);
      try {
        // In a real app, you would get the orgId from the user's claims
        // or from a document in Firestore. For now, we'll hardcode it.
        const orgId = 'mock-org-id'; 
        await firebaseDB.createRoute({ name, distance: parseFloat(distance), orgId });
        router.push('/dashboard/routes');
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Opprett Ny Rute</h1>
      <form onSubmit={handleCreateRoute} className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Navn</Label>
          <Input
            id="name"
            value={name}
            onChange={handleNameChange}
            required
            placeholder="F.eks. Oslo - Bergen"
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
            placeholder="0.0"
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Opprett Rute'}
        </Button>
      </form>
    </div>
  );
}
