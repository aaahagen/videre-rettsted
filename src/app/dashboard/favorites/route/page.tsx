'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { useGeolocation } from '@/hooks/use-geolocation';
import { getDistanceFromLatLonInKm } from '@/lib/routing-engine';
import { Place, User, Organization } from '@/lib/types';
import { 
  Loader2, 
  MapPin, 
  Navigation, 
  ChevronLeft, 
  ExternalLink, 
  AlertTriangle, 
  Info,
  Route as RouteIcon,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, onSnapshot } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function FavoriteRoutePage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const { getPosition, loading: geolocating, coordinates: userCoords } = useGeolocation();
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [optimizedPath, setOptimizedPath] = useState<Place[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    }
  }, [authUser, loadingAuth, router]);

  useEffect(() => {
    if (!authUser) return;
    
    const unsubUser = onSnapshot(doc(db, 'users', authUser.uid), async (userDoc) => {
      if (userDoc.exists()) {
        const uData = userDoc.data() as User;
        const favoriteIds = uData.favorites || [];
        
        if (favoriteIds.length > 0) {
          const favoritePlaces = await Promise.all(
            favoriteIds.map(async (placeId) => {
              return await firebaseDB.getPlace(placeId);
            })
          );
          const validPlaces = favoritePlaces.filter(p => p !== null) as Place[];
          setPlaces(validPlaces);
          solveTSP(validPlaces);
        } else {
          setPlaces([]);
          setLoadingData(false);
        }
        
        if (uData.orgId) {
            const orgDoc = await firebaseDB.getOrganization(uData.orgId);
            setOrganization(orgDoc);
        }
      }
    });

    return () => unsubUser();
  }, [authUser]);

  const getValidCoords = (place: Place) => {
    if (place.coordinates && place.coordinates.lat !== 0) return place.coordinates;
    if (place.location && place.location.latitude !== 0) {
      return { lat: place.location.latitude, lng: place.location.longitude };
    }
    return null;
  };

  const solveTSP = async (inputPlaces: Place[]) => {
    setIsOptimizing(true);
    try {
      let startPos: { lat: number, lng: number } | null = null;
      try {
        startPos = await getPosition();
      } catch (e) {
        console.warn('Could not get current position', e);
      }

      const validPlaces = inputPlaces.filter(p => getValidCoords(p) !== null);
      if (validPlaces.length === 0) {
        setLoadingData(false);
        setIsOptimizing(false);
        return;
      }

      let currentPos = startPos || getValidCoords(validPlaces[0])!;
      const remaining = [...validPlaces];
      const path: Place[] = [];
      let distance = 0;

      while (remaining.length > 0) {
        let bestIdx = -1;
        let minDist = Infinity;

        for (let i = 0; i < remaining.length; i++) {
          const coords = getValidCoords(remaining[i])!;
          const d = getDistanceFromLatLonInKm(
            currentPos.lat,
            currentPos.lng,
            coords.lat,
            coords.lng
          );
          if (d < minDist) {
            minDist = d;
            bestIdx = i;
          }
        }

        const nextPlace = remaining.splice(bestIdx, 1)[0];
        path.push(nextPlace);
        distance += minDist;
        currentPos = getValidCoords(nextPlace)!;
      }

      setOptimizedPath(path);
      setTotalDistance(distance);
    } finally {
      setIsOptimizing(false);
      setLoadingData(false);
    }
  };

  const navigateToStop = (place: Place) => {
    const coords = getValidCoords(place);
    if (!coords) return;
    const origin = userCoords ? `&origin=${userCoords.lat},${userCoords.lng}` : '';
    const url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${coords.lat},${coords.lng}&travelmode=driving`;
    window.location.href = url;
  };

  const openInGoogleMaps = (startIndex: number = 0) => {
    if (optimizedPath.length === 0) return;
    
    // Official Directions API format: 
    // Origin + Destination + up to 9 waypoints = 11 points total.
    const batch = optimizedPath.slice(startIndex, startIndex + 10);
    
    if (batch.length === 0) return;

    const destPlace = batch[batch.length - 1];
    const destCoords = getValidCoords(destPlace);
    const destination = `${destCoords?.lat},${destCoords?.lng}`;

    let origin = '';
    let waypointPlaces = [];

    if (userCoords) {
      origin = `${userCoords.lat},${userCoords.lng}`;
      waypointPlaces = batch.slice(0, -1); // All batch items except the last one are waypoints
    } else {
      const firstPlace = batch[0];
      const firstCoords = getValidCoords(firstPlace);
      origin = `${firstCoords?.lat},${firstCoords?.lng}`;
      waypointPlaces = batch.slice(1, -1); // Items between first and last are waypoints
    }

    const waypoints = waypointPlaces.map(p => {
      const c = getValidCoords(p);
      return `${c?.lat},${c?.lng}`;
    }).join('|');

    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
    
    window.location.href = url;
  };

  if (loadingAuth || (loadingData && authUser)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const missingCoordsCount = places.length - optimizedPath.length;
  const isLargeRoute = optimizedPath.length > 10;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <RouteIcon className="h-8 w-8 text-indigo-600" />
              Planlagt Rute
            </h1>
            <p className="text-slate-500 font-medium">
              Din mest effektive vei gjennom dine favoritter.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-3 py-1 text-sm">
                {optimizedPath.length} stopp
            </Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-bold px-3 py-1 text-sm">
                {totalDistance.toFixed(1)} km totalt
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Navigation className="h-4 w-4" /> Kjøreplan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isOptimizing ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                  <p className="text-slate-500 font-bold animate-pulse">Beregner rute...</p>
                </div>
              ) : optimizedPath.length > 0 ? (
                <div className="space-y-4">
                  {userCoords && (
                    <div className="relative flex gap-6">
                      <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100" />
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div className="flex-1 pb-10">
                        <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-100 bg-indigo-50/20">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Startpunkt</p>
                          <h4 className="font-black text-slate-900 text-lg">Din nåværende posisjon</h4>
                        </div>
                      </div>
                    </div>
                  )}

                  {optimizedPath.map((place, index) => (
                    <div key={place.id} className="relative flex gap-6 group">
                      {index < optimizedPath.length - 1 && (
                        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                      )}
                      
                      <div className={cn(
                        "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-black text-lg transition-all",
                        index === 0 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110" 
                          : "bg-white border-slate-200 text-slate-500"
                      )}>
                        {index + 1}
                      </div>

                      <div className="flex-1 pb-10">
                        <div className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group-hover:translate-x-1">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl mb-1">{place.name}</h4>
                              <p className="text-slate-500 font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" /> {place.address}
                              </p>
                            </div>
                            <Button 
                              onClick={() => navigateToStop(place)}
                              className="h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shrink-0"
                            >
                              <Navigation className="h-6 w-6" />
                            </Button>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {place.estimatedDeliveryTime && (
                              <Badge variant="secondary" className="bg-white border-slate-100 text-slate-600 font-bold">
                                ~{place.estimatedDeliveryTime} min levering
                              </Badge>
                            )}
                            {place.customerNumber && (
                              <Badge variant="outline" className="bg-slate-100 text-slate-500 border-transparent font-mono">
                                #{place.customerNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="relative flex gap-6">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm">
                      <Flag className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/20">
                        <h4 className="font-black text-emerald-900 text-lg uppercase tracking-tight">Rute Slutt</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-500 font-bold">Ingen gyldige steder å planlegge rute med.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-indigo-600 text-white rounded-3xl sticky top-8">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Navigasjon</CardTitle>
              <CardDescription className="text-indigo-100 font-medium">Start din rute i Google Maps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLargeRoute && (
                <div className="p-4 bg-indigo-500/50 rounded-2xl border border-indigo-400 flex items-start gap-3">
                  <Info className="h-5 w-5 shrink-0" />
                  <p className="text-xs font-medium">
                    Google Maps har en begrensning på 10 stopp. Vi har delt opp ruten din i deler.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {isLargeRoute ? (
                  <>
                    <Button 
                      onClick={() => openInGoogleMaps(0)} 
                      className="w-full h-16 bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-2xl text-lg shadow-lg"
                    >
                      START DEL 1 (1-10)
                    </Button>
                    {optimizedPath.length > 10 && (
                        <Button 
                        onClick={() => openInGoogleMaps(10)} 
                        className="w-full h-16 bg-indigo-500 hover:bg-indigo-400 text-white border-2 border-indigo-400 font-black rounded-2xl text-lg"
                        >
                        START DEL 2 (11-20)
                        </Button>
                    )}
                    {optimizedPath.length > 20 && (
                      <Button 
                        onClick={() => openInGoogleMaps(20)} 
                        className="w-full h-16 bg-indigo-500 hover:bg-indigo-400 text-white border-2 border-indigo-400 font-black rounded-2xl text-lg"
                      >
                        START DEL 3 (21+)
                      </Button>
                    )}
                  </>
                ) : (
                  <Button 
                    onClick={() => openInGoogleMaps(0)} 
                    className="w-full h-20 bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-2xl text-xl shadow-lg"
                  >
                    <ExternalLink className="mr-3 h-6 w-6" />
                    START RUTE
                  </Button>
                )}
              </div>

              {missingCoordsCount > 0 && (
                <div className="mt-6 p-4 bg-amber-500/20 rounded-2xl border border-amber-400/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-200" />
                  <p className="text-xs font-medium text-amber-50">
                    {missingCoordsCount} favoritter mangler koordinater og er utelatt fra den automatiske ruten.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase text-slate-400 tracking-widest">Informasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium text-sm">Foreslått rekkefølge</span>
                <span className="font-black text-slate-900">Optimert</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium text-sm">Startsted</span>
                <span className="font-black text-slate-900">Min Posisjon</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium text-sm">Est. Kjørelengde</span>
                <span className="font-black text-slate-900">{totalDistance.toFixed(1)} km</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
