'use client';

import { useState } from 'react';
import { Place } from '@/lib/types';
import { getDistanceFromLatLonInKm } from '@/lib/routing-engine';
import { useGeolocation } from '@/hooks/use-geolocation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Route, 
  MapPin, 
  Navigation, 
  Loader2, 
  AlertTriangle,
  ExternalLink,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FavoriteRouteOptimizerProps {
  places: Place[];
}

export function FavoriteRouteOptimizer({ places }: FavoriteRouteOptimizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getPosition, loading: geolocating } = useGeolocation();
  const [optimizedPath, setOptimizedPath] = useState<Place[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const getValidCoords = (place: Place) => {
    if (place.coordinates && place.coordinates.lat !== 0) return place.coordinates;
    if (place.location && place.location.latitude !== 0) {
      return { lat: place.location.latitude, lng: place.location.longitude };
    }
    return null;
  };

  const solveTSP = async () => {
    setIsOptimizing(true);
    try {
      let startPos: { lat: number, lng: number } | null = null;
      try {
        startPos = await getPosition();
      } catch (e) {
        console.warn('Could not get current position, using first place as start', e);
      }

      const validPlaces = places.filter(p => getValidCoords(p) !== null);
      if (validPlaces.length === 0) {
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
    }
  };

  const navigateToStop = (place: Place) => {
    const coords = getValidCoords(place);
    if (!coords) return;
    // Use the official Directions URL for single stop navigation
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`, '_blank');
  };

  const openInGoogleMaps = (startIndex: number = 0) => {
    if (optimizedPath.length === 0) return;
    
    // Google Maps has a limit on waypoints. We batch them by 9 (origin + 8 waypoints + destination)
    const batch = optimizedPath.slice(startIndex, startIndex + 10);
    const baseUrl = 'https://www.google.com/maps/dir/';
    const waypoints = batch.map(p => {
      const coords = getValidCoords(p);
      return `${coords?.lat},${coords?.lng}`;
    }).join('/');
    
    window.open(`${baseUrl}${waypoints}`, '_blank');
  };

  const missingCoordsCount = places.length - places.filter(p => getValidCoords(p)).length;
  const isLargeRoute = optimizedPath.length > 10;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="default" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 h-11"
          onClick={() => {
            setIsOpen(true);
            solveTSP();
          }}
        >
          <Route className="mr-2 h-5 w-5" />
          Planlegg rute
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md flex flex-col h-full">
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="text-2xl font-black flex items-center gap-2">
            <Navigation className="h-6 w-6 text-indigo-600" />
            Optimert rute
          </SheetTitle>
          <SheetDescription className="font-medium">
            Vi har sortert dine favoritter for den mest effektive kjøreruten.
          </SheetDescription>
        </SheetHeader>

        {isOptimizing || geolocating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-bold animate-pulse">Beregner beste vei...</p>
          </div>
        ) : (
          <>
            <div className="py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total avstand</span>
                <span className="text-xl font-black text-slate-900">{totalDistance.toFixed(1)} km</span>
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold">
                {optimizedPath.length} stopp
              </Badge>
            </div>

            {missingCoordsCount > 0 && (
              <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium">
                  {missingCoordsCount} sted(er) mangler koordinater og er utelatt.
                </p>
              </div>
            )}

            {isLargeRoute && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 font-medium">
                  Ruten er lang ({optimizedPath.length} stopp). Google Maps fungerer best med opptil 10 stopp av gangen. Naviger til hvert sted individuelt nedenfor.
                </p>
              </div>
            )}

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 py-4">
                {optimizedPath.map((place, index) => (
                  <div key={place.id} className="group relative flex gap-4">
                    {/* Timeline Line */}
                    {index < optimizedPath.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                    )}
                    
                    {/* Number Circle */}
                    <div className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-black text-sm transition-colors",
                      index === 0 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                        : "bg-white border-slate-200 text-slate-500"
                    )}>
                      {index + 1}
                    </div>

                    <div className="flex-1 pb-6">
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group-hover:border-indigo-100">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                                <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1 line-clamp-1">{place.name}</h4>
                                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 line-clamp-1">
                                    <MapPin className="h-3 w-3" /> {place.address}
                                </p>
                            </div>
                            <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-8 w-8 rounded-full shrink-0 bg-white shadow-sm border-slate-200 text-indigo-600 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all"
                                onClick={() => navigateToStop(place)}
                            >
                                <Navigation className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        {place.estimatedDeliveryTime && (
                          <Badge variant="secondary" className="mt-2 text-[10px] h-5 bg-white border-slate-100">
                            ~{place.estimatedDeliveryTime} min
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-6 border-t mt-auto space-y-3">
              {isLargeRoute ? (
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                        onClick={() => openInGoogleMaps(0)} 
                        variant="secondary"
                        className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-xl text-xs"
                    >
                        START DEL 1 (1-10)
                    </Button>
                    <Button 
                        onClick={() => openInGoogleMaps(10)} 
                        variant="secondary"
                        className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-xl text-xs"
                    >
                        START DEL 2 (11-20)
                    </Button>
                    {optimizedPath.length > 20 && (
                        <Button 
                            onClick={() => openInGoogleMaps(20)} 
                            variant="secondary"
                            className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-xl text-xs col-span-2"
                        >
                            START DEL 3 (21+)
                        </Button>
                    )}
                </div>
              ) : (
                <Button 
                    onClick={() => openInGoogleMaps(0)} 
                    className="w-full h-12 bg-slate-900 hover:bg-black text-white font-black rounded-xl"
                >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    ÅPNE I GOOGLE MAPS
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="w-full h-12 font-bold rounded-xl border-slate-200"
              >
                LUKK
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
