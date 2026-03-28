
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
        
        // Filter only actual places for Google Maps
        const placesToCalculate = items
           .filter(item => item.type === 'place' && item.placeId)
           .map(item => item.placeId!);
           
        // Calculate how many total points we have (places + start + end)
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
          
          if (data.duration) {
            setBaseDurationSeconds(data.duration);
          } else {
            setBaseDurationSeconds(0);
          }
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
      }, 500);
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
            
            // Handle backwards compatibility for 'baseAddress'
            const legacyBaseAddress = (routeData as any).baseAddress || '';
            const savedStart = routeData?.startAddress || legacyBaseAddress;
            const savedEnd = routeData?.endAddress || legacyBaseAddress;

            setStartAddress(savedStart);
            setEndAddress(savedEnd);
            
            setPrepTimeStart(routeData?.prepTimeStart || 0);
            setPrepTimeEnd(routeData?.prepTimeEnd || 0);
            setBreakTime(routeData?.breakTime || 0);
            setFuelServiceTime(routeData?.fuelServiceTime || 0);

            // Initialize completed stops from database
            if (routeData?.completedStops) {
              const stopsMap: Record<string, boolean> = {};
              routeData.completedStops.forEach(id => {
                stopsMap[id] = true;
              });
              setCompletedStops(stopsMap);
            }

            // Construct RouteItems array based on saved places
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
    // Calculate total duration from places
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
      setDuration(`${hours} t ${minutes} min`);
    } else {
      setDuration(`${minutes} min`);
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
  
  // Sync Time Settings with RouteItems
  const handleTimeSettingChange = (type: RouteItemType, value: number) => {
     let newItems = [...routeItems];
     
     if (value > 0) {
         // Add or update
         const existingIndex = newItems.findIndex(i => i.type === type);
         if (existingIndex >= 0) {
             newItems[existingIndex].duration = value;
         } else {
             // Add to list (start at top, end at bottom, others before end)
             const newItem: RouteItem = { id: `special_${type}`, type, duration: value };
             if (type === 'start') {
                 newItems.unshift(newItem);
             } else if (type === 'end') {
                 newItems.push(newItem);
             } else {
                 // Insert before 'end' if it exists, otherwise at the end
                 const endIndex = newItems.findIndex(i => i.type === 'end');
                 if (endIndex >= 0) {
                     newItems.splice(endIndex, 0, newItem);
                 } else {
                     newItems.push(newItem);
                 }
             }
         }
     } else {
         // Remove
         newItems = newItems.filter(i => i.type !== type);
     }
     
     setRouteItems(newItems);
     debouncedCalculateDistance(newItems, startAddress, endAddress);
     
     if (type === 'start') setPrepTimeStart(value);
     if (type === 'end') setPrepTimeEnd(value);
     if (type === 'break') setBreakTime(value);
     if (type === 'service') setFuelServiceTime(value);
  };

  const toggleItemCompletion = async (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent drag from triggering
    const isNowCompleted = !completedStops[itemId];
    
    setCompletedStops(prev => ({
      ...prev,
      [itemId]: isNowCompleted
    }));
    
    // Auto-save completion status for drivers
    if (route && userData?.role !== 'admin') {
      try {
        const currentCompletedStops = Object.entries({
          ...completedStops,
          [itemId]: isNowCompleted
        })
        .filter(([_, isCompleted]) => isCompleted)
        .map(([id]) => id);

        await firebaseDB.updateRoute(routeId, {
          completedStops: currentCompletedStops
        });
      } catch (err) {
        console.error('Error auto-saving completed stop:', err);
        // Revert local state on failure
        setCompletedStops(prev => ({
          ...prev,
          [itemId]: !isNowCompleted
        }));
        toast({ title: 'Feil', description: 'Kunne ikke lagre status. Sjekk nettilkoblingen.', variant: 'destructive' });
      }
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = routeItems.findIndex(item => item.id === active.id);
      const newIndex = routeItems.findIndex(item => item.id === over.id);
      const newItems = arrayMove(routeItems, oldIndex, newIndex);
      updateRouteItems(newItems);
    }
  };

  const handleOptimizeRoute = async () => {
    const placeItems = routeItems.filter(i => i.type === 'place');
    if (placeItems.length <= 2) {
      toast({ title: 'Info', description: 'Du trenger minst 3 stopp for å optimere ruten.' });
      return;
    }
    
    if (placeItems.length > 27) {
        toast({ 
            title: 'For mange stopp', 
            description: 'Google Maps tillater maks 25 mellomstopp for automatisk optimalisering.', 
            variant: 'destructive' 
        });
        return;
    }

    setIsOptimizing(true);
    try {
      const placeIds = placeItems.map(p => p.placeId!);
      const functions = getFunctions();
      const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
      
      const result = await calculateDistanceFn({ 
          placeIds,
          startAddress,
          endAddress
      });
      const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
      
      const newDistanceString = `${data.distance.toFixed(1)} km`;
      setDistance(newDistanceString);
      
      let newDurationSeconds = 0;
      if (data.duration) {
        setBaseDurationSeconds(data.duration);
        newDurationSeconds = data.duration;
      } else {
        setBaseDurationSeconds(0);
      }
      
      // Calculate new duration string immediately for auto-save
      let newDurationString = 'N/A';
      
      const totalPlacesDeliveryTimeMinutes = routeItems
        .filter(item => item.type === 'place' && item.placeData?.estimatedDeliveryTime)
        .reduce((sum, item) => sum + (item.placeData!.estimatedDeliveryTime || 0), 0);

      const totalSeconds = newDurationSeconds 
        + (prepTimeStart * 60) 
        + (prepTimeEnd * 60) 
        + (breakTime * 60) 
        + (fuelServiceTime * 60)
        + (totalPlacesDeliveryTimeMinutes * 60);

      if (totalSeconds > 0) {
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          if (hours > 0) {
             newDurationString = `${hours} t ${minutes} min`;
          } else {
             newDurationString = `${minutes} min`;
          }
      }
      
      if (data.waypointOrder && data.waypointOrder.length > 0) {
        // Reconstruct place order.
        let optimizedPlaceItems: RouteItem[] = [];
        
        // Count how many address strings we injected into the waypoints list on the backend
        let addedAddresses = 0;
        if (startAddress) addedAddresses++;
        if (endAddress) addedAddresses++;
        
        if (addedAddresses === 2) {
             // Both start and end addresses were used: ALL placeItems were intermediate
             optimizedPlaceItems = data.waypointOrder.map(index => placeItems[index]);
        } else if (addedAddresses === 1) {
            // One address was used. The logic depends on WHICH address was used.
            if (startAddress && !endAddress) {
                // startAddress was origin. The FIRST placeItem was NOT origin. The LAST placeItem was destination.
                // data.waypointOrder only covers the elements BETWEEN origin and destination.
                // So, data.waypointOrder covers placeItems from index 0 to length-2.
                // The last element is destination and remains at the end.
                const destination = placeItems[placeItems.length - 1];
                const intermediatePoints = placeItems.slice(0, -1);
                const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
                optimizedPlaceItems = [...optimizedIntermediate, destination];
            } else {
                // endAddress was destination. The FIRST placeItem WAS origin.
                // data.waypointOrder covers placeItems from index 1 to length-1.
                const origin = placeItems[0];
                const intermediatePoints = placeItems.slice(1);
                const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
                optimizedPlaceItems = [origin, ...optimizedIntermediate];
            }
        } else {
             // No base addresses: first and last placeItems were origin/destination
             const origin = placeItems[0];
             const destination = placeItems[placeItems.length - 1];
             const intermediatePoints = placeItems.slice(1, -1);
             const optimizedIntermediate = data.waypointOrder.map(index => intermediatePoints[index]);
             optimizedPlaceItems = [origin, ...optimizedIntermediate, destination];
        }
        
        // Re-integrate optimized places into the main routeItems array
        let optimizedIndex = 0;
        const newItems = routeItems.map(item => {
            if (item.type === 'place') {
                return optimizedPlaceItems[optimizedIndex++];
            }
            return item;
        });
        
        setRouteItems(newItems);
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
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? undefined : duration,
        distanceString: distance === 'N/A' || distance === 'Error' ? undefined : distance,
      };
      // For backward compatibility, also remove baseAddress if we are saving new schema
      (updatedRoute as any).baseAddress = deleteField();
      
      await firebaseDB.updateRoute(routeId, updatedRoute);
      toast({ title: 'Suksess', description: 'Ruten er lagret.' });
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
      {/* Back button */}
      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-2">
        <ChevronLeft className="h-4 w-4" />
        <Link href="/dashboard/routes" className="text-sm font-medium">Tilbake til Ruter</Link>
      </div>

      {/* Top Box: Route Info */}
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
                            onBlur={() => debouncedCalculateDistance(routeItems, startAddress, endAddress)}
                            placeholder="Startadresse (valgfritt)"
                            className="border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm w-full">
                        <Flag className="h-4 w-4 text-indigo-400 ml-2 shrink-0" />
                        <Input 
                            value={endAddress}
                            onChange={(e) => setEndAddress(e.target.value)}
                            onBlur={() => debouncedCalculateDistance(routeItems, startAddress, endAddress)}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Add Places */}
        <div className="lg:col-span-5 flex flex-col gap-6">
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
          
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-slate-400" />
                Viktig Ruteinformasjon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={routeNotes}
                onChange={(e) => setRouteNotes(e.target.value)}
                placeholder="Skriv inn viktig informasjon for sjåføren her. F.eks. nøkler, koder, eller spesielle hensyn..."
                className="min-h-[120px]"
                readOnly={!isAdmin}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right Col: Current Route */}
        <Card className="lg:col-span-7 border-slate-200 shadow-sm flex flex-col min-h-[600px] lg:min-h-0 lg:h-auto">
          <CardHeader className="pb-4 shrink-0 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Rekkefølge</CardTitle>
              <span className="text-xs text-muted-foreground">Dra og slipp for å endre</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            {routeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 p-8 min-h-[400px]">
                 <MapPin className="h-12 w-12 text-slate-200" />
                 <p className="text-center">Ingen stopp er lagt til enda. <br/>Bruk menyen til venstre for å bygge ruten.</p>
              </div>
            ) : (
              <div className="p-4">
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
                            <SortableItem key={item.id} id={item.id}>
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
                        <SortableItem key={item.id} id={item.id}>
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
                               <div className="hidden sm:flex items-center gap-1 shrink-0">
                                 <Link href={`/dashboard/places/${item.placeId}`} passHref>
                                   <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-primary/10 h-8 w-8">
                                     <ExternalLink className="h-4 w-4" />
                                   </Button>
                                 </Link>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className="text-slate-300 hover:text-destructive hover:bg-destructive/10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                                   onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </div>
                             </div>
 
                             {/* Bottom row: Badge and Mobile Actions */}
                             <div className="flex items-center justify-between w-full pl-9">
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
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className="text-slate-400 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                   onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                                 >
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Driver Assignment - Only for Admins */}
      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h3 className="font-semibold text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Tildelt Sjåfør
               </h3>
               <p className="text-sm text-muted-foreground">Velg hvem som skal kjøre denne ruten.</p>
            </div>
            <div>
                <Select 
                  value={route.driverId || "unassigned"} 
                  onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}
                >
                  <SelectTrigger className="w-full sm:w-[300px] h-10 border-slate-200 shadow-sm">
                    <SelectValue placeholder="Velg sjåfør..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                    {organizationUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="border-slate-200 shadow-sm bg-slate-50/50">
         <CardContent className="p-6 space-y-4">
            {placesCount > 2 && (
               <Button 
                 variant="outline" 
                 className="w-full shadow-sm font-semibold h-12 bg-white"
                 onClick={handleOptimizeRoute} 
                 disabled={isOptimizing || isSaving}
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

    </div>
  );
}
