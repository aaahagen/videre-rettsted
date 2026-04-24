
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { PlaceGrid } from '@/components/places/place-grid';
import { Loader2, Printer } from 'lucide-react';
import { DeliveryPlace, Organization, Place } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PrintPlace } from '@/components/places/print-place';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function FavoritesPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [places, setPlaces] = useState<Place[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    }
  }, [authUser, loadingAuth, router]);

  useEffect(() => {
    async function fetchData() {
      if (authUser) {
        try {
          const userDoc = await firebaseDB.getUser(authUser.uid);
          
          // Fetch Organization
          if (userDoc?.orgId) {
            const org = await firebaseDB.getOrganization(userDoc.orgId);
            setOrganization(org);
          }

          if (userDoc?.favorites && userDoc.favorites.length > 0) {
            // Fetch each favorite place by ID
            const favoritePlaces = await Promise.all(
              userDoc.favorites.map(async (placeId) => {
                const place = await firebaseDB.getPlace(placeId);
                return place;
              })
            );
            // Filter out any null results
            setPlaces(favoritePlaces.filter(p => p !== null) as Place[]);
          } else {
            setPlaces([]);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoadingData(false);
        }
      }
    }

    if (authUser) {
      fetchData();
    }
  }, [authUser]);

  const handlePrint = () => {
    window.print();
  };

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
    <>
      <div className="p-4 sm:p-6 lg:p-8 print:hidden">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0 pb-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl font-bold tracking-tight text-slate-900">
                Favoritter
              </CardTitle>
              <CardDescription className="text-slate-500">
                Dine mest besøkte eller viktige leveringssteder.
              </CardDescription>
            </div>
            {places.length > 0 && (
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Skriv ut alle
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-0">

            
            {places.length > 0 && places.some(p => p.doorCode && p.doorCode.length > 0) && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dørkoder / Nøkler</CardTitle>
                    <CardDescription>Oversikt over koder for dine favoritter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {places.filter(p => p.doorCode && p.doorCode.length > 0).map(place => (
                        <div key={place.id} className="p-4 border rounded-lg bg-slate-50 flex flex-col gap-2">
                            <p className="font-semibold text-sm truncate">{place.name}</p>
                            <p className="text-xs text-muted-foreground truncate mb-2">{place.address}</p>
                            {place.doorCode?.map((dc, idx) => (
                                <div key={idx} className="bg-white border px-3 py-2 rounded text-sm flex justify-between items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase">{dc.category}</span>
                                        <span className="font-medium text-slate-700">{dc.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-primary">{dc.value}</span>
                                </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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

      <div className="hidden print:block">
        {places.map((place) => (
          <PrintPlace key={place.id} place={place} organization={organization} />
        ))}
      </div>
    </>
  );
}
