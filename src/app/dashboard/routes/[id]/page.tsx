
'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft, Clock, Car, ExternalLink, CheckCircle2, Circle, Coffee, Wrench, Home, Flag, Info, FileText } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { deleteField } from 'firebase/firestore';

import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Place, Route } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

type RouteItemType = 'place' | 'start' | 'end' | 'break' | 'service';

interface RouteItem {
  id: string; // Unique ID for DnD
  type: RouteItemType;
  placeId?: string; // Only for 'place'
  placeData?: Place; // Only for 'place'
  duration?: number; // Only for non-'place'
}

function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center w-full">
      <div {...listeners} style={{ touchAction: 'none' }} className="p-3 cursor-grab hover:bg-slate-100 rounded-md shrink-0 self-stretch flex items-center">
         <GripVertical className="text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

export default function RouteDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  
  // The combined list of places and special intervals
  const [routeItems, setRouteItems] = useState<RouteItem[]>([]);
  
  const [distance, setDistance] = useState('N/A');
  const [duration, setDuration] = useState('N/A');
  
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [routeNotes, setRouteNotes] = useState('');
  const [prepTimeStart, setPrepTimeStart] = useState<number>(0);
  const [prepTimeEnd, setPrepTimeEnd] = useState<number>(0);
  const [breakTime, setBreakTime] = useState<number>(0);
  const [fuelServiceTime, setFuelServiceTime] = useState<number>(0);
  const [baseDurationSeconds, setBaseDurationSeconds] = useState<number>(0);
  
  // Track completed stops (using the RouteItem id)
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});

  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      // Press and hold for 250ms before dragging
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCalculateDistance = useMemo(() => {
    return (items: RouteItem[], currentStartAddress: string, currentEndAddress: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsCalculating(true); // Start calculating immediately

      timeoutRef.current = setTimeout(async () => {
        const functions = getFunctions();
        const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
        
        const placesToCalculate = items
           .filter(item => item.type === 'place' && item.placeId)
           .map(item => item.placeId!);
           
        let totalPoints = placesToCalculate.length;
        if (currentStartAddress) totalPoints++;
        if (currentEndAddress) totalPoints++;

        if (totalPoints < 2) {
          setDistance('N/A');
          setBaseDurationSeconds(0);
          setIsCalculating(false);
          return;
        }

        try {
          const result = await calculateDistanceFn({ 
              placeIds: placesToCalculate,
              startAddress: currentStartAddress,
              endAddress: currentEndAddress
          });
          const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
          setDistance(`${data.distance.toFixed(1)} km`);
          setBaseDurationSeconds(data.duration || 0);
        } catch (err: any) {
          console.error('Detailed error calculating distance:', err);
          setDistance('Error');
          setBaseDurationSeconds(0);
          toast({
            title: 'Error Calculating Distance',
            description: err.details?.error_message || err.message || 'An unknown error occurred.',
            variant: 'destructive',
          });
        } finally {
          setIsCalculating(false);
        }
      }, 800);
    };
  }, [toast]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user && routeId) {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          const userDoc = await firebaseDB.getUser(user.uid);
          if (userDoc) {
            setUserData(userDoc);
          }
          if (userDoc?.orgId) {
            const [routeData, placesData, usersData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
            ]);
            setOrganizationUsers(usersData);
            
            setRoute(routeData);
            setAllPlaces(placesData);
            setRouteNotes(routeData?.notes || '');
            
            const legacyBaseAddress = (routeData as any).baseAddress || '';
            const savedStart = routeData?.startAddress || legacyBaseAddress;
            const savedEnd = routeData?.endAddress || legacyBaseAddress;

            setStartAddress(savedStart);
            setEndAddress(savedEnd);
            
            setPrepTimeStart(routeData?.prepTimeStart || 0);
            setPrepTimeEnd(routeData?.prepTimeEnd || 0);
            setBreakTime(routeData?.breakTime || 0);
            setFuelServiceTime(routeData?.fuelServiceTime || 0);

            if (routeData?.completedStops) {
              const stopsMap: Record<string, boolean> = {};
              routeData.completedStops.forEach(id => {
                stopsMap[id] = true;
              });
              setCompletedStops(stopsMap);
            }

            let initialItems: RouteItem[] = [];
            if (routeData?.prepTimeStart && routeData.prepTimeStart > 0) {
               initialItems.push({ id: 'special_start', type: 'start', duration: routeData.prepTimeStart });
            }
            if (routeData?.places) {
              routeData.places.forEach(placeId => {
                  const placeData = placesData.find(p => p.id === placeId);
                  if (placeData) {
                      initialItems.push({ id: `place_${placeId}`, type: 'place', placeId: placeId, placeData });
                  }
              });
            }
            if (routeData?.breakTime && routeData.breakTime > 0) {
               initialItems.push({ id: 'special_break', type: 'break', duration: routeData.breakTime });
            }
            if (routeData?.fuelServiceTime && routeData.fuelServiceTime > 0) {
               initialItems.push({ id: 'special_service', type: 'service', duration: routeData.fuelServiceTime });
            }
            if (routeData?.prepTimeEnd && routeData.prepTimeEnd > 0) {
               initialItems.push({ id: 'special_end', type: 'end', duration: routeData.prepTimeEnd });
            }

            setRouteItems(initialItems);
            debouncedCalculateDistance(initialItems, savedStart, savedEnd);
          }
        } catch (err) {
          console.error('Error fetching route data:', err);
          toast({ title: 'Feil', description: 'Kunne ikke laste rutedata.', variant: 'destructive' });
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, routeId, toast, debouncedCalculateDistance]);

  const updateRouteItems = (newItems: RouteItem[]) => {
    setRouteItems(newItems);
    debouncedCalculateDistance(newItems, startAddress, endAddress);
  };

  useEffect(() => {
    const totalPlacesDeliveryTimeMinutes = routeItems
        .filter(item => item.type === 'place' && item.placeData?.estimatedDeliveryTime)
        .reduce((sum, item) => sum + (item.placeData!.estimatedDeliveryTime || 0), 0);

    const totalSeconds = baseDurationSeconds 
      + (prepTimeStart * 60) 
      + (prepTimeEnd * 60) 
      + (breakTime * 60) 
      + (fuelServiceTime * 60)
      + (totalPlacesDeliveryTimeMinutes * 60);
    
    if(totalSeconds === 0) {
       setDuration('N/A');
       return;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      setDuration(`${hours}t ${minutes}m`);
    } else {
      setDuration(`${minutes}m`);
    }
  }, [baseDurationSeconds, prepTimeStart, prepTimeEnd, breakTime, fuelServiceTime, routeItems]);

  const handleAddPlace = (placeId: string) => {
    const placeToAdd = allPlaces.find(p => p.id === placeId);
    if (placeToAdd && !routeItems.some(i => i.type === 'place' && i.placeId === placeId)) {
      const newItem: RouteItem = { id: `place_${placeId}`, type: 'place', placeId, placeData: placeToAdd };
      const newItems = [...routeItems, newItem];
      updateRouteItems(newItems);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = routeItems.filter(i => i.id !== itemId);
    updateRouteItems(newItems);
  };
  
  const handleTimeSettingChange = (type: RouteItemType, value: number) => {
     let newItems = [...routeItems];
     if (value > 0) {
         const existingIndex = newItems.findIndex(i => i.type === type);
         if (existingIndex >= 0) {
             newItems[existingIndex].duration = value;
         } else {
             const newItem: RouteItem = { id: `special_${type}`, type, duration: value };
             if (type === 'start') newItems.unshift(newItem);
             else if (type === 'end') newItems.push(newItem);
             else {
                 const endIndex = newItems.findIndex(i => i.type === 'end');
                 if (endIndex >= 0) newItems.splice(endIndex, 0, newItem);
                 else newItems.push(newItem);
             }
         }
     } else {
         newItems = newItems.filter(i => i.type !== type);
     }
     
     setRouteItems(newItems);
     debouncedCalculateDistance(newItems, startAddress, endAddress);
     
     if (type === 'start') setPrepTimeStart(value);
     if (type === 'end') setPrepTimeEnd(value);
     if (type === 'break') setBreakTime(value);
     if (type === 'service') setFuelServiceTime(value);
  };

  const toggleItemCompletion = async (itemId: string) => {
    const isNowCompleted = !completedStops[itemId];
    const newCompletedStops = { ...completedStops, [itemId]: isNowCompleted };
    setCompletedStops(newCompletedStops);

    // Persist completion status immediately, without waiting for main save
    try {
      const completedIds = Object.entries(newCompletedStops)
        .filter(([_, isCompleted]) => isCompleted)
        .map(([id]) => id);
      await firebaseDB.updateRoute(routeId, { completedStops: completedIds });
    } catch (err) {
      console.error('Error saving completed stop:', err);
      setCompletedStops(completedStops); // Revert on failure
      toast({ title: 'Feil', description: 'Kunne ikke lagre status. Sjekk nettilkoblingen.', variant: 'destructive' });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = routeItems.findIndex(item => item.id === active.id);
      const newIndex = routeItems.findIndex(item => item.id === over.id);
      const newItems = arrayMove(routeItems, oldIndex, newIndex);
      updateRouteItems(newItems);
    }
  };

  const handleOptimizeRoute = async () => {
    const placeItems = routeItems.filter(i => i.type === 'place');
    if (placeItems.length < 3) {
      toast({ title: 'Info', description: 'Du trenger minst 3 stopp for å optimere ruten.' });
      return;
    }
    if (placeItems.length > 27) {
        toast({ title: 'For mange stopp', description: 'Google Maps tillater maks 25 mellomstopp.', variant: 'destructive' });
        return;
    }

    setIsOptimizing(true);
    try {
      const placeIds = placeItems.map(p => p.placeId!);
      const functions = getFunctions();
      const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
      
      const result = await calculateDistanceFn({ placeIds, startAddress, endAddress });
      const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
      
      setDistance(`${data.distance.toFixed(1)} km`);
      setBaseDurationSeconds(data.duration || 0);
      
      if (data.waypointOrder && data.waypointOrder.length > 0) {
        let optimizedPlaceItems: RouteItem[];
        let addedAddresses = (startAddress ? 1 : 0) + (endAddress ? 1 : 0);

        if (addedAddresses === 2 || (startAddress && placeItems.length > 1)) {
            optimizedPlaceItems = data.waypointOrder.map(index => placeItems[index]);
            if (startAddress && !endAddress && placeItems.length > 0) {
                 optimizedPlaceItems.push(placeItems[placeItems.length - 1]);
            }
        } else {
             const origin = placeItems[0];
             const destination = placeItems[placeItems.length - 1];
             const intermediatePoints = placeItems.slice(1, -1);
             const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
             optimizedPlaceItems = [origin, ...optimizedIntermediate, destination];
        }
        
        let optimizedIndex = 0;
        const newItems = routeItems.map(item => item.type === 'place' ? optimizedPlaceItems[optimizedIndex++] : item);
        setRouteItems(newItems);
        toast({ title: 'Suksess', description: 'Ruten ble optimalisert!' });
      } else {
         toast({ title: 'Info', description: 'Ruten er allerede optimal.' });
      }
    } catch (err: any) {
      console.error('Error optimizing:', err);
      toast({ title: 'Feil', description: err.message || 'Kunne ikke optimalisere ruten.', variant: 'destructive' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async () => {
    if (!route || isCalculating) return;
    setIsSaving(true);
    try {
      const placeIds = routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!);
      const completedIds = Object.entries(completedStops)
        .filter(([_, isCompleted]) => isCompleted)
        .map(([id]) => id);

      const updatedRoute: Partial<Route> = {
        name: route.name,
        shipmentNumber: route.shipmentNumber,
        driverId: route.driverId,
        places: placeIds,
        startAddress,
        endAddress,
        notes: routeNotes,
        completedStops: completedIds,
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? undefined : duration,
        distanceString: distance === 'N/A' || distance === 'Error' ? undefined : distance,
      };
      (updatedRoute as any).baseAddress = deleteField(); // Backwards compatibility
      
      await firebaseDB.updateRoute(routeId, updatedRoute);
      toast({ title: 'Suksess', description: 'Ruten er oppdatert.' });
    } catch (err) {
      console.error('Error saving route:', err);
      toast({ title: 'Feil', description: 'Kunne ikke lagre ruten.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isDataLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (error || !user) {
    router.push('/login');
    return null;
  }
  if (!route) {
    return <div className="text-center py-12">Ruten ble ikke funnet.</div>;
  }

  const isAdmin = userData?.role === 'admin';
  const placesCount = routeItems.filter(i => i.type === 'place').length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-2">
        <ChevronLeft className="h-4 w-4" />
        <Link href="/dashboard/routes" className="text-sm font-medium">Tilbake til Ruter</Link>
      </div>

      <Card className="border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <RouteIcon className="h-8 w-8 text-primary" />
                  </div>
                  <Input 
                    className="text-3xl font-bold h-auto py-2 px-3 bg-white/50 border-slate-200 hover:border-slate-300 focus:bg-white shadow-sm" 
                    value={route.name} 
                    onChange={(e) => setRoute({...route, name: e.target.value})}
                    placeholder="Navn på rute..."
                    readOnly={!isAdmin}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm w-full">
                    <FileText className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
                    <Input 
                        value={route.shipmentNumber || ''}
                        onChange={(e) => setRoute({...route, shipmentNumber: e.target.value})}
                        placeholder="Fraktnummer (valgfritt)"
                        className="border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm"
                        readOnly={!isAdmin}
                    />
                </div>
            </div>
            
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm w-full">
                        <Home className="h-4 w-4 text-blue-400 ml-2 shrink-0" />
                        <Input 
                            value={startAddress}
                            onChange={(e) => setStartAddress(e.target.value)}
                            onBlur={() => debouncedCalculateDistance(routeItems, e.target.value, endAddress)}
                            placeholder="Startadresse (valgfritt)"
                            className="border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm w-full">
                        <Flag className="h-4 w-4 text-indigo-400 ml-2 shrink-0" />
                        <Input 
                            value={endAddress}
                            onChange={(e) => setEndAddress(e.target.value)}
                            onBlur={() => debouncedCalculateDistance(routeItems, startAddress, e.target.value)}
                            placeholder="Sluttadresse (valgfritt)"
                            className="border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm"
                        />
                    </div>
                </div>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stopp</span>
                  <span className="font-bold text-lg">{placesCount}</span>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Distanse</span>
                  {isCalculating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
                  ) : (
                    <span className={`font-bold text-lg ${distance === 'Error' ? 'text-destructive' : ''}`}>
                      {distance === 'Error' ? 'Feil' : distance}
                    </span>
                  )}
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Tid</span>
                  {isCalculating ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
                  ) : (
                    <span className="font-bold text-lg">{duration}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-slate-500" />
              Tidsinnstillinger
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Time Setting Selects */}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4"><CardTitle className="text-lg">Legg til Stopp</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={handleAddPlace}>
                <SelectTrigger className="shadow-sm"><SelectValue placeholder="Søk og velg et sted..." /></SelectTrigger>
                <SelectContent>
                  {allPlaces.map(place => (
                    <SelectItem key={place.id} value={place.id} disabled={routeItems.some(i => i.type === 'place' && i.placeId === place.id)}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Info className="h-5 w-5 text-slate-400" />Viktig Ruteinformasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={routeNotes}
                onChange={(e) => setRouteNotes(e.target.value)}
                placeholder="Skriv inn viktig informasjon for sjåføren her..."
                className="min-h-[120px]"
                readOnly={!isAdmin}
              />
            </CardContent>
          </Card>
        </div>
        
        <Card className="lg:col-span-7 border-slate-200 shadow-sm flex flex-col min-h-[600px] lg:min-h-0 lg:h-auto">
          <CardHeader className="pb-4 shrink-0 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Rekkefølge</CardTitle>
              <span className="text-xs text-muted-foreground">Dra og slipp for å endre</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            {routeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                 <MapPin className="h-12 w-12 text-slate-200" />
                 <p className="text-center">Ingen stopp er lagt til.</p>
              </div>
            ) : (
              <div className="p-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={routeItems.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-3">
                    {routeItems.map((item, index) => (
                      <SortableItem key={item.id} id={item.id}>
                        {/* Item rendering logic here */}
                      </SortableItem>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
               <h3 className="font-semibold text-lg flex items-center gap-2">Tildelt Sjåfør</h3>
               <p className="text-sm text-muted-foreground">Velg hvem som skal kjøre denne ruten.</p>
            </div>
            <Select 
              value={route.driverId || "unassigned"} 
              onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}
            >
              <SelectTrigger className="w-full sm:w-[300px] h-10"><SelectValue placeholder="Velg sjåfør..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                {organizationUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm bg-slate-50/50">
         <CardContent className="p-6 space-y-4">
            {placesCount > 2 && (
               <Button 
                 variant="outline" 
                 className="w-full shadow-sm font-semibold h-12 bg-white"
                 onClick={handleOptimizeRoute} 
                 disabled={isOptimizing || isSaving || isCalculating}
               >
                 {isOptimizing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5 text-indigo-500" />}
                 Optimer Rekkefølge
               </Button>
            )}
            <Button 
              className="w-full shadow-sm font-bold h-12 text-md"
              onClick={handleSave} 
              disabled={isSaving || isCalculating}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isCalculating ? 'Kalkulerer...' : 'Lagre Rute'}
            </Button>
         </CardContent>
      </Card>

    </div>
  );
}
