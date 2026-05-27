'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { PlaceGrid } from '@/components/places/place-grid';
import { Loader2, Printer, Heart } from 'lucide-react';
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
import { doc, onSnapshot } from 'firebase/firestore';

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
    if (authUser) {
      setLoadingData(true);

      // Initial organization fetch
      firebaseDB.getUser(authUser.uid).then(userDoc => {
        if (userDoc?.orgId) {
          firebaseDB.getOrganization(userDoc.orgId).then(setOrganization);
        }
      });

      // Listen for real-time updates to user favorites
      const userRef = doc(db, 'users', authUser.uid);
      const unsub = onSnapshot(userRef, async (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const favoriteIds = (userData.favorites as string[]) || [];

          if (favoriteIds.length > 0) {
            const favoritePlaces = await Promise.all(
              favoriteIds.map(async (placeId) => {
                const place = await firebaseDB.getPlace(placeId);
                return place;
              })
            );
            setPlaces(favoritePlaces.filter(p => p !== null) as Place[]);
          } else {
            setPlaces([]);
          }
        } else {
          setPlaces([]);
        }
        setLoadingData(false);
      }, (error) => {
        console.error("Error listening to user favorites:", error);
        setLoadingData(false);
      });

      return () => unsub();
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
          <CardHeader className="px-0 pt-0 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-sm border border-red-200">
                    <Heart className="h-8 w-8 fill-red-600" />
                </div>
                <div>
                    <CardTitle className="font-headline text-3xl font-black tracking-tight text-slate-900">
                        Favoritter
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        Dine mest besøkte eller viktige leveringssteder.
                    </CardDescription>
                </div>
            </div>
            {places.length > 0 && (
              <Button variant="outline" onClick={handlePrint} className="font-bold border-slate-200">
                <Printer className="mr-2 h-4 w-4" />
                Skriv ut alle
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-0">

            
            {places.length > 0 && places.some(p => p.doorCode && p.doorCode.some(dc => dc.category === 'Nøkkel')) && (
              <div className="mb-8">
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-lg font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <Key className="h-4 w-4" /> Nøkler
                    </CardTitle>
                    <CardDescription className="font-medium">Oversikt over nøkler for dine favoritter</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {places.filter(p => p.doorCode && p.doorCode.some(dc => dc.category === 'Nøkkel')).map(place => (
                        <div key={place.id} className="p-4 border rounded-xl bg-white shadow-sm flex flex-col gap-2">
                            <p className="font-black text-sm truncate uppercase tracking-tight text-slate-800">{place.name}</p>
                            {place.doorCode?.filter(dc => dc.category === 'Nøkkel').map((dc, idx) => (
                                <div key={idx} className="bg-slate-50 border px-3 py-2 rounded-lg text-sm flex justify-between items-center gap-2">
                                    <span className="font-bold text-slate-500 text-xs">{dc.name || 'Nøkkel'}</span>
                                    <span className="font-mono font-black text-indigo-600">{dc.value}</span>
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
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 shadow-inner">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                    <Heart className="h-12 w-12 text-slate-200" />
                </div>
                <p className="text-slate-500 font-bold">Du har ingen favoritter ennå.</p>
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

function Key({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
    )
}
