
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
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCalculateDistance = useMemo(() => {
    return (items: RouteItem[], currentStartAddress: string, currentEndAddress: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsCalculating(true);

      timeoutRef.current = setTimeout(async () => {
        const functions = getFunctions();
        const calculateDistanceFn = httpsCallable(functions, 'calculateRouteDistance');
        
        const placesToCalculate = items.filter(item => item.type === 'place' && item.placeId).map(item => item.placeId!);
        let totalPoints = placesToCalculate.length + (currentStartAddress ? 1 : 0) + (currentEndAddress ? 1 : 0);

        if (totalPoints < 2) {
          setDistance('N/A');
          setBaseDurationSeconds(0);
          setIsCalculating(false);
          return;
        }

        try {
          const result = await calculateDistanceFn({ placeIds: placesToCalculate, startAddress: currentStartAddress, endAddress: currentEndAddress });
          const data = result.data as { distance: number, duration: number, waypointOrder: number[] };
          setDistance(`${data.distance.toFixed(1)} km`);
          setBaseDurationSeconds(data.duration || 0);
        } catch (err: any) {
          console.error('Detailed error calculating distance:', err);
          setDistance('Error');
          setBaseDurationSeconds(0);
          toast({ title: 'Error Calculating Distance', description: err.details?.error_message || err.message || 'An unknown error occurred.', variant: 'destructive' });
        } finally {
          setIsCalculating(false);
        }
      }, 800);
    };
  }, [toast]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  useEffect(() => {
    if (user && routeId) {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          const userDoc = await firebaseDB.getUser(user.uid);
          if (userDoc?.orgId) {
            setUserData(userDoc);
            const [routeData, placesData, usersData] = await Promise.all([
              firebaseDB.getRoute(routeId),
              firebaseDB.getPlaces(userDoc.orgId),
              firebaseDB.getUsers(userDoc.orgId),
            ]);
            
            setRoute(routeData);
            setAllPlaces(placesData);
            setOrganizationUsers(usersData);
            setRouteNotes(routeData?.notes || '');
            
            const legacyBaseAddress = (routeData as any).baseAddress || '';
            setStartAddress(routeData?.startAddress || legacyBaseAddress);
            setEndAddress(routeData?.endAddress || legacyBaseAddress);
            
            setPrepTimeStart(routeData?.prepTimeStart || 0);
            setPrepTimeEnd(routeData?.prepTimeEnd || 0);
            setBreakTime(routeData?.breakTime || 0);
            setFuelServiceTime(routeData?.fuelServiceTime || 0);

            if (routeData?.completedStops) {
              const stopsMap: Record<string, boolean> = {};
              routeData.completedStops.forEach(id => { stopsMap[id] = true; });
              setCompletedStops(stopsMap);
            }

            let initialItems: RouteItem[] = [];
            if (routeData?.prepTimeStart > 0) initialItems.push({ id: 'special_start', type: 'start', duration: routeData.prepTimeStart });
            if (routeData?.places) {
              routeData.places.forEach(placeId => {
                const placeData = placesData.find(p => p.id === placeId);
                if (placeData) initialItems.push({ id: `place_${placeId}`, type: 'place', placeId: placeId, placeData });
              });
            }
            if (routeData?.breakTime > 0) initialItems.push({ id: 'special_break', type: 'break', duration: routeData.breakTime });
            if (routeData?.fuelServiceTime > 0) initialItems.push({ id: 'special_service', type: 'service', duration: routeData.fuelServiceTime });
            if (routeData?.prepTimeEnd > 0) initialItems.push({ id: 'special_end', type: 'end', duration: routeData.prepTimeEnd });

            setRouteItems(initialItems);
            debouncedCalculateDistance(initialItems, routeData?.startAddress || legacyBaseAddress, routeData?.endAddress || legacyBaseAddress);
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
    const totalPlacesDeliveryTimeMinutes = routeItems.filter(item => item.type === 'place' && item.placeData?.estimatedDeliveryTime).reduce((sum, item) => sum + (item.placeData!.estimatedDeliveryTime || 0), 0);
    const totalSeconds = baseDurationSeconds + ((prepTimeStart + prepTimeEnd + breakTime + fuelServiceTime + totalPlacesDeliveryTimeMinutes) * 60);
    
    if(totalSeconds === 0) {
       setDuration('N/A');
       return;
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    setDuration(hours > 0 ? `${hours}t ${minutes}m` : `${minutes}m`);
  }, [baseDurationSeconds, prepTimeStart, prepTimeEnd, breakTime, fuelServiceTime, routeItems]);

  const handleAddPlace = (placeId: string) => {
    const placeToAdd = allPlaces.find(p => p.id === placeId);
    if (placeToAdd && !routeItems.some(i => i.placeId === placeId)) {
      updateRouteItems([...routeItems, { id: `place_${placeId}`, type: 'place', placeId, placeData: placeToAdd }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    updateRouteItems(routeItems.filter(i => i.id !== itemId));
  };
  
  const handleTimeSettingChange = (type: 'start' | 'end' | 'break' | 'service', value: number) => {
    let newItems = routeItems.filter(i => i.type !== type);
    if (value > 0) {
      const newItem: RouteItem = { id: `special_${type}`, type, duration: value };
      if (type === 'start') newItems.unshift(newItem);
      else if (type === 'end') newItems.push(newItem);
      else {
        const endIndex = newItems.findIndex(i => i.type === 'end');
        endIndex >= 0 ? newItems.splice(endIndex, 0, newItem) : newItems.push(newItem);
      }
    }
    setRouteItems(newItems);
    debouncedCalculateDistance(newItems, startAddress, endAddress);
    
    if (type === 'start') setPrepTimeStart(value);
    if (type === 'end') setPrepTimeEnd(value);
    if (type === 'break') setBreakTime(value);
    if (type === 'service') setFuelServiceTime(value);
  };

  const toggleItemCompletion = async (itemId: string) => {
    const newCompletedStops = { ...completedStops, [itemId]: !completedStops[itemId] };
    setCompletedStops(newCompletedStops);
    try {
      const completedIds = Object.keys(newCompletedStops).filter(id => newCompletedStops[id]);
      await firebaseDB.updateRoute(routeId, { completedStops: completedIds });
    } catch (err) {
      setCompletedStops(completedStops); // Revert on failure
      toast({ title: 'Feil', description: 'Kunne ikke lagre status.', variant: 'destructive' });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = routeItems.findIndex(item => item.id === active.id);
      const newIndex = routeItems.findIndex(item => item.id === over.id);
      updateRouteItems(arrayMove(routeItems, oldIndex, newIndex));
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
      
      if (data.waypointOrder?.length > 0) {
        const optimizedPlaceItems = data.waypointOrder.map(index => placeItems[index]);
        if (startAddress && !endAddress && placeItems.length > data.waypointOrder.length) {
            optimizedPlaceItems.push(placeItems[placeItems.length - 1]);
        }
        
        let optimizedIndex = 0;
        const newItems = routeItems.map(item => item.type === 'place' ? optimizedPlaceItems[optimizedIndex++] : item);
        setRouteItems(newItems);
        toast({ title: 'Suksess', description: 'Ruten ble optimalisert!' });
      } else {
         toast({ title: 'Info', description: 'Ruten er allerede optimal.' });
      }
    } catch (err: any) {
      toast({ title: 'Feil', description: err.message || 'Kunne ikke optimalisere ruten.', variant: 'destructive' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = async () => {
    if (!route || isCalculating) return;
    setIsSaving(true);
    try {
      const updatedRoute: Partial<Route> = {
        name: route.name,
        shipmentNumber: route.shipmentNumber,
        driverId: route.driverId,
        places: routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!),
        completedStops: Object.keys(completedStops).filter(id => completedStops[id]),
        startAddress, endAddress, notes: routeNotes,
        prepTimeStart, prepTimeEnd, breakTime, fuelServiceTime,
        duration: duration === 'N/A' ? undefined : duration,
        distanceString: distance === 'N/A' || distance === 'Error' ? undefined : distance,
      };
      (updatedRoute as any).baseAddress = deleteField();
      
      await firebaseDB.updateRoute(routeId, updatedRoute);
      toast({ title: 'Suksess', description: 'Ruten er oppdatert.' });
    } catch (err) {
      toast({ title: 'Feil', description: 'Kunne ikke lagre ruten.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isDataLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user || error) { router.push('/login'); return null; }
  if (!route) return <div className="text-center py-12">Ruten ble ikke funnet.</div>;

  const isAdmin = userData?.role === 'admin';
  const placesCount = routeItems.filter(i => i.type === 'place').length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Link href="/dashboard/routes" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-2 text-sm font-medium">
        <ChevronLeft className="h-4 w-4" />Tilbake til Ruter
      </Link>

      <Card className="border-slate-200 shadow-md">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl"><RouteIcon className="h-8 w-8 text-primary" /></div>
                <Input className="text-3xl font-bold h-auto py-2 px-3" value={route.name} onChange={(e) => setRoute({...route, name: e.target.value})} placeholder="Navn på rute..." readOnly={!isAdmin} />
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm w-full">
                  <FileText className="h-4 w-4 text-slate-400 ml-2" />
                  <Input value={route.shipmentNumber || ''} onChange={(e) => setRoute({...route, shipmentNumber: e.target.value})} placeholder="Fraktnummer (valgfritt)" className="border-0 shadow-none focus-visible:ring-0 h-8" readOnly={!isAdmin} />
              </div>
          </div>
          
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm w-full">
                    <Home className="h-4 w-4 text-blue-400 ml-2" />
                    <Input value={startAddress} onChange={(e) => setStartAddress(e.target.value)} onBlur={(e) => debouncedCalculateDistance(routeItems, e.target.value, endAddress)} placeholder="Startadresse (valgfritt)" className="border-0 shadow-none focus-visible:ring-0 h-8" />
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm w-full">
                    <Flag className="h-4 w-4 text-indigo-400 ml-2" />
                    <Input value={endAddress} onChange={(e) => setEndAddress(e.target.value)} onBlur={(e) => debouncedCalculateDistance(routeItems, startAddress, e.target.value)} placeholder="Sluttadresse (valgfritt)" className="border-0 shadow-none focus-visible:ring-0 h-8" />
                </div>
            </div>
          )}
            
          <div className="flex flex-wrap items-center gap-6 text-sm bg-white p-4 rounded-lg border shadow-sm">
            {[
              { icon: MapPin, label: 'Stopp', value: placesCount },
              { icon: Car, label: 'Distanse', value: distance, loading: isCalculating },
              { icon: Clock, label: 'Est. Tid', value: duration, loading: isCalculating }
            ].map((item, index) => (
              <>
                {index > 0 && <Separator orientation="vertical" className="h-8 hidden sm:block" />}
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-semibold">{item.label}</span>
                    {item.loading ? <Loader2 className="h-5 w-5 animate-spin mt-1" /> : <span className={`block font-bold text-lg ${item.value === 'Error' ? 'text-destructive' : ''}`}>{item.value}</span>}
                  </div>
                </div>
              </>
            ))}
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><Clock className="h-5 w-5" />Tidsinnstillinger</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Klargjøring (start)', type: 'start', value: prepTimeStart },
                { label: 'Ferdigstilling (slutt)', type: 'end', value: prepTimeEnd },
                { label: 'Pause', type: 'break', value: breakTime },
                { label: 'Service', type: 'service', value: fuelServiceTime }
              ].map(setting => (
                <div key={setting.type} className="space-y-2">
                  <label className="text-sm font-medium">{setting.label}</label>
                  <Select value={String(setting.value)} onValueChange={(val) => handleTimeSettingChange(setting.type as any, Number(val))}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {[0, 5, 10, 15, 20, 25, 30, 45, 60, 90].map(min => <SelectItem key={min} value={String(min)}>{min} min</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader><CardTitle>Legg til Stopp</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={handleAddPlace}>
                <SelectTrigger><SelectValue placeholder="Søk og velg et sted..." /></SelectTrigger>
                <SelectContent>
                  {allPlaces.map(place => <SelectItem key={place.id} value={place.id} disabled={routeItems.some(i => i.placeId === place.id)}>{place.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Info />Viktig Ruteinformasjon</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={routeNotes} onChange={(e) => setRouteNotes(e.target.value)} placeholder="Skriv inn viktig informasjon for sjåføren her..." readOnly={!isAdmin} />
            </CardContent>
          </Card>
        </div>
        
        <Card className="lg:col-span-7">
          <CardHeader><CardTitle>Rekkefølge</CardTitle></CardHeader>
          <CardContent className="p-0">
            {routeItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground p-8"><MapPin className="h-12 w-12" /><p>Ingen stopp er lagt til.</p></div>
            ) : (
              <div className="p-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={routeItems.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-3">
                    {routeItems.map((item, index) => (
                      <SortableItem key={item.id} id={item.id}>
                        <div className={`flex-grow p-3 rounded-lg border shadow-sm w-full group ${completedStops[item.id] ? 'bg-green-50/50' : 'bg-white'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden" onClick={() => toggleItemCompletion(item.id)}>
                              <button className={completedStops[item.id] ? 'text-green-500' : 'text-slate-300'}><CheckCircle2 className="h-6 w-6" /></button>
                              <span className="flex items-center justify-center bg-slate-100 rounded-full h-7 w-7 text-xs font-bold">{index + 1}</span>
                              <span className={`font-semibold ${completedStops[item.id] ? 'line-through' : ''}`}>{item.placeData?.name || item.type}</span>
                            </div>
                            <div className="flex items-center">
                              {item.placeData?.estimatedDeliveryTime && <Badge variant="secondary" className="mr-2"><Clock className="h-3 w-3 mr-1" />{item.placeData.estimatedDeliveryTime} min</Badge>}
                              <Link href={`/dashboard/places/${item.placeId}`}><Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button></Link>
                              <Button variant="ghost" size="icon" className="sm:opacity-0 group-hover:opacity-100" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>
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
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
             <h3 className="font-semibold">Tildelt Sjåfør</h3>
            <Select value={route.driverId || "unassigned"} onValueChange={(val) => setRoute({...route, driverId: val === "unassigned" ? "" : val})}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="Velg sjåfør..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Ikke tildelt</SelectItem>
                {organizationUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card>
         <CardContent className="p-6 space-y-4">
            {placesCount > 2 && (
               <Button variant="outline" className="w-full h-12" onClick={handleOptimizeRoute} disabled={isOptimizing || isSaving || isCalculating}>
                 {isOptimizing ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}Optimer Rekkefølge
               </Button>
            )}
            <Button className="w-full h-12" onClick={handleSave} disabled={isSaving || isCalculating}>
              {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}{isCalculating ? 'Kalkulerer...' : 'Lagre Rute'}
            </Button>
         </CardContent>
      </Card>

    </div>
  );
}
