
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { PlaceGrid } from '@/components/places/place-grid';
import { Loader2, Star } from 'lucide-react';
import { DeliveryPlace, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { doc, onSnapshot } from 'firebase/firestore';

export default function DashboardPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [places, setPlaces] = useState<DeliveryPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    }
  }, [authUser, loadingAuth, router]);

  // Listen to user document for real-time favorites updates
  useEffect(() => {
    if (!authUser) return;

    const unsub = onSnapshot(doc(db, 'users', authUser.uid), (doc) => {
      if (doc.exists()) {
        setUserData({ ...doc.data(), id: doc.id } as User);
      }
    });

    return () => unsub();
  }, [authUser]);

  // Fetch places
  useEffect(() => {
    async function fetchPlaces() {
      if (userData?.orgId) {
        try {
          const placesData = await firebaseDB.getPlaces(userData.orgId);
          setPlaces(placesData as DeliveryPlace[]);
        } catch (error) {
          console.error('Error fetching places:', error);
        } finally {
          setLoadingPlaces(false);
        }
      }
    }

    if (userData?.orgId) {
      fetchPlaces();
    }
  }, [userData?.orgId]);

  // Derived filtered and sorted places
  const displayedPlaces = useMemo(() => {
    let result = [...places];

    // Filter by favorites if toggled
    if (showOnlyFavorites) {
      const favoriteIds = userData?.favorites || [];
      result = result.filter((place) => favoriteIds.includes(place.id));
    }

    // Always sort alphabetically by name
    return result.sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  }, [places, showOnlyFavorites, userData?.favorites]);

  const isLoading = loadingAuth || (loadingPlaces && !places.length);

  if (isLoading) {
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
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900">
            Leveringssteder
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={cn(
              "rounded-full transition-all duration-200",
              showOnlyFavorites 
                ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm scale-110" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            )}
            title={showOnlyFavorites ? "Vis alle steder" : "Vis kun favoritter"}
          >
            <Star 
              className={cn(
                "h-6 w-6 transition-colors",
                showOnlyFavorites ? "fill-current" : "fill-none"
              )} 
            />
          </Button>
        </div>
      </div>

      {displayedPlaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-slate-100 p-6 mb-4">
            <Star className="h-12 w-12 text-slate-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            {showOnlyFavorites ? "Ingen favoritter ennå" : "Ingen leveringssteder funnet"}
          </h2>
          <p className="text-slate-500 mt-2 max-w-xs">
            {showOnlyFavorites 
              ? "Klikk på stjernen på et leveringssted for å legge det til i dine favoritter."
              : "Det er ingen leveringssteder registrert for din organisasjon ennå."}
          </p>
          {showOnlyFavorites && (
            <Button 
              variant="link" 
              onClick={() => setShowOnlyFavorites(false)}
              className="mt-4"
            >
              Vis alle leveringssteder
            </Button>
          )}
        </div>
      ) : (
        <PlaceGrid places={displayedPlaces} />
      )}
    </div>
  );
}
