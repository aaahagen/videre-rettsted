'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function NewRoutePage() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState('');
  const [shipmentNumber, setShipmentNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
        const userDoc = await firebaseDB.getUser(user.uid);
        const orgId = userDoc?.orgId;
        if(!orgId) throw new Error('No orgId'); 
        const newRoute = await firebaseDB.createRoute({ name, shipmentNumber, date, places: [], orgId });

        // Create a new manifest for the newly created route
        await firebaseDB.createManifest({
          orgId,
          routeId: newRoute.id,
          vehicleId: '', // Initially no vehicle assigned
          status: 'pending', // Initial status
          orders: [], // No orders initially
        });

        router.push(`/dashboard/routes/${newRoute.id}`);
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
  
  const handleShipmentNumberChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setShipmentNumber(value);
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
          <Label htmlFor="name">Rutenavn</Label>
          <Input
            id="name"
            value={name}
            onChange={handleNameChange}
            required
            placeholder="F.eks. Oslo - Bergen"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shipmentNumber">Fraktnummer (valgfritt)</Label>
          <Input
            id="shipmentNumber"
            value={shipmentNumber}
            onChange={handleShipmentNumberChange}
            placeholder="F.eks. SH-12345"
          />
        </div>
        <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 h-12 text-lg">
                Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 text-lg">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Opprett Rute'}
            </Button>
        </div>
      </form>
    </div>
  );
}
