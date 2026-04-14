'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { PlaceGrid } from '@/components/places/place-grid';
import { Loader2, Star, SearchX, MapPin } from 'lucide-react';
import { DeliveryPlace, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { doc, onSnapshot } from 'firebase/firestore';
import { useSearch } from '@/hooks/use-search';

export default function PlacesPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [places, setPlaces] = useState<DeliveryPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const { query: searchQuery, setQuery, setContext } = useSearch();
  const router = useRouter();

  useEffect(() => {
    setContext('Steder', '/dashboard/new');
  }, [setContext]);

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    }
  }, [authUser, loadingAuth, router]);

  useEffect(() => {
    if (!authUser) return;
    const unsub = onSnapshot(doc(db, 'users', authUser.uid), (doc) => {
      if (doc.exists()) {
        setUserData({ ...doc.data(), id: doc.id } as User);
      }
    });
    return () => unsub();
  }, [authUser]);

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

  const displayedPlaces = useMemo(() => {
    let result = [...places];
    if (showOnlyFavorites) {
      const favoriteIds = userData?.favorites || [];
      result = result.filter((place) => favoriteIds.includes(place.id));
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      result = result.filter(place => 
        place.name.toLowerCase().includes(lowerQuery) || 
        place.address.toLowerCase().includes(lowerQuery) ||
        place.description.toLowerCase().includes(lowerQuery) ||
        (place.hashtags && place.hashtags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  }, [places, showOnlyFavorites, userData?.favorites, searchQuery]);

  if (loadingAuth || (loadingPlaces && !places.length)) {
    return <SplashScreen />;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900">
                {searchQuery ? `Søkeresultater for "${searchQuery}"` : 'Leveringssteder'}
            </h1>
            <p className="text-slate-500 text-sm hidden sm:block">Full oversikt over din organisasjons leveringspunkter.</p>
          </div>
          
          {!searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={cn(
                "rounded-full transition-all duration-200 ml-2",
                showOnlyFavorites 
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm scale-110" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              )}
            >
              <Star className={cn("h-6 w-6 transition-colors", showOnlyFavorites ? "fill-current" : "fill-none")} />
            </Button>
          )}
        </div>
        {searchQuery && <Button variant="outline" size="sm" onClick={() => setQuery('')}>Nullstill søk</Button>}
      </div>

      {displayedPlaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed">
          <div className="rounded-full bg-slate-100 p-6 mb-4">
            {searchQuery ? <SearchX className="h-12 w-12 text-slate-300" /> : <Star className="h-12 w-12 text-slate-300" />}
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            {searchQuery ? `Ingen steder matchet "${searchQuery}"` : showOnlyFavorites ? "Ingen favoritter ennå" : "Ingen leveringssteder funnet"}
          </h2>
          {(showOnlyFavorites || searchQuery) && (
            <Button variant="link" onClick={() => { setShowOnlyFavorites(false); setQuery(''); }} className="mt-4">
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
