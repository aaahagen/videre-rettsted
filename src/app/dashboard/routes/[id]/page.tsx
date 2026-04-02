
'use client';

import { useEffect, useState, useRef } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft, Clock, Car, ExternalLink, CheckCircle2, Circle, Coffee, Wrench, Home, Flag, Info, FileText, Edit2, X, Check } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Place, Route, CompletedStopEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

type RouteItemType = 'place' | 'start' | 'end' | 'break' | 'service';

interface RouteItem {
  id: string;
  type: RouteItemType;
  placeId?: string;
  placeData?: Place;
  duration?: number;
}

function SortableItem({ id, children, isEditMode }: { id: string, children: React.ReactNode, isEditMode: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center w-full">
      {isEditMode && (
        <div {...listeners} style={{ touchAction: 'none' }} className="p-3 cursor-grab hover:bg-slate-100 rounded-md shrink-0 self-stretch flex items-center">
           <GripVertical className="text-muted-foreground" />
        </div>
      )}
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
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});
  const [completedStopEvents, setCompletedStopEvents] = useState<Record<string, CompletedStopEvent>>({});
  const { getPosition } = useGeolocation();
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);

  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCalculatedPlaceIdsRef = useRef<string>('');

  // --- 1. Fast Local UI Update for Total Time ---
  // This runs instantly whenever any time component changes, without waiting for the backend.
  useEffect(() => {
    const totalPlacesDeliveryTimeMinutes = routeItems
      .filter(item => item.type === 'place' && item.placeData?.estimatedDeliveryTime)
      .reduce((sum, item) => sum + (item.placeData!.estimatedDeliveryTime || 0), 0);
      
    const totalSeconds = baseDurationSeconds + ((prepTimeStart + prepTimeEnd + breakTime + fuelServiceTime + totalPlacesDeliveryTimeMinutes) * 60);
    
    if (totalSeconds === 0) {
       setDuration('N/A');
    } else {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        setDuration(hours > 0 ? `${hours} t ${minutes} min` : `${minutes} min`);
    }
  }, [routeItems, baseDurationSeconds, prepTimeStart, prepTimeEnd, breakTime, fuelServiceTime]);


  // --- 2. Debounced Backend Call for Driving Distance/Time ---
  // This ONLY runs when the physical locations or their order changes.
  useEffect(() => {
    if (isDataLoading) return;

    const placesToCalculate = routeItems.filter(item => item.type === 'place' && item.placeId).map(item => item.placeId!);
    const currentPlaceIdsString = JSON.stringify(placesToCalculate) + startAddress + endAddress;
    
    // Abort if the physical route hasn't changed since last calculation
    if (currentPlaceIdsString === lastCalculatedPlaceIdsRef.current && distance !== 'N/A') {
        return; 
    }

    const calculateDistance = async () => {
      setIsCalculating(true);
      lastCalculatedPlaceIdsRef.current = currentPlaceIdsString;

      const validStart = startAddress && startAddress.trim() !== '';
      const validEnd = endAddress && endAddress.trim() !== '';
      let totalPoints = placesToCalculate.length + (validStart ? 1 : 0) + (validEnd ? 1 : 0);

      // Do not attempt calculation if we lack sufficient points
      if (placesToCalculate.length === 0 || totalPoints < 2) {
        setDistance('N/A');
        setBaseDurationSeconds(0);
        setIsCalculating(false);
        return;
      }

      try {
        const functions = getFunctions();
        const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
        const result = await calculateDistanceFn({ 
            placeIds: placesToCalculate, 
            startAddress, 
            endAddress 
        });
        const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
        
        setDistance(`${data.distance.toFixed(1)} km`);
        setBaseDurationSeconds(data.duration || 0); 

      } catch (err: any) {
        console.error('Detailed error calculating distance:', err);
        setDistance('Error');
        setBaseDurationSeconds(0);
        toast({ title: 'Kalkuleringsfeil', description: 'Kunne ikke beregne avstand for ruten.', variant: 'destructive' });
      } finally {
        setIsCalculating(false);
      }
    };

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Debounce the call to prevent spamming the API while dragging
    timeoutRef.current = setTimeout(calculateDistance, 1000);

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [routeItems, startAddress, endAddress, isDataLoading, toast, distance]);


  // --- Data Fetching ---

  useEffect(() => {
    if (user && routeId) {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          const userDoc = await firebaseDB.getUser(user.uid);
          if (userDoc?.orgId) {
            setUserData(userDoc);
            
            // Set edit mode to true by default for admins, false for drivers
            if (userDoc.role === 'admin') {
              setIsEditMode(true);
            }
            
            const [routeData, placesData, usersData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
            ]);
            
            if (routeData) {
              setRoute(routeData);
              setAllPlaces(placesData);
              setOrganizationUsers(usersData);
              setRouteNotes(routeData.notes || '');
              
              const legacyBaseAddress = (routeData as any).baseAddress || '';
              setStartAddress(routeData.startAddress || legacyBaseAddress);
              setEndAddress(routeData.endAddress || legacyBaseAddress);
              
              setPrepTimeStart(routeData.prepTimeStart || 0);
              setPrepTimeEnd(routeData.prepTimeEnd || 0);
              setBreakTime(routeData.breakTime || 0);
              setFuelServiceTime(routeData.fuelServiceTime || 0);

              if (routeData.completedStopEvents) {
                setCompletedStopEvents(routeData.completedStopEvents);
              }
              if (routeData.completedStops) {
                const stopsMap: Record<string, boolean> = {};
                routeData.completedStops.forEach(id => { stopsMap[id] = true; });
                setCompletedStops(stopsMap);
              }

              let initialItems: RouteItem[] = [];
              if (routeData.prepTimeStart && routeData.prepTimeStart > 0) initialItems.push({ id: 'special_start', type: 'start', duration: routeData.prepTimeStart });
              if (routeData.places) {
                routeData.places.forEach(placeId => {
                  const placeData = placesData.find(p => p.id === placeId);
                  if (placeData) initialItems.push({ id: `place_${placeId}`, type: 'place', placeId: placeId, placeData });
                });
              }
              if (routeData.breakTime && routeData.breakTime > 0) initialItems.push({ id: 'special_break', type: 'break', duration: routeData.breakTime });
              if (routeData.fuelServiceTime && routeData.fuelServiceTime > 0) initialItems.push({ id: 'special_service', type: 'service', duration: routeData.fuelServiceTime });
              if (routeData.prepTimeEnd && routeData.prepTimeEnd > 0) initialItems.push({ id: 'special_end', type: 'end', duration: routeData.prepTimeEnd });

              setRouteItems(initialItems);
            }
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
  }, [user, routeId, toast]);

  // --- Handlers ---

  const handleAddPlace = (placeId: string) => {
    const placeToAdd = allPlaces.find(p => p.id === placeId);
    if (placeToAdd && !routeItems.some(i => i.type === 'place' && i.placeId === placeId)) {
      setRouteItems(prev => [...prev, { id: `place_${placeId}`, type: 'place', placeId, placeData: placeToAdd }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setRouteItems(prev => prev.filter(i => i.id !== itemId));
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
                 endIndex >= 0 ? newItems.splice(endIndex, 0, newItem) : newItems.push(newItem);
             }
         }
     } else {
         newItems = newItems.filter(i => i.type !== type);
     }
     
     setRouteItems(newItems);
     
     if (type === 'start') setPrepTimeStart(value);
     if (type === 'end') setPrepTimeEnd(value);
     if (type === 'break') setBreakTime(value);
     if (type === 'service') setFuelServiceTime(value);
  };

  const toggleItemCompletion = async (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const isNowCompleted = !completedStops[itemId];
    setCompletedStops(prev => ({ ...prev, [itemId]: isNowCompleted }));

    let newEvents = { ...completedStopEvents };

    if (isNowCompleted && itemId.startsWith('place_')) {
      const placeId = itemId.replace('place_', '');
      let coords;
      try {
        coords = await getPosition();
      } catch (e) {
        console.warn('Could not get location', e);
      }
      
      const newEvent: CompletedStopEvent = {
        placeId,
        timestamp: new Date().toISOString(),
      };
      if (coords) {
          newEvent.coordinates = coords;
      }
      newEvents[itemId] = newEvent;
    } else {
      delete newEvents[itemId];
    }
    setCompletedStopEvents(newEvents);
    
    if (route && userData?.role !== 'admin') {
      try {
        const currentCompletedStops = Object.entries({ ...completedStops, [itemId]: isNowCompleted }).filter(([_, isCompleted]) => isCompleted).map(([id]) => id);
        
        await firebaseDB.updateRoute(routeId, { 
            completedStops: currentCompletedStops,
            completedStopEvents: newEvents
        });
      } catch (err) {
        console.error('Error auto-saving completed stop:', err);
        setCompletedStops(prev => ({ ...prev, [itemId]: !isNowCompleted }));
        setCompletedStopEvents(completedStopEvents); // Revert
        toast({ title: 'Feil', description: 'Kunne ikke lagre status.', variant: 'destructive' });
      }
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = routeItems.findIndex(item => item.id === active.id);
      const newIndex = routeItems.findIndex(item => item.id === over.id);
      setRouteItems(prevItems => arrayMove([...prevItems], oldIndex, newIndex));
    }
  };

  const handleOptimizeRoute = async () => {
    const placeItems = routeItems.filter(i => i.type === 'place');
    if (placeItems.length <= 2) {
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
      
      const result = await calculateDistanceFn({ placeIds, startAddress, endAddress, optimizeRoute: true });
      const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
      
      setDistance(`${data.distance.toFixed(1)} km`);
      const drivingDur = data.duration || 0;
      setBaseDurationSeconds(drivingDur);
      
      if (data.waypointOrder && data.waypointOrder.length > 0) {
        let optimizedPlaceItems: RouteItem[] = [];
        
        const validStart = startAddress && startAddress.trim() !== '';
        const validEnd = endAddress && endAddress.trim() !== '';
        
        if (validStart && validEnd) {
             optimizedPlaceItems = data.waypointOrder.map(index => placeItems[index]);
        } else if (validStart && !validEnd) {
            const destination = placeItems[placeItems.length - 1];
            const intermediatePoints = placeItems.slice(0, -1);
            const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
            optimizedPlaceItems = [...optimizedIntermediate, destination];
        } else if (!validStart && validEnd) {
             const origin = placeItems[0];
             const intermediatePoints = placeItems.slice(1);
             const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
             optimizedPlaceItems = [origin, ...optimizedIntermediate];
        } else {
             const origin = placeItems[0];
             const destination = placeItems[placeItems.length - 1];
             const intermediatePoints = placeItems.slice(1, -1);
             const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
             optimizedPlaceItems = [origin, ...optimizedIntermediate, destination];
        }
        
        let optimizedIndex = 0;
        const newItems = routeItems.map(item => {
            if (item.type === 'place') {
                return optimizedPlaceItems[optimizedIndex++];
            }
            return item;
        });
        
        setRouteItems(newItems);
        // Force the ref to update so the useEffect doesn't immediately overwrite our optimized result
        const placesToCalculate = newItems.filter(item => item.type === 'place' && item.placeId).map(item => item.placeId!);
        lastCalculatedPlaceIdsRef.current = JSON.stringify(placesToCalculate) + startAddress + endAddress;

        toast({ title: 'Suksess', description: 'Ruten ble optimalisert for korteste kjøretid!' });
      } else {
         toast({ title: 'Info', description: 'Ruten er allerede optimal.' });
      }
    } catch (err: any) {
      console.error('Error optimizing:', err);
      toast({ title: 'Feil', description: 'Kunne ikke optimalisere ruten.', variant: 'destructive' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async () => {
    if (!route) return;
    setIsSaving(true);
    try {
      const currentCompletedStops = Object.entries(completedStops)
        .filter(([_, isCompleted]) => isCompleted)
        .map(([id]) => id);
        
      const placeIds = routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!);

      const updatedRoute: Partial<Route> = {
        ...route,
        places: placeIds,
        startAddress,
        endAddress,
        notes: routeNotes,
        completedStops: currentCompletedStops,
        completedStopEvents: completedStopEvents,
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? undefined : duration,
        distanceString: distance === 'N/A' || distance === 'Error' ? undefined : distance,
      };
      (updatedRoute as any).baseAddress = deleteField();
      
      await firebaseDB.updateRoute(routeId, updatedRoute);
      toast({ title: 'Suksess', description: 'Ruten er lagret.' });
      
      if (!isAdmin) {
          setIsEditMode(false);
      }
    } catch (err) {
      console.error('Error saving route:', err);
      toast({ title: 'Feil', description: 'Kunne ikke lagre ruten.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishRoute = () => {
    // Determine if all stops are actually marked complete
    const placeIds = routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!);
    
    // We want all physical places AND special items to be marked to be 'fully' finished,
    // or just the physical places depending on business logic. Currently completedStops
    // stores the ID of the RouteItem (e.g., `place_XYZ` or `special_start`).
    
    // Let's check if EVERY item in the routeItems array is in completedStops
    const allCompleted = routeItems.every(item => completedStops[item.id]);

    if (!allCompleted) {
        toast({ title: 'Ikke ferdig', description: 'Du må markere alle stopp og handlinger som fullført før du kan avslutte ruten.', variant: 'destructive' });
        return;
    }
    
    // Route is fully complete, redirect to routes view
    toast({ title: 'Rute Fullført', description: 'Flott jobba! Du blir omdirigert til ruteoversikten.' });
    router.push('/dashboard/routes');
  };

  const handleStartAddressChange = (val: string) => {
      setStartAddress(val);
  }

  const handleEndAddressChange = (val: string) => {
      setEndAddress(val);
  }


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
  
  const allStopsCompleted = routeItems.length > 0 && routeItems.every(item => completedStops[item.id]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-2">
        <ChevronLeft className="h-4 w-4" />
        <Link href="/dashboard/routes" className="text-sm font-medium">Tilbake til Ruter</Link>
      </div>

      {/* Top Box: Route Info */}
      
      {/* Route Notes - Always visible at top for drivers if not in edit mode */}
      {!isAdmin && !isEditMode && routeNotes && (
        <Card className="border-indigo-100 shadow-md bg-indigo-50/30 overflow-hidden">
          <CardHeader className="pb-3 bg-indigo-100/50">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
              <Info className="h-5 w-5 text-indigo-600" />
              Viktig Ruteinformasjon
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
             <div className="text-sm text-indigo-950 font-medium whitespace-pre-wrap">
                {routeNotes}
            </div>
          </CardContent>
        </Card>
      )}
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
                            onChange={(e) => handleStartAddressChange(e.target.value)}
                            placeholder="Startadresse (valgfritt)"
                            className="border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm w-full">
                        <Flag className="h-4 w-4 text-indigo-400 ml-2 shrink-0" />
                        <Input 
                            value={endAddress}
                            onChange={(e) => handleEndAddressChange(e.target.value)}
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

      {/* Time Settings Box - Only for Admins */}
      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-slate-500" />
              Tidsinnstillinger
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Klargjøring (start)</label>
                <Select 
                  value={prepTimeStart.toString()} 
                  onValueChange={(val) => handleTimeSettingChange('start', Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Velg tid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 min</SelectItem>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="25">25 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="35">35 min</SelectItem>
                    <SelectItem value="40">40 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="50">50 min</SelectItem>
                    <SelectItem value="55">55 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="75">75 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ferdigstilling (slutt)</label>
                <Select 
                  value={prepTimeEnd.toString()} 
                  onValueChange={(val) => handleTimeSettingChange('end', Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Velg tid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 min</SelectItem>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="25">25 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="35">35 min</SelectItem>
                    <SelectItem value="40">40 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="50">50 min</SelectItem>
                    <SelectItem value="55">55 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="75">75 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pause</label>
                <Select 
                  value={breakTime.toString()} 
                  onValueChange={(val) => handleTimeSettingChange('break', Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Velg tid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="75">75 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Drivstoff / Service</label>
                <Select 
                  value={fuelServiceTime.toString()} 
                  onValueChange={(val) => handleTimeSettingChange('service', Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Velg tid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 min</SelectItem>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      

      {/* Main Content: Places Grid */}
      <div className={`grid grid-cols-1 gap-6 ${isAdmin || isEditMode || (!isAdmin && !isEditMode && routeNotes) ? 'lg:grid-cols-12' : ''}`}>
        
        {/* Left Col: Add Places & Route Notes */}
        {(isAdmin || isEditMode) && (
            <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Add Places (Only visible in edit mode or for admins) */}
                {(isAdmin || isEditMode) && (
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Legg til Stopp</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <Select onValueChange={handleAddPlace}>
                            <SelectTrigger className="shadow-sm">
                            <SelectValue placeholder="Søk og velg et sted..." />
                            </SelectTrigger>
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
                )}
            
                {/* Route Notes */}
                <Card className="border-slate-200 shadow-sm h-fit">
                    <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Info className={`h-5 w-5 ${!isAdmin && !isEditMode ? 'text-indigo-400' : 'text-slate-400'}`} />
                        Viktig Ruteinformasjon
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            value={routeNotes}
                            onChange={(e) => setRouteNotes(e.target.value)}
                            placeholder="Skriv inn viktig informasjon for sjåføren her. F.eks. nøkler, koder, eller spesielle hensyn..."
                            className="min-h-[120px]"
                        />
                    </CardContent>
                </Card>
            </div>
        )}
        
        {/* Right Col: Current Route */}
        <Card className={`border-slate-200 shadow-sm flex flex-col min-h-[600px] lg:min-h-0 lg:h-auto ${(isAdmin || isEditMode || (!isAdmin && !isEditMode && routeNotes)) ? 'lg:col-span-7' : ''}`}>
          <CardHeader className="pb-4 shrink-0 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                 <CardTitle className="text-lg flex items-center gap-2">Rekkefølge {isEditMode && <Badge variant="outline" className="text-[10px] ml-2">Redigeringsmodus</Badge>}</CardTitle>
                 {isEditMode && <span className="text-xs text-muted-foreground mt-1 block">Dra og slipp for å endre rekkefølge</span>}
              </div>
              {!isAdmin && (
                  <Button 
                    variant={isEditMode ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="flex items-center gap-2"
                  >
                      {isEditMode ? (
                          <>
                            <X className="h-4 w-4" /> Avslutt redigering
                          </>
                      ) : (
                          <>
                            <Edit2 className="h-4 w-4" /> Rediger Rute
                          </>
                      )}
                  </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1 flex flex-col justify-between">
            {routeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 p-8 min-h-[400px]">
                 <MapPin className="h-12 w-12 text-slate-200" />
                 <p className="text-center">Ingen stopp er lagt til enda. <br/>Bruk menyen til venstre for å bygge ruten.</p>
              </div>
            ) : (
              <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={routeItems.map(p => p.id)} strategy={verticalListSortingStrategy}>
                          <ul className="space-y-3">
                            {routeItems.map((item, index) => {
                              const isCompleted = completedStops[item.id];
                              
                              // Special handling for time settings
                              if (item.type !== 'place') {
                                 let icon = <Clock className="h-4 w-4" />;
                                 let title = '';
                                 let colorClass = 'text-slate-500 bg-slate-50';
                                 if (item.type === 'start') { title = 'Klargjøring'; icon = <Home className="h-4 w-4 text-blue-500" />; colorClass = 'bg-blue-50/50 border-blue-100'; }
                                 if (item.type === 'end') { title = 'Ferdigstilling'; icon = <Flag className="h-4 w-4 text-indigo-500" />; colorClass = 'bg-indigo-50/50 border-indigo-100'; }
                                 if (item.type === 'break') { title = 'Pause'; icon = <Coffee className="h-4 w-4 text-amber-500" />; colorClass = 'bg-amber-50/50 border-amber-100'; }
                                 if (item.type === 'service') { title = 'Drivstoff / Service'; icon = <Wrench className="h-4 w-4 text-slate-500" />; colorClass = 'bg-slate-50 border-slate-200'; }
                                 
                                 return (
                                    <SortableItem key={item.id} id={item.id} isEditMode={isEditMode}>
                                      <div className={`flex-grow flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border shadow-sm transition-all group w-full gap-3 ${isCompleted ? 'opacity-50 grayscale' : ''} ${colorClass}`}>
                                        <div className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer" onClick={(e) => toggleItemCompletion(item.id, e)}>
                                          <button type="button" className={`shrink-0 rounded-full transition-colors ${isCompleted ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-400'}`}>
                                            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                          </button>
                                          <div className="flex items-center justify-center bg-white rounded-full h-8 w-8 shrink-0 shadow-sm border border-slate-100">
                                            {icon}
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <span className={`font-semibold text-sm ${isCompleted ? 'line-through' : ''}`}>{title}</span>
                                            {item.type === 'start' ? (
                                               <span className="text-xs text-muted-foreground break-words">{startAddress || 'Startadresse ikke satt'}</span>
                                            ) : null}
                                            {item.type === 'end' ? (
                                               <span className="text-xs text-muted-foreground break-words">{endAddress || 'Sluttadresse ikke satt'}</span>
                                            ) : null}
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pl-9 sm:pl-0 shrink-0">
                                          <Badge variant="secondary" className="bg-white/60 shrink-0">{item.duration} min</Badge>
                                        </div>
                                      </div>
                                    </SortableItem>
                                 );
                              }
                              
                              // Regular Place Item
                              return (
                                 <SortableItem key={item.id} id={item.id} isEditMode={isEditMode}>
                                    <div className={`flex-grow flex flex-col p-3 rounded-lg bg-white border shadow-sm transition-all group w-full gap-3 ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:border-primary/50'}`}>
                                      
                                      {/* Top row: Main info */}
                                      <div className="flex items-center justify-between w-full">
                                        {/* Left Side: Completion Toggle & Info */}
                                        <div className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer" onClick={(e) => toggleItemCompletion(item.id, e)}>
                                          <button 
                                            type="button" 
                                            className={`shrink-0 rounded-full transition-colors ${isCompleted ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-400'}`}
                                          >
                                            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                          </button>
          
                                          <span className="flex items-center justify-center bg-slate-100 rounded-full h-7 w-7 text-xs font-bold text-slate-600 shrink-0 shadow-inner">
                                            {index + 1}
                                         </span>
                                         <div className="flex flex-col min-w-0">
                                            <span className={`font-semibold break-words transition-colors ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                              {item.placeData?.name}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {/* Right Side: Actions (visible on hover on larger screens) */}
                                        <div className={`hidden sm:flex items-center gap-1 shrink-0 ${isEditMode ? '' : 'opacity-100'}`}>
                                          <Link href={`/dashboard/places/${item.placeId}`} passHref>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-primary/10 h-8 w-8">
                                              <ExternalLink className="h-4 w-4" />
                                            </Button>
                                          </Link>
                                          {isEditMode && (
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-slate-300 hover:text-destructive hover:bg-destructive/10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                          )}
                                        </div>
                                      </div>
          
                                      {/* Bottom row: Badge and Mobile Actions */}
                                      <div className="flex items-center justify-between w-full pl-10">
                                        {item.placeData?.estimatedDeliveryTime && item.placeData.estimatedDeliveryTime > 0 ? (
                                          <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 flex items-center gap-1 shrink-0">
                                            <Clock className="h-3 w-3" />
                                            {item.placeData.estimatedDeliveryTime} min
                                          </Badge>
                                        ) : <div />} 
                                        
                                        {/* Actions visible on mobile */}
                                        <div className="flex sm:hidden items-center gap-1 shrink-0">
                                          <Link href={`/dashboard/places/${item.placeId}`} passHref>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-primary/10 h-8 w-8">
                                              <ExternalLink className="h-4 w-4" />
                                            </Button>
                                          </Link>
                                          {isEditMode && (
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-slate-400 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                          )}
                                        </div>
                                      </div>
          
                                    </div>
                                  </SortableItem>
                                )
                            })}
                          </ul>
                        </SortableContext>
                      </DndContext>
                  </div>
                  
                  {/* Finish Route Button for Drivers */}
                  {!isAdmin && !isEditMode && routeItems.length > 0 && (
                      <div className="mt-8 pt-4 border-t border-slate-100">
                          <Button 
                              onClick={handleFinishRoute}
                              disabled={!allStopsCompleted}
                              className={`w-full h-14 text-lg font-bold transition-all ${allStopsCompleted ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                              {allStopsCompleted ? (
                                  <>
                                      <Check className="mr-2 h-5 w-5" /> Fullfør Rute
                                  </>
                              ) : (
                                  "Marker alle stopp som ferdig først"
                              )}
                          </Button>
                      </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Driver Assignment - Only for Admins */}
      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-4 flex-1">
               <div>
                   <h3 className="font-semibold text-lg flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Rutetildeling
                   </h3>
                   <p className="text-sm text-muted-foreground">Velg hvem som skal kjøre denne ruten.</p>
               </div>
               
               <div className="flex items-center gap-2 mt-4">
                    <Switch 
                        id="is3ps" 
                        checked={route.isThirdParty || false} 
                        onCheckedChange={(val: boolean) => setRoute({...route, isThirdParty: val, driverId: val ? '' : route.driverId})}
                    />
                    <Label htmlFor="is3ps" className="cursor-pointer">Kjøres av Tredjepart (3PS)</Label>
               </div>
            </div>
            
            <div className="flex-1 w-full flex justify-end">
                {route.isThirdParty ? (
                    <div className="w-full sm:w-[300px] space-y-2">
                        <Label htmlFor="3ps-name" className="text-xs text-muted-foreground">Navn på transportør (3PS)</Label>
                        <Input 
                            id="3ps-name"
                            placeholder="F.eks. Bring, PostNord..." 
                            value={route.thirdPartySupplier || ''}
                            onChange={(e) => setRoute({...route, thirdPartySupplier: e.target.value})}
                            className="h-10 border-slate-200 shadow-sm"
                        />
                    </div>
                ) : (
                    <Select 
                      value={route.driverId || "unassigned"} 
                      onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}
                    >
                      <SelectTrigger className="w-full sm:w-[300px] h-10 border-slate-200 shadow-sm mt-6">
                        <SelectValue placeholder="Velg intern sjåfør..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                        {organizationUsers.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {(isAdmin || isEditMode) && (
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
                   {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                   Lagre Rute
                </Button>
             </CardContent>
          </Card>
      )}

    </div>
  );
}
