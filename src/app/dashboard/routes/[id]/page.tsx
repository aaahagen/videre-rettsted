
'use client';

import { useEffect, useState, useRef } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft, Clock, Car, ExternalLink, CheckCircle2, Circle, Coffee, Wrench, Home, Flag, Info, FileText, Edit2, X, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { deleteField } from 'firebase/firestore';

import { firebaseDB, markPlaceVisited } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Place, Route, CompletedStopEvent, ProofOfDelivery, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

type RouteItemType = 'place' | 'start' | 'end' | 'break' | 'service';

interface RouteItem {
  id: string;
  type: RouteItemType;
  placeId?: string;
  placeData?: Place;
  orderId?: string;
  orderData?: Order;
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
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const [assignedVehicle, setAssignedVehicle] = useState<any>(null);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  
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
  const [capacityWarnings, setCapacityWarnings] = useState<string[]>([]);
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});
  const [completedStopEvents, setCompletedStopEvents] = useState<Record<string, CompletedStopEvent>>({});
  const { getPosition } = useGeolocation();
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [finishConfirmationText, setFinishConfirmationText] = useState('');
  const [podModalOpen, setPodModalOpen] = useState(false);
  const [currentPodPlaceId, setCurrentPodPlaceId] = useState<string | null>(null);
  const [currentPodPlaceName, setCurrentPodPlaceName] = useState('');

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

  useEffect(() => {
    if (!assignedVehicle) {
      setCapacityWarnings([]);
      return;
    }
    
    let totalWeight = 0;
    let totalVolume = 0;
    let totalPallets = 0;
    
    routeItems.forEach(item => {
      if (item.type === 'place' && item.orderData) {
        totalWeight += item.orderData.details.weight || 0;
        totalVolume += item.orderData.details.volume || 0;
        if (item.orderData.details.form === 'pallet') {
          totalPallets += 1;
        }
      }
    });
    
    const warnings: string[] = [];
    if (assignedVehicle.capacity?.weight && totalWeight > assignedVehicle.capacity.weight) {
      warnings.push(`Total vekt (${totalWeight} kg) overstiger kjøretøyets kapasitet (${assignedVehicle.capacity.weight} kg).`);
    }
    if (assignedVehicle.capacity?.volume && totalVolume > assignedVehicle.capacity.volume) {
      warnings.push(`Totalt volum (${totalVolume} m³) overstiger kjøretøyets kapasitet (${assignedVehicle.capacity.volume} m³).`);
    }
    if (assignedVehicle.capacity?.pallets && totalPallets > assignedVehicle.capacity.pallets) {
      warnings.push(`Totalt antall paller (${totalPallets}) overstiger kjøretøyets kapasitet (${assignedVehicle.capacity.pallets}).`);
    }
    
    setCapacityWarnings(warnings);
  }, [routeItems, assignedVehicle]);

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
            
            const [routeData, placesData, usersData, allOrdersData, vehiclesData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
              firebaseDB.getOrders(userDoc.orgId),
              firebaseDB.getVehicles(userDoc.orgId),
            ]);
            
            if (routeData && routeData.vehicleId) {
               try {
                   const vehicle = await firebaseDB.getVehicle(routeData.vehicleId);
                   setAssignedVehicle(vehicle);
               } catch (e) {
                   console.error("Failed to load vehicle", e);
               }
            }
            
            if (routeData) {
              setRoute(routeData);
              setAllPlaces(placesData);
              setPendingOrders(allOrdersData.filter(o => o.status === 'pending' || (o.routeId === routeId)));
              setOrganizationUsers(usersData);
              setAllVehicles(vehiclesData);
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
                routeData.places.forEach(placeId => { const orderId = placeId; const order = allOrdersData.find(o => o.id === orderId);
                if (order) { const placeData = placesData.find(p => p.id === order.placeId);
                  if (placeData) initialItems.push({ id: `order_${orderId}`, type: 'place', placeId: placeData.id, placeData, orderId: orderId, orderData: order });
                } else {
                  const placeData = placesData.find(p => p.id === placeId);
                  if (placeData) initialItems.push({ id: `place_${placeId}`, type: 'place', placeId: placeId, placeData }); }
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

  const handleAddOrder = (orderId: string) => {
    const orderToAdd = pendingOrders.find(o => o.id === orderId);
    if (!orderToAdd) return;
    const placeToAdd = allPlaces.find(p => p.id === orderToAdd.placeId);
    if (placeToAdd && !routeItems.some(i => i.type === 'place' && i.orderId === orderId)) {
      setRouteItems(prev => [...prev, { id: `order_${orderId}`, type: 'place', placeId: placeToAdd.id, placeData: placeToAdd, orderId: orderId, orderData: orderToAdd }]);
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
    if (route?.status === 'completed' && !isAdmin) {
        toast({ title: 'Ruten er låst', description: 'Du kan ikke endre en fullført rute.' });
        return;
    }

    const isNowCompleted = !completedStops[itemId];
    
    // If completing a PLACE, open the POD Modal instead of instantly checking it off.
    if (isNowCompleted && itemId.startsWith('place_')) {
       const placeId = itemId.replace('place_', '');
       const placeName = routeItems.find(i => i.id === itemId)?.placeData?.name || 'Sted';
       setCurrentPodPlaceId(placeId);
       setCurrentPodPlaceName(placeName);
       setPodModalOpen(true);
       return; // Stop here, the modal will handle the save.
    }

    // For un-completing or for non-place items (start/end/break)
    setCompletedStops(prev => ({ ...prev, [itemId]: isNowCompleted }));

    let newEvents = { ...completedStopEvents };
    if (!isNowCompleted) {
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
        
        // Gamification: Mark place as visited for the driver
        if (isNowCompleted && itemId.startsWith('place_')) {
           const placeId = itemId.replace('place_', '');
           if (userData?.id) {
               try {
                  await markPlaceVisited(userData.id, placeId);
               } catch (e) {
                  console.error("Could not mark place as visited", e);
               }
           }
        }
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
        
      const placeIds = routeItems.filter(i => i.type === 'place').map(i => i.orderId ? i.orderId : i.placeId!);

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
      
      // Prevent saving an active route if it was a template that we are now "starting"
      // Actually, if it's a template, maybe we shouldn't let them complete it.
      // We will handle "starting a template" by copying it to a new active route instead.
      
      (updatedRoute as any).baseAddress = deleteField();
      
      await firebaseDB.updateRoute(routeId, updatedRoute);
      for (const item of routeItems) {
        if (item.type === 'place' && item.orderId) {
          await firebaseDB.updateOrder(route.orgId, item.orderId, { routeId: routeId });
        }
      }
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

  
  const handlePodConfirm = async (podData: Partial<ProofOfDelivery>, filesToUpload: File[]) => {
      if (!currentPodPlaceId || !userData?.orgId) return;
      
      const itemId = `place_${currentPodPlaceId}`;
      setPodModalOpen(false);
      setIsSaving(true);
      
      try {
          // 1. Get Location
          let coords;
          try {
            coords = await getPosition();
          } catch (e) {
            console.warn('Could not get location', e);
          }
          
          // 2. Upload Photos if any
          const uploadedPhotos: any[] = [];
          if (filesToUpload.length > 0 && podData.photos) {
              for (let i = 0; i < filesToUpload.length; i++) {
                 const file = filesToUpload[i];
                 const type = podData.photos[i].type;
                 // Dummy upload for now, ideally use firebaseStorage.uploadFile
                 // const url = await firebaseStorage.uploadFile(userData.orgId, `pod_photos/${routeId}/${currentPodPlaceId}/${Date.now()}_${i}`, file);
                 // uploadedPhotos.push({ url, type, uploadedAt: new Date().toISOString() });
              }
          }
          
          // 3. Construct POD object
          const finalPod: ProofOfDelivery = {
              ...(podData as any),
              timestamp: new Date().toISOString(),
              coordinates: coords || undefined,
              photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
          };
          
          // 4. Update local state
          const newEvent: CompletedStopEvent = {
            placeId: currentPodPlaceId,
            timestamp: finalPod.timestamp,
            coordinates: coords,
            pod: finalPod
          };
          
          const newEvents = { ...completedStopEvents, [itemId]: newEvent };
          setCompletedStopEvents(newEvents);
          setCompletedStops(prev => ({ ...prev, [itemId]: true }));
          
          // 5. Save to DB
          if (route && userData?.role !== 'admin') {
             const currentCompletedStops = Object.entries({ ...completedStops, [itemId]: true }).filter(([_, isCompleted]) => isCompleted).map(([id]) => id);
             await firebaseDB.updateRoute(routeId, { 
                completedStops: currentCompletedStops,
                completedStopEvents: newEvents
             });
             toast({ title: 'Stopp fullført', description: 'Leveringsbevis er lagret.' });
          }
          
      } catch (e) {
          console.error("Error saving POD", e);
          toast({ title: 'Feil', description: 'Kunne ikke lagre leveringsbevis.', variant: 'destructive' });
      } finally {
          setIsSaving(false);
          setCurrentPodPlaceId(null);
      }
  };

  const handleFinishRoute = async () => {
    if (finishConfirmationText.toLowerCase() !== 'ferdig') {
        toast({ title: 'Bekreftelse mangler', description: 'Du må skrive "Ferdig" for å bekrefte.', variant: 'destructive' });
        return;
    }

    if (!route) return;
    setIsSaving(true);
    try {
      await firebaseDB.updateRoute(routeId, { status: 'completed' });
      toast({ title: 'Rute Fullført', description: 'Flott jobba! Ruten er nå arkivert.' });
      router.push('/dashboard/routes');
    } catch (err) {
      console.error('Error finishing route:', err);
      toast({ title: 'Feil', description: 'Kunne ikke fullføre ruten.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
      setIsFinishDialogOpen(false);
    }
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
    <div className="mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
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
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Distanse
                  </span>
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
              
              {assignedVehicle && (assignedVehicle.dimensions?.height || assignedVehicle.dimensions?.width || assignedVehicle.dimensions?.length) && (
                <>
                  <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scaling text-amber-600"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M14 15H9v-5"/><path d="M16 3h5v5"/><path d="M21 3l-6 6"/></svg>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Kjøretøy: {assignedVehicle.name}</span>
                      <span className="font-semibold text-sm text-slate-800">
                        {assignedVehicle.dimensions.height && <span className="mr-2">H: {assignedVehicle.dimensions.height}m</span>}
                        {assignedVehicle.dimensions.width && <span className="mr-2">B: {assignedVehicle.dimensions.width}m</span>}
                        {assignedVehicle.dimensions.length && <span>L: {assignedVehicle.dimensions.length}m</span>}
                      </span>
                    </div>
                  </div>
                </>
              )}
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
                        <div className="flex flex-col gap-4">
                    <Select onValueChange={handleAddOrder}>
                            <SelectTrigger className="shadow-sm">
                            <SelectValue placeholder="Søk og velg et sted..." />
                            </SelectTrigger>
                            <SelectContent>
                            {pendingOrders.map(order => (
                                <SelectItem key={order.id} value={order.id} disabled={routeItems.some(i => i.type === 'place' && i.orderId === order.id)}>
                                {order.barcode} - {allPlaces.find(p => p.id === order.placeId)?.name}

                                </SelectItem>
                            ))}

                            </SelectContent>
                        </Select>
                    <Select 
                      value={route.vehicleId || "unassigned"} 
                      onValueChange={(val) => {
                        const newRoute = {...route, vehicleId: val === "unassigned" ? "" : val};
                        setRoute(newRoute);
                        setAssignedVehicle(allVehicles.find(v => v.id === val));
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[300px] h-10 border-slate-200 shadow-sm">
                        <SelectValue placeholder="Velg kjøretøy..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                        {allVehicles.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
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
                 <CardTitle className="text-lg flex items-center gap-2">
                    Rekkefølge 
                    {isEditMode && <Badge variant="outline" className="text-[10px] ml-2">Redigeringsmodus</Badge>}
                    {route?.status === 'template' && <Badge variant="secondary" className="text-[10px] ml-2 bg-indigo-100 text-indigo-700">MAL</Badge>}
                 </CardTitle>
                 {isEditMode && <span className="text-xs text-muted-foreground mt-1 block">Dra og slipp for å endre rekkefølge</span>}
              </div>
              {!isAdmin && route?.status !== 'completed' && (
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
            {/* Route Notes - Integrated at the top of the list for drivers/viewers */}
            {!isEditMode && routeNotes && (
              <div className="bg-amber-50 border-b border-amber-100 p-4 shrink-0">
                <div className="flex items-center gap-2 mb-2 text-amber-800">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Viktig Informasjon</span>
                </div>
                <div className="text-sm text-amber-900 whitespace-pre-wrap font-medium">
                  {routeNotes}
                </div>
              </div>
            )}

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
                                            {item.orderData && (
                                                <span className="text-xs text-muted-foreground break-words">
                                                    Ordre: {item.orderData.barcode} - Vekt: {item.orderData.details.weight || 'Ikke satt'} kg - Volum: {item.orderData.details.volume || 'Ikke satt'} m³ - Type: {item.orderData.details.form || 'Pakke'}
                                                </span>
                                            )}
                                            {item.orderData && (item.orderData.details.specialRequirements?.adr || item.orderData.details.specialRequirements?.temperatureControlled || item.orderData.details.specialRequirements?.fragile) && (
                                                <div className="flex gap-1 mt-1">
                                                    {item.orderData.details.specialRequirements?.adr && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">ADR</Badge>}
                                                    {item.orderData.details.specialRequirements?.temperatureControlled && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Kjøl/Frys</Badge>}
                                                    {item.orderData.details.specialRequirements?.fragile && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Skjør</Badge>}
                                                </div>
                                            )}
                                            <span className={`font-semibold break-words transition-colors ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`} style={{display: 'none'}}>
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
                  {!isAdmin && !isEditMode && routeItems.length > 0 && route?.status !== 'completed' && route?.status !== 'template' && (
                      <div className="mt-8 pt-4 border-t border-slate-100">
                          <Button 
                              onClick={() => setIsFinishDialogOpen(true)}
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

                  {!isAdmin && route?.status === 'completed' && (
                      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 p-4 rounded-lg">
                          <CheckCircle2 className="h-6 w-6" />
                          Ruten er fullført og låst
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
                    <div className="flex flex-col gap-4">
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
                    <Select 
                      value={route.vehicleId || "unassigned"} 
                      onValueChange={(val) => {
                        const newRoute = {...route, vehicleId: val === "unassigned" ? "" : val};
                        setRoute(newRoute);
                        setAssignedVehicle(allVehicles.find(v => v.id === val));
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[300px] h-10 border-slate-200 shadow-sm">
                        <SelectValue placeholder="Velg kjøretøy..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" className="text-muted-foreground italic">Ikke tildelt</SelectItem>
                        {allVehicles.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
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
                {route?.status === 'template' ? (
                   <Button 
                     className="w-full shadow-sm font-bold h-12 text-md bg-indigo-600 hover:bg-indigo-700 text-white"
                     onClick={async () => {
                         if (!route) return;
                         setIsSaving(true);
                         try {
                           const placeIds = routeItems.filter(i => i.type === 'place').map(i => i.orderId ? i.orderId : i.placeId!);
                           const newRoute = await firebaseDB.createRoute({
                             name: `Ny rute fra ${route.name}`,
                             orgId: route.orgId,
                             status: 'active',
                             places: placeIds,
                             startAddress,
                             endAddress,
                             notes: routeNotes,
                             prepTimeStart,
                             prepTimeEnd,
                             breakTime,
                             fuelServiceTime,
                           });
            
                           toast({ title: 'Rute Opprettet', description: 'En ny aktiv rute ble opprettet fra malen.' });
                           router.push(`/dashboard/routes/${newRoute.id}`);
                         } catch(e) {
                           toast({ title: 'Feil', description: 'Kunne ikke opprette rute fra mal', variant: 'destructive' });
                         } finally { setIsSaving(false); }
                     }} 
                     disabled={isSaving || isCalculating}
                  >
                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RouteIcon className="mr-2 h-5 w-5" />}
                     Opprett ny rute fra denne malen
                  </Button>
                ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  {isAdmin && (
                  <Button 
                     variant="secondary"
                     className="w-full sm:w-1/3 shadow-sm font-bold h-12 text-md border border-slate-200"
                     onClick={async () => {
                         if (!route) return;
                         setIsSaving(true);
                         try {
                           const placeIds = routeItems.filter(i => i.type === 'place').map(i => i.orderId ? i.orderId : i.placeId!);
                           await firebaseDB.createRoute({
                             name: `Mal: ${route.name}`,
                             orgId: route.orgId,
                             status: 'template',
                             places: placeIds,
                             startAddress,
                             endAddress,
                             notes: routeNotes,
                             prepTimeStart,
                             prepTimeEnd,
                             breakTime,
                             fuelServiceTime,
                           });
            
                           toast({ title: 'Mal Lagret', description: 'En kopi av ruten ble lagret som mal.' });
                         } catch(e) {
                           toast({ title: 'Feil', description: 'Kunne ikke lagre mal', variant: 'destructive' });
                         } finally { setIsSaving(false); }
                     }} 
                     disabled={isSaving || isCalculating}
                  >
                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Lagre som Mal
                  </Button>
                  )}
                  <Button 
                     className={cn("w-full shadow-sm font-bold h-12 text-md", isAdmin ? "sm:w-2/3" : "")}
                     onClick={handleSave} 
                     disabled={isSaving || isCalculating}
                  >
                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Lagre Endringer
                  </Button>
                </div>
                )}
             </CardContent>
          </Card>
      )}

          {/* Finish Confirmation Dialog */}
      <AlertDialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du helt ferdig med ruten?</AlertDialogTitle>
            <AlertDialogDescription>
              Når du fullfører ruten vil den bli låst for endringer. 
              <br/><br/>
              Skriv <span className="font-bold text-slate-900">"Ferdig"</span> i feltet under for å bekrefte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input 
              value={finishConfirmationText}
              onChange={(e) => setFinishConfirmationText(e.target.value)}
              placeholder='Skriv "Ferdig" her...'
              className="bg-slate-50 border-slate-200"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFinishConfirmationText('')}>Avbryt</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFinishRoute}
              disabled={finishConfirmationText.toLowerCase() !== 'ferdig' || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              Fullfør og arkiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
</div>
  );
}
