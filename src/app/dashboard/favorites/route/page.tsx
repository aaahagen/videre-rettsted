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
  Flag,
  ArrowDownUp,
  Settings2,
  Home,
  Warehouse
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { doc, onSnapshot } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type RouteDirection = 'nearest_first' | 'furthest_first';

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
  const [direction, setDirection] = useState<RouteDirection>('nearest_first');

  const [startPointId, setStartPointId] = useState<string>('current_gps');
  const [endPointId, setEndPointId] = useState<string>('last_stop');

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
          
          const allFetched = favoritePlaces.filter(p => p !== null) as Place[];
          setPlaces(allFetched);
          
          const withCoords = allFetched.filter(p => getValidCoords(p) !== null);
          solveTSP(withCoords, direction, startPointId, endPointId);
        } else {
          setPlaces([]);
          setOptimizedPath([]);
          setTotalDistance(0);
          setLoadingData(false);
        }
        
        if (uData.orgId) {
            const orgDoc = await firebaseDB.getOrganization(uData.orgId);
            setOrganization(orgDoc);
        }
      }
    });

    return () => unsubUser();
  }, [authUser, direction, startPointId, endPointId]);

  const getValidCoords = (place: Place) => {
    const check = (lat?: any, lng?: any) => {
        const nLat = parseFloat(String(lat));
        const nLng = parseFloat(String(lng));
        if (isNaN(nLat) || isNaN(nLng)) return null;
        if (nLat === 0 && nLng === 0) return null;
        if (nLat < -90 || nLat > 90 || nLng < -180 || nLng > 180) return null;
        return { lat: nLat, lng: nLng };
    };
    if (place.coordinates) {
        const c = check(place.coordinates.lat, place.coordinates.lng);
        if (c) return c;
    }
    if (place.location) {
        const c = check(place.location.latitude, place.location.longitude);
        if (c) return c;
    }
    return null;
  };

  const solveTSP = async (inputPlaces: Place[], currentDirection: RouteDirection, startId: string, endId: string) => {
    setIsOptimizing(true);
    try {
      let startCoords: { lat: number, lng: number } | null = null;
      let endCoords: { lat: number, lng: number } | null = null;

      // Handle Start Point
      if (startId === 'current_gps') {
        try {
          startCoords = await getPosition();
        } catch (e) {
          console.warn('Could not get GPS position', e);
        }
      } else if (startId === 'org_depot' && organization?.mainDepot) {
        startCoords = organization.mainDepot.coordinates;
      } else {
        const p = inputPlaces.find(pl => pl.id === startId);
        if (p) startCoords = getValidCoords(p);
      }

      // Handle End Point
      if (endId === 'org_depot' && organization?.mainDepot) {
        endCoords = organization.mainDepot.coordinates;
      } else if (endId !== 'last_stop') {
        const p = inputPlaces.find(pl => pl.id === endId);
        if (p) endCoords = getValidCoords(p);
      }

      if (inputPlaces.length === 0) {
        setOptimizedPath([]);
        setTotalDistance(0);
        setLoadingData(false);
        setIsOptimizing(false);
        return;
      }

      let pool = [...inputPlaces];
      let fixedStartPlace = inputPlaces.find(p => p.id === startId);
      let fixedEndPlace = inputPlaces.find(p => p.id === endId);
      
      if (fixedStartPlace) pool = pool.filter(p => p.id !== startId);
      if (fixedEndPlace && fixedEndPlace.id !== startId) pool = pool.filter(p => p.id !== endId);

      const runGreedy = (origin: { lat: number, lng: number }, deliveryPool: Place[], targetEnd?: { lat: number, lng: number } | null, furthestFirst: boolean = false) => {
        let currentPos = origin;
        const remaining = [...deliveryPool];
        const path: Place[] = [];
        let distance = 0;

        if (furthestFirst) {
            let furthestIdx = -1;
            let maxDist = -1;
            for (let i = 0; i < remaining.length; i++) {
                const coords = getValidCoords(remaining[i])!;
                const d = getDistanceFromLatLonInKm(origin.lat, origin.lng, coords.lat, coords.lng);
                if (d > maxDist) {
                    maxDist = d;
                    furthestIdx = i;
                }
            }
            if (furthestIdx !== -1) {
                const p = remaining.splice(furthestIdx, 1)[0];
                path.push(p);
                distance += maxDist;
                currentPos = getValidCoords(p)!;
            }
        }

        while (remaining.length > 0) {
          let bestIdx = -1;
          let minDist = Infinity;
          for (let i = 0; i < remaining.length; i++) {
            const coords = getValidCoords(remaining[i])!;
            const d = getDistanceFromLatLonInKm(currentPos.lat, currentPos.lng, coords.lat, coords.lng);
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

        if (targetEnd) {
            distance += getDistanceFromLatLonInKm(currentPos.lat, currentPos.lng, targetEnd.lat, targetEnd.lng);
        }

        return { path, distance };
      };

      const origin = startCoords || getValidCoords(inputPlaces[0])!;
      const result = runGreedy(origin, pool, endCoords, currentDirection === 'furthest_first');
      
      let finalPath = result.path;
      if (fixedStartPlace) finalPath = [fixedStartPlace, ...finalPath];
      if (fixedEndPlace && fixedEndPlace.id !== startId) finalPath = [...finalPath, fixedEndPlace];

      setOptimizedPath(finalPath);
      setTotalDistance(result.distance);
    } finally {
      setIsOptimizing(false);
      setLoadingData(false);
    }
  };

  const navigateToStop = (place: Place) => {
    const coords = getValidCoords(place);
    if (!coords) return;
    const origin = userCoords ? `&origin=${userCoords.lat.toFixed(6)},${userCoords.lng.toFixed(6)}` : '';
    const url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}&travelmode=driving`;
    window.location.href = url;
  };

  const openInGoogleMaps = (startIndex: number = 0) => {
    if (optimizedPath.length === 0) return;
    const BATCH_SIZE = 8;
    const batch = optimizedPath.slice(startIndex, startIndex + BATCH_SIZE);
    if (batch.length === 0) return;
    const formatC = (c: {lat: number, lng: number}) => `${c.lat.toFixed(6)},${c.lng.toFixed(6)}`;
    
    let originStr = '';
    let waypointPlaces: Place[] = [];
    const destPlace = batch[batch.length - 1];
    const destinationStr = formatC(getValidCoords(destPlace)!);

    if (startIndex === 0) {
        if (startPointId === 'current_gps' && userCoords) {
            originStr = formatC(userCoords);
            waypointPlaces = batch.slice(0, -1);
        } else if (startPointId === 'org_depot' && organization?.mainDepot) {
            originStr = formatC(organization.mainDepot.coordinates);
            waypointPlaces = batch.slice(0, -1);
        } else {
            const firstPlace = batch[0];
            originStr = formatC(getValidCoords(firstPlace)!);
            waypointPlaces = batch.slice(1, -1);
        }
    } else {
      const firstPlace = batch[0];
      originStr = formatC(getValidCoords(firstPlace)!);
      waypointPlaces = batch.slice(1, -1);
    }

    const waypointsStr = waypointPlaces.map(p => formatC(getValidCoords(p)!)).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}&waypoints=${encodeURIComponent(waypointsStr)}&travelmode=driving`;
    window.location.href = url;
  };

  const missingCoordsCount = places.length - places.filter(p => getValidCoords(p)).length;
  const isLargeRoute = optimizedPath.length > 8;

  const locationOptions = [
    { id: 'current_gps', name: '📍 Min Posisjon', type: 'gps' },
    ...(organization?.mainDepot ? [{ id: 'org_depot', name: '🏢 Hoveddepot', type: 'depot' }] : []),
    ...places.filter(p => getValidCoords(p)).map(p => ({ id: p.id, name: `⭐️ ${p.name}`, type: 'place' }))
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full shrink-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3 truncate">
              <RouteIcon className="h-6 w-6 sm:h-8 sm:8 text-indigo-600 shrink-0" />
              <span className="truncate">Planlagt Rute</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base truncate">
              Din mest effektive vei gjennom dine favoritter.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-3 py-1 text-xs sm:text-sm">
                {optimizedPath.length} stopp
            </Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-bold px-3 py-1 text-xs sm:text-sm">
                {totalDistance.toFixed(1)} km totalt
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden min-w-0">
            <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <Settings2 className="h-4 w-4" /> Rute-innstillinger
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Startsted</label>
                        <Select value={startPointId} onValueChange={setStartPointId}>
                            <SelectTrigger className="rounded-xl border-slate-200 font-bold text-slate-700 h-11">
                                <SelectValue placeholder="Velg start" />
                            </SelectTrigger>
                            <SelectContent>
                                {locationOptions.map(opt => (
                                    <SelectItem key={opt.id} value={opt.id} className="font-bold">{opt.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Endested</label>
                        <Select value={endPointId} onValueChange={setEndPointId}>
                            <SelectTrigger className="rounded-xl border-slate-200 font-bold text-slate-700 h-11">
                                <SelectValue placeholder="Velg slutt" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="last_stop" className="font-bold">🏁 Siste levering</SelectItem>
                                {locationOptions.filter(o => o.id !== 'current_gps').map(opt => (
                                    <SelectItem key={opt.id} value={opt.id} className="font-bold">{opt.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <ArrowDownUp className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">{direction === 'nearest_first' ? 'Nærmeste først' : 'Lengst unna først'}</p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setDirection(d => d === 'nearest_first' ? 'furthest_first' : 'nearest_first')}
                        className="font-bold rounded-xl border-slate-200 h-10 px-4"
                    >
                        Bytt retning
                    </Button>
                </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden min-w-0">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Navigation className="h-4 w-4" /> Kjøreplan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {isOptimizing ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                  <p className="text-slate-500 font-bold animate-pulse">Beregner rute...</p>
                </div>
              ) : optimizedPath.length > 0 ? (
                <div className="space-y-4">
                  
                  {startPointId === 'current_gps' && userCoords && (
                    <div className="relative flex gap-4 sm:gap-6">
                      <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100" />
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div className="flex-1 pb-10 min-w-0">
                        <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-100 bg-indigo-50/20">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">START</p>
                          <h4 className="font-black text-slate-900 text-lg truncate">Din nåværende posisjon</h4>
                        </div>
                      </div>
                    </div>
                  )}

                  {startPointId === 'org_depot' && organization?.mainDepot && (
                    <div className="relative flex gap-4 sm:gap-6">
                      <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100" />
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-amber-50 border-amber-100 text-amber-600 shadow-sm">
                        <Warehouse className="h-6 w-6" />
                      </div>
                      <div className="flex-1 pb-10 min-w-0">
                        <div className="p-4 rounded-2xl border-2 border-dashed border-amber-100 bg-amber-50/20">
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">START</p>
                          <h4 className="font-black text-slate-900 text-lg truncate">{organization.name} Depot</h4>
                          <p className="text-xs text-slate-500 truncate">{organization.mainDepot.address}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {optimizedPath.map((place, index) => (
                    <div key={place.id} className="relative flex gap-4 sm:gap-6 group min-w-0">
                      {(index < optimizedPath.length - 1 || endPointId !== 'last_stop') && (
                        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                      )}
                      
                      <div className={cn(
                        "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-black text-lg transition-all",
                        (index === 0 && startPointId === place.id) || (index === optimizedPath.length -1 && endPointId === place.id)
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110" 
                          : "bg-white border-slate-200 text-slate-500"
                      )}>
                        {index + 1}
                      </div>

                      <div className="flex-1 pb-10 min-w-0">
                        <div className="p-4 sm:p-5 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group-hover:translate-x-1 min-w-0">
                          <div className="flex justify-between items-start gap-4 min-w-0">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg sm:text-xl mb-1 truncate">{place.name}</h4>
                              <p className="text-slate-500 font-medium text-sm flex items-center gap-2 truncate">
                                <MapPin className="h-4 w-4 text-slate-400 shrink-0" /> {place.address}
                              </p>
                            </div>
                            <Button 
                              onClick={() => navigateToStop(place)}
                              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shrink-0 p-0"
                            >
                              <Navigation className="h-5 w-5 sm:h-6 sm:w-6" />
                            </Button>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {place.estimatedDeliveryTime && (
                              <Badge variant="secondary" className="bg-white border-slate-100 text-slate-600 font-bold text-[10px] sm:text-xs">
                                ~{place.estimatedDeliveryTime} min levering
                              </Badge>
                            )}
                            {place.id === startPointId && <Badge className="bg-indigo-600 text-white border-transparent">START</Badge>}
                            {place.id === endPointId && <Badge className="bg-emerald-600 text-white border-transparent">SLUTT</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {endPointId === 'org_depot' && organization?.mainDepot && (
                    <div className="relative flex gap-4 sm:gap-6">
                        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm">
                            <Flag className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/20">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">SLUTT</p>
                                <h4 className="font-black text-emerald-900 text-lg uppercase tracking-tight truncate">{organization.name} Depot</h4>
                                <p className="text-xs text-emerald-500 truncate">{organization.mainDepot.address}</p>
                            </div>
                        </div>
                    </div>
                  )}

                  {endPointId === 'last_stop' && (
                    <div className="relative flex gap-4 sm:gap-6">
                        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm">
                            <Flag className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/20">
                                <h4 className="font-black text-emerald-900 text-lg uppercase tracking-tight truncate">Rute Slutt</h4>
                            </div>
                        </div>
                    </div>
                  )}
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
          <Card className="border-none shadow-sm bg-indigo-600 text-white rounded-3xl lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tight">Navigasjon</CardTitle>
              <CardDescription className="text-indigo-100 font-medium">Start din rute i Google Maps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLargeRoute && (
                <div className="p-4 bg-indigo-500/50 rounded-2xl border border-indigo-400 flex items-start gap-3">
                  <Info className="h-5 w-5 shrink-0" />
                  <p className="text-xs font-medium">
                    Google Maps har en begrensning på antall stopp. Vi har delt opp ruten din i deler for maksimal pålitelighet.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {isLargeRoute ? (
                  (() => {
                    const buttons = [];
                    const BATCH_SIZE = 8;
                    let currentStart = 0;
                    let partNum = 1;
                    
                    while (currentStart < optimizedPath.length - 1) {
                      const endNum = Math.min(currentStart + BATCH_SIZE, optimizedPath.length);
                      const startIdx = currentStart;
                      buttons.push(
                        <Button 
                          key={startIdx}
                          onClick={() => openInGoogleMaps(startIdx)} 
                          className={cn(
                            "w-full h-16 font-black rounded-2xl text-lg shadow-lg transition-all active:scale-95",
                            partNum === 1 
                                ? "bg-white text-indigo-600 hover:bg-indigo-50" 
                                : "bg-indigo-500 hover:bg-indigo-400 text-white border-2 border-indigo-400"
                          )}
                        >
                          START DEL {partNum} ({currentStart + 1}-{endNum})
                        </Button>
                      );
                      currentStart += (BATCH_SIZE - 1); 
                      partNum++;
                    }
                    return buttons;
                  })()
                ) : (
                  <Button 
                    onClick={() => openInGoogleMaps(0)} 
                    className="w-full h-20 bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-2xl text-xl shadow-lg transition-all active:scale-95"
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
                <span className="font-black text-slate-900 truncate max-w-[120px] text-right">
                    {locationOptions.find(o => o.id === startPointId)?.name.split(' ').slice(1).join(' ') || 'Min Posisjon'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 font-medium text-sm">Endested</span>
                <span className="font-black text-slate-900 truncate max-w-[120px] text-right">
                    {endPointId === 'last_stop' ? 'Siste stopp' : locationOptions.find(o => o.id === endPointId)?.name.split(' ').slice(1).join(' ') || 'Depot'}
                </span>
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
