'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, Trash2, GripVertical, Wand2, Save, Route as RouteIcon, MapPin, ChevronLeft, Clock, Key, Car, Truck, ExternalLink, CheckCircle2, Circle, Coffee, Wrench, Home, Flag, Info, FileText, Edit2, X, Check, AlertCircle, MessageSquare, AlertTriangle, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { deleteField, doc, onSnapshot } from 'firebase/firestore';

import { firebaseDB } from '@/lib/firebase/database';
import { auth, db } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { Place, Route, CompletedStopEvent, ProofOfDelivery, Order, Manifest, Vehicle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { format, addMinutes, parse, isValid } from 'date-fns';
import { nb } from 'date-fns/locale';
import { VehicleInspectionForm } from '@/components/fleet/vehicle-inspection-form';

type RouteItemType = 'place' | 'start' | 'end' | 'break' | 'service';

interface RouteItem {
  id: string;
  type: RouteItemType;
  placeId?: string;
  placeData?: Place;
  orderId?: string;
  orderData?: Order;
  duration?: number;
  eta?: string; 
  isOutsideOpeningHours?: boolean;
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
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<any>(null);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  
  const [routeItems, setRouteItems] = useState<RouteItem[]>([]);
  const [distance, setDistance] = useState('N/A');
  const [duration, setDuration] = useState('N/A');
  
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [routeNotes, setRouteNotes] = useState('');
  const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [prepTimeStart, setPrepTimeStart] = useState<number>(0);
  const [prepTimeEnd, setPrepTimeEnd] = useState<number>(0);
  const [breakTime, setBreakTime] = useState<number>(0);
  const [fuelServiceTime, setFuelServiceTime] = useState<number>(0);
  const [baseDurationSeconds, setBaseDurationSeconds] = useState<number>(0);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [capacityWarnings, setCapacityWarnings] = useState<string[]>([]);
  const [workHoursWarning, setWorkHoursWarning] = useState<string | null>(null);
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

  const [manifest, setManifest] = useState<Manifest | null>(null);

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

  const isAdmin = userData?.role === 'admin';

  // --- ETA Calculation Logic ---
  const routeItemsWithEtas = useMemo(() => {
    if (routeItems.length === 0) return [];
    
    let currentTime = parse(startTime, 'HH:mm', new Date());
    const dayName = format(new Date(routeDate), 'eeee', { locale: nb }).toLowerCase() as keyof NonNullable<Place['weeklySchedule']>;
    
    const drivingTimeBetweenStopsSeconds = baseDurationSeconds > 0 
        ? baseDurationSeconds / (routeItems.filter(i => i.type === 'place').length + 1)
        : 10 * 60; 
    
    return routeItems.map((item) => {
        let durationMinutes = 0;
        if (item.type === 'place') {
            durationMinutes = item.placeData?.estimatedDeliveryTime || 0;
            currentTime = addMinutes(currentTime, drivingTimeBetweenStopsSeconds / 60);
        } else {
            durationMinutes = item.duration || 0;
        }

        const eta = format(currentTime, 'HH:mm');
        let isOutsideOpeningHours = false;
        if (item.type === 'place' && item.placeData?.weeklySchedule) {
            const schedule = (item.placeData.weeklySchedule as any)[dayName];
            if (!schedule || !schedule.isOpen) {
                isOutsideOpeningHours = true;
            } else if (schedule.open && schedule.close) {
                const openTime = parse(schedule.open, 'HH:mm', new Date());
                const closeTime = parse(schedule.close, 'HH:mm', new Date());
                if (currentTime < openTime || currentTime > closeTime) {
                    isOutsideOpeningHours = true;
                }
            }
        }
        currentTime = addMinutes(currentTime, durationMinutes);
        return { ...item, eta, isOutsideOpeningHours };
    });
  }, [routeItems, startTime, routeDate, baseDurationSeconds]);

  useEffect(() => {
    if (!assignedDriver || !routeDate) {
      setWorkHoursWarning(null);
      return;
    }
    const driverProfile = assignedDriver as import('@/lib/types').DriverProfile;
    if (!driverProfile.workingHours || !driverProfile.workingHours.start || !driverProfile.workingHours.end) {
       setWorkHoursWarning(null);
       return;
    }
    const routeDateObj = new Date(routeDate);
    const dayOfWeekStr = routeDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (driverProfile.rotation && driverProfile.rotation.weeks && driverProfile.rotation.weeks.length > 0) {
        const week = driverProfile.rotation.weeks[0];
        const dayConfig = (week.days as any)[dayOfWeekStr];
        if (dayConfig && !dayConfig.isWorking) {
            setWorkHoursWarning(`Sjåføren er ikke satt opp til å jobbe denne dagen (${routeDate}).`);
            return;
        }
    }
    if (driverProfile.scheduleOverrides) {
       for (const overrideId in driverProfile.scheduleOverrides) {
          const override = driverProfile.scheduleOverrides[overrideId];
          if (override.start && override.end) {
             const overrideStart = new Date(override.start);
             const overrideEnd = new Date(override.end);
             if (routeDateObj >= overrideStart && routeDateObj <= overrideEnd) {
                if (override.type === 'off' || override.type === 'sick' || override.type === 'vacation') {
                    setWorkHoursWarning(`Sjåføren har registrert fravær (${override.type}) denne dagen.`);
                    return;
                }
             }
          }
       }
    }
    setWorkHoursWarning(null);
  }, [assignedDriver, routeDate]);

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
        if (item.orderData.details.form === 'pallet') totalPallets += 1;
      }
    });
    const warnings: string[] = [];
    if (assignedVehicle.capacity?.weight && totalWeight > assignedVehicle.capacity.weight) warnings.push(`Total vekt (${totalWeight} kg) overstiger kjøretøyets kapasitet.`);
    if (assignedVehicle.capacity?.volume && totalVolume > assignedVehicle.capacity.volume) warnings.push(`Totalt volum (${totalVolume} m³) overstiger kjøretøyets kapasitet.`);
    if (assignedVehicle.capacity?.pallets && totalPallets > assignedVehicle.capacity.pallets) warnings.push(`Totalt antall paller (${totalPallets}) overstiger kjøretøyets kapasitet.`);
    setCapacityWarnings(warnings);
  }, [routeItems, assignedVehicle]);

  useEffect(() => {
    const totalPlacesDeliveryTimeMinutes = routeItems
      .filter(item => item.type === 'place' && item.placeData?.estimatedDeliveryTime)
      .reduce((sum, item) => sum + (item.placeData!.estimatedDeliveryTime || 0), 0);
    const totalSeconds = baseDurationSeconds + ((prepTimeStart + prepTimeEnd + breakTime + fuelServiceTime + totalPlacesDeliveryTimeMinutes) * 60);
    if (totalSeconds === 0) setDuration('N/A');
    else {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        setDuration(hours > 0 ? `${hours} t ${minutes} min` : `${minutes} min`);
    }
  }, [routeItems, baseDurationSeconds, prepTimeStart, prepTimeEnd, breakTime, fuelServiceTime]);

  useEffect(() => {
    if (isDataLoading) return;
    const placesToCalculate = routeItems.filter(item => item.type === 'place' && item.placeId).map(item => item.placeId!);
    const currentPlaceIdsString = JSON.stringify(placesToCalculate) + startAddress + endAddress;
    if (currentPlaceIdsString === lastCalculatedPlaceIdsRef.current && distance !== 'N/A') return;
    const calculateDistance = async () => {
      setIsCalculating(true);
      lastCalculatedPlaceIdsRef.current = currentPlaceIdsString;
      const validStart = startAddress && startAddress.trim() !== '';
      const validEnd = endAddress && endAddress.trim() !== '';
      let totalPoints = placesToCalculate.length + (validStart ? 1 : 0) + (validEnd ? 1 : 0);
      if (placesToCalculate.length === 0 || totalPoints < 2) {
        setDistance('N/A');
        setBaseDurationSeconds(0);
        setIsCalculating(false);
        return;
      }
      try {
        const functions = getFunctions();
        const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
        const result = await calculateDistanceFn({ placeIds: placesToCalculate, startAddress, endAddress });
        const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
        setDistance(`${data.distance.toFixed(1)} km`);
        setBaseDurationSeconds(data.duration || 0); 
      } catch (err: any) {
        setDistance('Error');
        setBaseDurationSeconds(0);
        toast({ title: 'Kalkuleringsfeil', description: 'Kunne ikke beregne avstand.', variant: 'destructive' });
      } finally {
        setIsCalculating(false);
      }
    };
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(calculateDistance, 1000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [routeItems, startAddress, endAddress, isDataLoading, toast, distance]);

  useEffect(() => {
    if (user && routeId) {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          const userDoc = await firebaseDB.getUser(user.uid);
          if (userDoc?.orgId) {
            setUserData(userDoc);
            if (userDoc.role === 'admin') setIsEditMode(true);
            const manifestUnsub = onSnapshot(doc(db, 'organizations', userDoc.orgId, 'manifests', routeId), (snap) => {
                if (snap.exists()) setManifest({ id: snap.id, ...snap.data() } as Manifest);
                else firebaseDB.getManifestByRoute(userDoc.orgId, routeId).then(setManifest);
            });
            const [routeData, placesData, usersData, allOrdersData, vehiclesData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
              firebaseDB.getOrders(userDoc.orgId),
              firebaseDB.getVehicles(userDoc.orgId),
            ]);
            if (routeData && routeData.vehicleId) firebaseDB.getVehicle(routeData.vehicleId).then(setAssignedVehicle);
            if (routeData && routeData.driverId) setAssignedDriver(usersData.find(u => u.id === routeData.driverId));
            if (routeData) {
              setRoute(routeData);
              setAllPlaces(placesData);
              setPendingOrders(allOrdersData.filter(o => o.status === 'pending' || (o.routeId === routeId)));
              setOrganizationUsers(usersData);
              setAllVehicles(vehiclesData);
              setRouteNotes(routeData.notes || '');
              setRouteDate(routeData.date || new Date().toISOString().split('T')[0]);
              setStartTime((routeData as any).startTime || '08:00');
              setStartAddress(routeData.startAddress || (routeData as any).baseAddress || '');
              setEndAddress(routeData.endAddress || (routeData as any).baseAddress || '');
              setPrepTimeStart(routeData.prepTimeStart || 0);
              setPrepTimeEnd(routeData.prepTimeEnd || 0);
              setBreakTime(routeData.breakTime || 0);
              setFuelServiceTime(routeData.fuelServiceTime || 0);
              if (routeData.completedStopEvents) setCompletedStopEvents(routeData.completedStopEvents);
              if (routeData.completedStops) {
                const stopsMap: Record<string, boolean> = {};
                routeData.completedStops.forEach(id => { stopsMap[id] = true; });
                setCompletedStops(stopsMap);
              }
              let initialItems: RouteItem[] = [];
              if (routeData.prepTimeStart && routeData.prepTimeStart > 0) initialItems.push({ id: 'special_start', type: 'start', duration: routeData.prepTimeStart });
              if (routeData.places) {
                routeData.places.forEach(placeId => { 
                  const order = allOrdersData.find(o => o.id === placeId);
                  if (order) { 
                    const placeData = placesData.find(p => p.id === order.placeId);
                    if (placeData) initialItems.push({ id: `order_${order.id}`, type: 'place', placeId: placeData.id, placeData, orderId: order.id, orderData: order });
                  } else {
                    const placeData = placesData.find(p => p.id === placeId);
                    if (placeData) initialItems.push({ id: `place_${placeId}`, type: 'place', placeId: placeId, placeData }); 
                  }
                });
              }
              if (routeData.breakTime && routeData.breakTime > 0) initialItems.push({ id: 'special_break', type: 'break', duration: routeData.breakTime });
              if (routeData.fuelServiceTime && routeData.fuelServiceTime > 0) initialItems.push({ id: 'special_service', type: 'service', duration: routeData.fuelServiceTime });
              if (routeData.prepTimeEnd && routeData.prepTimeEnd > 0) initialItems.push({ id: 'special_end', type: 'end', duration: routeData.prepTimeEnd });
              setRouteItems(initialItems);
            }
          }
        } catch (err) {
          toast({ title: 'Feil', description: 'Kunne ikke laste rutedata.', variant: 'destructive' });
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, routeId, toast]);

  const handleAddOrder = (orderId: string) => {
    const orderToAdd = pendingOrders.find(o => o.id === orderId);
    if (!orderToAdd) return;
    const placeToAdd = allPlaces.find(p => p.id === orderToAdd.placeId);
    if (placeToAdd && !routeItems.some(i => i.type === 'place' && i.orderId === orderId)) {
      setRouteItems(prev => [...prev, { id: `order_${orderId}`, type: 'place', placeId: placeToAdd.id, placeData: placeToAdd, orderId: orderId, orderData: orderToAdd }]);
    }
  };

  const handleRemoveItem = (itemId: string) => setRouteItems(prev => prev.filter(i => i.id !== itemId));
  
  const handleTimeSettingChange = (type: RouteItemType, value: number) => {
     let newItems = [...routeItems];
     if (value > 0) {
         const existingIndex = newItems.findIndex(i => i.type === type);
         if (existingIndex >= 0) newItems[existingIndex].duration = value;
         else {
             const newItem: RouteItem = { id: `special_${type}`, type, duration: value };
             if (type === 'start') newItems.unshift(newItem);
             else if (type === 'end') newItems.push(newItem);
             else {
                 const endIndex = newItems.findIndex(i => i.type === 'end');
                 endIndex >= 0 ? newItems.splice(endIndex, 0, newItem) : newItems.push(newItem);
             }
         }
     } else newItems = newItems.filter(i => i.type !== type);
     setRouteItems(newItems);
     if (type === 'start') setPrepTimeStart(value);
     if (type === 'end') setPrepTimeEnd(value);
     if (type === 'break') setBreakTime(value);
     if (type === 'service') setFuelServiceTime(value);
  };

  const toggleItemCompletion = async (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (route?.status === 'completed' && !isAdmin) {
        toast({ title: 'Ruten er låst' });
        return;
    }
    const isNowCompleted = !completedStops[itemId];
    setCompletedStops(prev => ({ ...prev, [itemId]: isNowCompleted }));
    let newEvents = { ...completedStopEvents };
    if (!isNowCompleted) delete newEvents[itemId];
    setCompletedStopEvents(newEvents);
    if (route && userData?.role !== 'admin') {
      try {
        const currentCompletedStops = Object.entries({ ...completedStops, [itemId]: isNowCompleted }).filter(([_, isCompleted]) => isCompleted).map(([id]) => id);
        await firebaseDB.updateRoute(routeId, { completedStops: currentCompletedStops, completedStopEvents: newEvents });
      } catch (err) {
        setCompletedStops(prev => ({ ...prev, [itemId]: !isNowCompleted }));
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
      toast({ title: 'Info', description: 'Trenger minst 3 stopp.' });
      return;
    }
    setIsOptimizing(true);
    try {
      const functions = getFunctions();
      const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
      const result = await calculateDistanceFn({ placeIds: placeItems.map(p => p.placeId!), startAddress, endAddress, optimizeRoute: true });
      const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
      if (data.waypointOrder && data.waypointOrder.length > 0) {
        let optimizedPlaceItems: RouteItem[] = [];
        const validStart = startAddress && startAddress.trim() !== '';
        const validEnd = endAddress && endAddress.trim() !== '';
        if (validStart && validEnd) optimizedPlaceItems = data.waypointOrder.map(index => placeItems[index]);
        else if (validStart && !validEnd) optimizedPlaceItems = [...data.waypointOrder.map(index => placeItems.slice(0,-1)[index]), placeItems[placeItems.length-1]];
        else if (!validStart && validEnd) optimizedPlaceItems = [placeItems[0], ...data.waypointOrder.map(index => placeItems.slice(1)[index])];
        else optimizedPlaceItems = [placeItems[0], ...data.waypointOrder.map(index => placeItems.slice(1,-1)[index]), placeItems[placeItems.length-1]];
        
        let optIdx = 0;
        const newItems = routeItems.map(item => item.type === 'place' ? optimizedPlaceItems[optIdx++] : item);
        setRouteItems(newItems);
        toast({ title: 'Suksess', description: 'Ruten ble optimalisert!' });
      }
    } catch (err) {
      toast({ title: 'Feil', description: 'Optimalisering feilet.', variant: 'destructive' });
    } finally { setIsOptimizing(false); }
  };

  const handleSave = async () => {
    if (!route) return;
    setIsSaving(true);
    try {
      const currentCompletedStops = Object.entries(completedStops).filter(([_, isCompleted]) => isCompleted).map(([id]) => id);
      const placeIds = routeItems.filter(i => i.type === 'place').map(i => i.orderId ? i.orderId : i.placeId!);
      const updatedRoute: Partial<Route> = {
        ...route,
        places: placeIds,
        startAddress,
        endAddress,
        notes: routeNotes,
        date: routeDate,
        completedStops: currentCompletedStops,
        completedStopEvents: completedStopEvents,
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? undefined : duration,
        distanceString: distance === 'N/A' || distance === 'Error' ? undefined : distance,
      };
      (updatedRoute as any).startTime = startTime;
      (updatedRoute as any).baseAddress = deleteField();
      await firebaseDB.updateRoute(routeId, updatedRoute);
      toast({ title: 'Suksess', description: 'Ruten er lagret.' });
      if (!isAdmin) setIsEditMode(false);
    } catch (err) {
      toast({ title: 'Feil', description: 'Kunne ikke lagre.', variant: 'destructive' });
    } finally { setIsSaving(false); }
  };

  const handleFinishRoute = async () => {
    if (finishConfirmationText.toLowerCase() !== 'ferdig') return;
    if (!route) return;
    setIsSaving(true);
    try {
      await firebaseDB.updateRoute(routeId, { status: 'completed' });
      toast({ title: 'Rute Fullført' });
      router.push('/dashboard/routes');
    } catch (err) {
      toast({ title: 'Feil', variant: 'destructive' });
    } finally {
      setIsSaving(false);
      setIsFinishDialogOpen(false);
    }
  };

  if (loading || isDataLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!route) return <div className="text-center py-12">Ruten ble ikke funnet.</div>;

  const allStopsCompleted = routeItems.length > 0 && routeItems.every(item => completedStops[item.id]);
  const placesCount = routeItems.filter(i => i.type === 'place').length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-2">
        <ChevronLeft className="h-4 w-4" />
        <Link href="/dashboard/routes" className="text-sm font-medium">Tilbake til Ruter</Link>
      </div>

      <Card className="border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0"><RouteIcon className="h-8 w-8 text-primary" /></div>
                  <Input className="text-3xl font-bold h-auto py-2 px-3 bg-white/50 border-slate-200" value={route.name} onChange={(e) => setRoute({...route, name: e.target.value})} placeholder="Navn på rute..." readOnly={!isAdmin} />
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm w-full">
                    <FileText className="h-4 w-4 text-slate-400 ml-2 shrink-0" />
                    <Input value={route.shipmentNumber || ''} onChange={(e) => setRoute({...route, shipmentNumber: e.target.value})} placeholder="Fraktnummer (valgfritt)" className="border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm" readOnly={!isAdmin} />
                </div>
            </div>
            
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm w-full">
                        <Home className="h-4 w-4 text-blue-400 ml-2 shrink-0" />
                        <Input value={startAddress} onChange={(e) => setStartAddress(e.target.value)} placeholder="Startadresse" className="border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm" />
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm w-full">
                        <Flag className="h-4 w-4 text-indigo-400 ml-2 shrink-0" />
                        <Input value={endAddress} onChange={(e) => setEndAddress(e.target.value)} placeholder="Sluttadresse" className="border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm" />
                    </div>
                </div>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-indigo-500" /><div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stopp</span><span className="font-bold text-lg">{placesCount}</span></div></div>
              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2"><Car className="h-5 w-5 text-emerald-500" /><div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Distanse</span>{isCalculating ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" /> : <span className={`font-bold text-lg ${distance === 'Error' ? 'text-destructive' : ''}`}>{distance === 'Error' ? 'Feil' : distance}</span>}</div></div>
              <Separator orientation="vertical" className="h-8 hidden sm:block bg-slate-200" />
              <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-amber-500" /><div className="flex flex-col"><span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Tid</span>{isCalculating ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" /> : <span className="font-bold text-lg">{duration}</span>}</div></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isAdmin && assignedVehicle && route?.status !== 'completed' && (
          <Card className="border-primary/20 bg-primary/5"><CardHeader className="pb-3"><CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-primary"><ClipboardCheck className="h-4 w-4" /> Bilkontroll</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-3"><VehicleInspectionForm vehicle={assignedVehicle} type="pre_trip" /><VehicleInspectionForm vehicle={assignedVehicle} type="post_trip" /></CardContent></Card>
      )}

      {isAdmin && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-slate-500" /> Tidsinnstillinger</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Rute Start</label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-10" /></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Klargjøring</label><Select value={prepTimeStart.toString()} onValueChange={(val) => handleTimeSettingChange('start', Number(val))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{[0,5,10,15,20,30,45,60].map(v => <SelectItem key={v} value={v.toString()}>{v} min</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Pause</label><Select value={breakTime.toString()} onValueChange={(val) => handleTimeSettingChange('break', Number(val))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{[0,15,30,45,60].map(v => <SelectItem key={v} value={v.toString()}>{v} min</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Drivstoff</label><Select value={fuelServiceTime.toString()} onValueChange={(val) => handleTimeSettingChange('service', Number(val))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{[0,5,10,15,20,30].map(v => <SelectItem key={v} value={v.toString()}>{v} min</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Slutt</label><Select value={prepTimeEnd.toString()} onValueChange={(val) => handleTimeSettingChange('end', Number(val))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{[0,5,10,15,20,30,45,60].map(v => <SelectItem key={v} value={v.toString()}>{v} min</SelectItem>)}</SelectContent></Select></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Keys Card */}
      {!isEditMode && routeItems.filter(i => i.type === 'place').some(item => { const p = allPlaces.find(pl => pl.id === item.placeId); return p?.doorCode && p.doorCode.some(dc => dc.category === 'Nøkkel'); }) && (
          <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardHeader className="pb-3 border-b border-amber-100 bg-amber-100/50"><CardTitle className="text-lg flex items-center text-amber-900"><Key className="mr-2 h-5 w-5" /> Nødvendige Nøkler</CardTitle></CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {routeItems.filter(i => i.type === 'place').filter(item => { const p = allPlaces.find(pl => pl.id === item.placeId); return p?.doorCode && p.doorCode.some(dc => dc.category === 'Nøkkel'); }).map(item => {
                          const p = allPlaces.find(pl => pl.id === item.placeId);
                          return (
                              <div key={item.id} className="p-3 bg-white border border-amber-200 rounded-md flex flex-col gap-2 shadow-sm">
                                  <p className="font-semibold text-sm truncate text-slate-800">{p?.name}</p>
                                  {p!.doorCode!.filter(dc => dc.category === 'Nøkkel').map((key, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-amber-50 px-2 py-1.5 rounded border border-amber-100"><span className="text-xs font-medium text-slate-600">{key.name || 'Nøkkel'}</span><span className="font-mono text-sm font-bold text-amber-700">{key.value}</span></div>
                                  ))}
                              </div>
                          );
                      })
                  }
              </CardContent>
          </Card>
      )}

      <div className={`grid grid-cols-1 gap-6 ${isAdmin || isEditMode || (!isAdmin && !isEditMode && (routeNotes || (manifest?.notes && manifest.notes.length > 0))) ? 'lg:grid-cols-12' : ''}`}>
        {(isAdmin || isEditMode || (!isAdmin && !isEditMode && (routeNotes || (manifest?.notes && manifest.notes.length > 0)))) && (
            <div className="lg:col-span-5 flex flex-col gap-6">
                {(isAdmin || isEditMode) && (
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-4"><CardTitle className="text-lg">Legg til Stopp</CardTitle></CardHeader>
                        <CardContent>
                            <Select onValueChange={handleAddOrder}><SelectTrigger className="shadow-sm"><SelectValue placeholder="Velg et sted for aktiv ordre..." /></SelectTrigger><SelectContent>
                                    {pendingOrders.map(order => (
                                        <SelectItem key={order.id} value={order.id} disabled={routeItems.some(i => i.type === 'place' && i.orderId === order.id)}>{order.barcode} - {allPlaces.find(p => p.id === order.placeId)?.name}</SelectItem>
                                    ))}
                            </SelectContent></Select>
                        </CardContent>
                    </Card>
                )}
                {(isAdmin || isEditMode || routeNotes) && (
                    <Card className="border-slate-200 shadow-sm h-fit"><CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><Info className="h-5 w-5 text-slate-400" /> Viktig Info</CardTitle></CardHeader><CardContent>
                            {isAdmin || isEditMode ? <Textarea value={routeNotes} onChange={(e) => setRouteNotes(e.target.value)} placeholder="Viktig info..." className="min-h-[120px]" /> : <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{routeNotes}</p>}
                        </CardContent></Card>
                )}
            </div>
        )}
        
        <Card className={`border-slate-200 shadow-sm flex flex-col min-h-[600px] lg:min-h-0 lg:h-auto ${(isAdmin || isEditMode || (!isAdmin && !isEditMode && (routeNotes || (manifest?.notes && manifest.notes.length > 0)))) ? 'lg:col-span-7' : ''}`}>
          <CardHeader className="pb-4 shrink-0 border-b border-slate-100"><div className="flex items-center justify-between"><CardTitle className="text-lg">Rekkefølge</CardTitle>{!isAdmin && route?.status !== 'completed' && (<Button variant={isEditMode ? "secondary" : "outline"} size="sm" onClick={() => setIsEditMode(!isEditMode)}>{isEditMode ? <><X className="h-4 w-4 mr-2" /> Avslutt</> : <><Edit2 className="h-4 w-4 mr-2" /> Rediger</>}</Button>)}</div></CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1 flex flex-col justify-between">
            {routeItemsWithEtas.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 min-h-[400px]"><MapPin className="h-12 w-12 text-slate-200 mb-2" /><p className="text-center">Ingen stopp er lagt til enda.</p></div>) : (
              <div className="p-4 flex flex-col flex-1">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={routeItemsWithEtas.map(p => p.id)} strategy={verticalListSortingStrategy}>
                      <ul className="space-y-3">
                        {routeItemsWithEtas.map((item, index) => {
                          const isCompleted = completedStops[item.id];
                          const isPlace = item.type === 'place';
                          return (
                             <SortableItem key={item.id} id={item.id} isEditMode={isEditMode}>
                                <div className={cn("flex-grow flex flex-col p-3 rounded-lg border shadow-sm transition-all group w-full gap-2", isCompleted ? 'opacity-50 grayscale bg-slate-50' : 'bg-white', !isPlace ? 'bg-slate-50 border-slate-200' : 'border-slate-200 hover:border-indigo-300', item.isOutsideOpeningHours && !isCompleted && "border-red-300 bg-red-50/30")}>
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={(e) => toggleItemCompletion(item.id, e)}>
                                      <button type="button" className={cn("shrink-0", isCompleted ? 'text-green-500' : 'text-slate-300')}>{isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}</button>
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2"><span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter">{item.eta}</span><span className={cn("font-bold text-sm truncate", isCompleted && "line-through")}>{isPlace ? item.placeData?.name : item.type === 'start' ? 'Klargjøring' : item.type === 'end' ? 'Ferdigstilling' : item.type === 'break' ? 'Pause' : 'Drivstoff'}</span>{item.isOutsideOpeningHours && !isCompleted && isPlace && (<Badge variant="destructive" className="h-4 text-[8px] font-black px-1 animate-pulse">STENGT / ETA FEIL</Badge>)}</div>
                                        {isPlace && item.orderData && (<span className="text-[10px] text-slate-400 font-medium truncate">{item.orderData.barcode} • {item.orderData.details.weight}kg • {item.placeData?.address}</span>)}
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-100 text-[10px] font-bold shrink-0">{isPlace ? (item.placeData?.estimatedDeliveryTime || 0) : item.duration} min</Badge>
                                  </div>
                                </div>
                             </SortableItem>
                          );
                        })}
                      </ul>
                    </SortableContext>
                  </DndContext>
                  {!isAdmin && !isEditMode && routeItems.length > 0 && route?.status !== 'completed' && (<div className="mt-8 pt-4 border-t border-slate-100"><Button onClick={() => setIsFinishDialogOpen(true)} disabled={!allStopsCompleted} className={cn("w-full h-14 text-lg font-bold shadow-md", allStopsCompleted ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-100 text-slate-400')}>{allStopsCompleted ? <><Check className="mr-2 h-5 w-5" /> Fullfør Rute</> : "Marker alle stopp som ferdig først"}</Button></div>)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card className="border-slate-200 shadow-sm"><CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"><div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Planlagt Dato</Label><Input type="date" value={routeDate} onChange={(e) => setRouteDate(e.target.value)} className="h-10" /></div><div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Sjåfør</Label><Select value={route.driverId || "unassigned"} onValueChange={(val) => { setRoute({...route, driverId: val === "unassigned" ? "" : val}); setAssignedDriver(organizationUsers.find(u => u.id === val)); }}><SelectTrigger className="h-10"><SelectValue placeholder="Velg sjåfør..." /></SelectTrigger><SelectContent><SelectItem value="unassigned" className="italic">Ikke tildelt</SelectItem>{organizationUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Kjøretøy</Label><Select value={route.vehicleId || "unassigned"} onValueChange={(val) => { setRoute({...route, vehicleId: val === "unassigned" ? "" : val}); setAssignedVehicle(allVehicles.find(v => v.id === val)); }}><SelectTrigger className="h-10"><SelectValue placeholder="Velg kjøretøy..." /></SelectTrigger><SelectContent><SelectItem value="unassigned" className="italic">Ikke tildelt</SelectItem>{allVehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
      )}

      {(isAdmin || isEditMode) && (
          <Card className="border-slate-200 shadow-sm bg-slate-50/50"><CardContent className="p-6 flex flex-col sm:flex-row gap-4">{placesCount > 2 && (<Button variant="outline" className="flex-1 shadow-sm font-semibold h-12 bg-white" onClick={handleOptimizeRoute} disabled={isOptimizing || isSaving || isCalculating}>{isOptimizing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5 text-indigo-500" />} Optimer</Button>)}<Button className="flex-1 shadow-sm font-bold h-12 text-md" onClick={handleSave} disabled={isSaving || isCalculating}>{isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} Lagre Endringer</Button></CardContent></Card>
      )}

      <AlertDialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Er du helt ferdig?</AlertDialogTitle><AlertDialogDescription>Skriv <span className="font-bold text-slate-900">"Ferdig"</span> for å bekrefte.</AlertDialogDescription></AlertDialogHeader><div className="py-4"><Input value={finishConfirmationText} onChange={(e) => setFinishConfirmationText(e.target.value)} placeholder='Skriv "Ferdig" her...' className="bg-slate-50 border-slate-200" /></div><AlertDialogFooter><AlertDialogCancel onClick={() => setFinishConfirmationText('')}>Avbryt</AlertDialogCancel><AlertDialogAction onClick={handleFinishRoute} disabled={finishConfirmationText.toLowerCase() !== 'ferdig' || isSaving} className="bg-green-600 hover:bg-green-700">Fullfør og arkiver</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
</div>
  );
}
