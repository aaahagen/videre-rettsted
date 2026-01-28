
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { PlaceGrid } from '@/components/places/place-grid';
import { Loader2 } from 'lucide-react';
import { DeliveryPlace } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FavoritesPage() {
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
    async function fetchFavorites() {
      if (authUser) {
        try {
          const userDoc = await firebaseDB.getUser(authUser.uid);
          if (userDoc?.favorites && userDoc.favorites.length > 0) {
            // Fetch each favorite place by ID
            const favoritePlaces = await Promise.all(
              userDoc.favorites.map(async (placeId) => {
                const place = await firebaseDB.getPlace(placeId);
                return place;
              })
            );
            // Filter out any null results and cast to DeliveryPlace
            setPlaces(favoritePlaces.filter(p => p !== null) as DeliveryPlace[]);
          } else {
            setPlaces([]);
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setLoadingData(false);
        }
      }
    }

    if (authUser) {
      fetchFavorites();
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
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 pb-8">
          <CardTitle className="font-headline text-2xl font-bold tracking-tight text-slate-900">
            Favoritter
          </CardTitle>
          <CardDescription className="text-slate-500">
            Dine mest besøkte eller viktige leveringssteder.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {places.length > 0 ? (
            <PlaceGrid places={places} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-dashed">
              <p className="text-slate-500 font-medium">Du har ingen favoritter ennå.</p>
              <p className="text-sm text-slate-400 mt-1">Trykk på hjertet på et sted for å legge det til her.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
