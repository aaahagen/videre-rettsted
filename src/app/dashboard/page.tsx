'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { PlaceGrid } from '@/components/places/place-grid';
import { Loader2 } from 'lucide-react';
import { DeliveryPlace } from '@/lib/types';

export default function DashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [places, setPlaces] = useState<DeliveryPlace[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    }
  }, [authUser, loadingAuth, router]);

  useEffect(() => {
    async function fetchPlaces() {
      if (authUser) {
        try {
          const userDoc = await firebaseDB.getUser(authUser.uid);
          if (userDoc?.orgId) {
            const placesData = await firebaseDB.getPlaces(userDoc.orgId);
            setPlaces(placesData as DeliveryPlace[]);
          }
        } catch (error) {
          console.error('Error fetching places:', error);
        } finally {
          setLoadingData(false);
        }
      }
    }

    if (authUser) {
      fetchPlaces();
    }
  }, [authUser]);

  if (loadingAuth || (loadingData && authUser)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900">
            Leveringssteder
          </h1>
        </div>
      </div>

      <PlaceGrid places={places} />
    </div>
  );
}
