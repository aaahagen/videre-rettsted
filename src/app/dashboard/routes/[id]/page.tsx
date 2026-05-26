'use client';

import { useEffect, useState, use } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { 
    Loader2, 
    GripVertical, 
    Wand2, 
    Route as RouteIcon, 
    MapPin, 
    ChevronLeft, 
    Truck, 
    Home, 
    Info, 
    FileText, 
    Edit2, 
    X,
    ClipboardList,
    Navigation,
    Scan,
    Car,
    User as UserIcon,
    Printer,
    PlusCircle,
    Package,
    Trash2,
    Search,
    MapPinned
} from 'lucide-react';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    DragEndEvent,
    TouchSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { firebaseDB } from '@/lib/firebase/database';
import { auth, db } from '@/lib/firebase/firebase';
import { Route, DeliveryPlace, Vehicle, Order, Manifest, User, Place } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger, 
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useAuth } from '@/components/auth-provider';
import { collection, query, where, onSnapshot, doc, getDocs, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BulkBarcodeGenerator } from '@/components/orders/bulk-barcode-generator';
import { Separator } from '@/components/ui/separator';

interface SortableItemProps {
    id: string;
    place: DeliveryPlace;
    index: number;
    isOptimizing: boolean;
    onViewPlace: (place: DeliveryPlace) => void;
    onRemovePlace: (placeId: string) => void;
    isCompleted?: boolean;
    orderCount?: number;
}

function SortablePlaceItem({ id, place, index, isOptimizing, onViewPlace, onRemovePlace, isCompleted, orderCount }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm group transition-all",
                isDragging && "shadow-xl border-primary ring-2 ring-primary/20",
                isCompleted && "bg-slate-50 border-slate-100 opacity-80"
            )}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded text-slate-400">
                <GripVertical className="h-4 w-4" />
            </div>
            
            <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full font-bold text-xs shrink-0",
                isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-slate-900 text-white"
            )}>
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </div>

            <div className="flex-1 min-w-0" onClick={() => onViewPlace(place)}>
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm truncate">{place.name}</h4>
                    {orderCount && orderCount > 0 ? (
                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-100">
                           {orderCount} {orderCount === 1 ? 'ordre' : 'ordrer'}
                        </Badge>
                    ) : null}
                </div>
                <p className="text-[10px] text-slate-500 truncate">{place.address}</p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-primary rounded-full"
                    onClick={() => onViewPlace(place)}
                >
                    <Info className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-full"
                    onClick={() => onRemovePlace(place.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

const CheckCircle2 = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function RouteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: routeId } = use(params);
  const [authUser, loadingAuth] = useAuthState(auth);
  const { dbUser } = useAuth();
  const [route, setRoute] = useState<Route | null>(null);
  const [places, setPlaces] = useState<DeliveryPlace[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<DeliveryPlace[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<DeliveryPlace | null>(null);
  
  const [manifest, setManifest] = useState<Manifest | null>(null);

  // Management Dialogs
  const [isManageOrdersOpen, setIsManageOrdersOpen] = useState(false);
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [stopSearch, setStopSearch] = useState("");

  const router = useRouter();
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    }
  }, [authUser, loadingAuth, router]);

  useEffect(() => {
    if (!authUser || !routeId || !dbUser?.orgId) return;

    const routeUnsub = onSnapshot(doc(db, 'routes', routeId), (doc) => {
        if (doc.exists()) {
            setRoute({ ...doc.data(), id: doc.id } as Route);
        } else {
            router.push('/dashboard/routes');
        }
    });

    const manifestQuery = query(
        collection(db, 'organizations', dbUser.orgId, 'manifests'), 
        where('routeId', '==', routeId)
    );
    const manifestUnsub = onSnapshot(manifestQuery, (snapshot) => {
        if (!snapshot.empty) {
            setManifest({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Manifest);
        } else {
            setManifest(null);
        }
    });

    return () => {
        routeUnsub();
        manifestUnsub();
    };
  }, [authUser, routeId, dbUser?.orgId]);

  useEffect(() => {
    async function fetchData() {
      if (dbUser?.orgId) {
        try {
          const [allPlaces, allVehicles, allOrders, allUsers] = await Promise.all([
            firebaseDB.getPlaces(dbUser.orgId),
            firebaseDB.getVehicles(dbUser.orgId),
            firebaseDB.getOrders(dbUser.orgId),
            firebaseDB.getUsers(dbUser.orgId)
          ]);
          
          setAvailablePlaces(allPlaces as DeliveryPlace[]);
          setVehicles(allVehicles as Vehicle[]);
          setOrders(allOrders as Order[]);
          setDrivers(allUsers.filter(u => u.role === 'driver' || u.role === 'contractor'));
        } catch (error) {
          console.error('Error fetching details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (dbUser?.orgId) {
      fetchData();
    }
  }, [dbUser?.orgId]);

  useEffect(() => {
      if (route && availablePlaces.length > 0) {
          const routePlaces = route.places
              .map(placeId => availablePlaces.find(p => p.id === placeId))
              .filter((p): p is DeliveryPlace => !!p);
          setPlaces(routePlaces);
      }
  }, [route, availablePlaces]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && route) {
        const oldIndex = places.findIndex(p => p.id === active.id);
        const newIndex = places.findIndex(p => p.id === over.id);
        const newPlacesOrder = arrayMove(places, oldIndex, newIndex);
        setPlaces(newPlacesOrder);
        const newPlaceIds = newPlacesOrder.map(p => p.id);
        try {
            await firebaseDB.updateRoute(routeId, { places: newPlaceIds });
        } catch (error) {
            toast({ title: 'Feil', description: 'Kunne ikke oppdatere rekkefølgen.', variant: 'destructive' });
        }
    }
  };

  const handleUpdateRoute = async (data: Partial<Route>) => {
    try {
        await firebaseDB.updateRoute(routeId, data);
        setIsEditing(false);
        toast({ title: 'Oppdatert', description: 'Ruten ble lagret.' });
    } catch (error) {
        toast({ title: 'Feil', description: 'Kunne ikke lagre endringer.', variant: 'destructive' });
    }
  };

  const handleDeleteRoute = async () => {
    if (!dbUser?.orgId) return;
    if (!confirm('Er du sikker på at du vil slette denne ruten?')) return;
    try {
        await firebaseDB.deleteRoute(dbUser.orgId, routeId);
        router.push('/dashboard/routes');
    } catch (error) {
        toast({ title: 'Feil', description: 'Kunne ikke slette ruten.', variant: 'destructive' });
    }
  };

  const handleAddStop = async (placeId: string) => {
      if (!route) return;
      if (route.places.includes(placeId)) {
          toast({ title: "Stoppet er allerede lagt til" });
          return;
      }
      try {
          const updatedPlaces = [...route.places, placeId];
          await firebaseDB.updateRoute(routeId, { places: updatedPlaces });
          toast({ title: "Stopp lagt til" });
      } catch (err) {
          toast({ title: "Feil", description: "Kunne ikke legge til stopp.", variant: "destructive" });
      }
  };

  const handleRemoveStop = async (placeId: string) => {
      if (!route) return;
      const stopOrders = orders.filter(o => o.routeId === routeId && o.placeId === placeId);
      if (stopOrders.length > 0) {
          if (!confirm(`Det er ${stopOrders.length} ordrer knyttet til dette stoppet. Vil du fjerne stoppet og tildele ordrene til 'Ingen rute'?`)) return;
          
          try {
              // Unassign orders
              await Promise.all(stopOrders.map(o => firebaseDB.updateOrder(dbUser!.orgId!, o.id, { routeId: undefined })));
          } catch (err) {
              console.error(err);
          }
      }

      try {
          const updatedPlaces = route.places.filter(p => p !== placeId);
          await firebaseDB.updateRoute(routeId, { places: updatedPlaces });
          toast({ title: "Stopp fjernet" });
      } catch (err) {
          toast({ title: "Feil", description: "Kunne ikke fjerne stopp.", variant: "destructive" });
      }
  };

  const handleToggleOrder = async (order: Order) => {
    if (!dbUser?.orgId || !route) return;
    const isAssigned = order.routeId === routeId;

    try {
        if (isAssigned) {
            // Remove order from route
            await firebaseDB.updateOrder(dbUser.orgId, order.id, { routeId: undefined });
            toast({ title: "Ordre fjernet fra rute" });
        } else {
            // Add order to route
            await firebaseDB.updateOrder(dbUser.orgId, order.id, { routeId: routeId });
            
            // Ensure the place is in the route's stops
            if (!route.places.includes(order.placeId)) {
                await firebaseDB.updateRoute(routeId, { places: [...route.places, order.placeId] });
            }

            // Sync Manifest if it exists
            if (manifest) {
                const manifestOrder = {
                    orderId: order.id,
                    barcode: order.barcode,
                    status: 'pending' as const,
                    totalItems: order.details.numberOfItems || 1,
                    loadedItems: 0
                };
                await firebaseDB.updateManifest(dbUser.orgId, manifest.id, {
                    orders: [...manifest.orders, manifestOrder]
                });
            } else {
                // Create manifest if missing
                await firebaseDB.createManifest({
                    orgId: dbUser.orgId,
                    routeId: routeId,
                    vehicleId: route.vehicleId || '',
                    status: 'pending',
                    orders: [{
                        orderId: order.id,
                        barcode: order.barcode,
                        status: 'pending',
                        totalItems: order.details.numberOfItems || 1,
                        loadedItems: 0
                    }]
                });
            }
            toast({ title: "Ordre lagt til på rute" });
        }
    } catch (err) {
        console.error(err);
        toast({ title: "Feil", description: "Kunne ikke oppdatere ordre.", variant: "destructive" });
    }
  };

  const handleOptimize = async () => {
      if (!route) return;
      setIsOptimizing(true);
      try {
          const optimizeRoute = httpsCallable(getFunctions(), 'optimizeRoute');
          await optimizeRoute({ routeId: route.id });
          toast({ title: 'Suksess', description: 'Ruten er optimert med AI.' });
      } catch (error) {
          console.error(error);
          toast({ title: 'Optimering feilet', description: 'Kunne ikke optimere ruten akkurat nå.', variant: 'destructive' });
      } finally {
          setIsOptimizing(false);
      }
  };

  const vehicle = route ? vehicles.find(v => v.id === route.vehicleId) : null;
  const assignedDriver = route?.driverId ? drivers.find(d => d.id === route.driverId) : null;
  const displayDriverName = route?.driverName || assignedDriver?.name || 'Ikke tildelt';

  if (isLoading || !route) return (
      <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
  );

  const getStopOrdersCount = (placeId: string) => {
      return orders.filter(o => o.routeId === routeId && o.placeId === placeId).length;
  };

  const routeOrders = orders.filter(o => o.routeId === routeId);
  const availableOrders = orders.filter(o => !o.routeId || o.routeId === '');
  const totalPallets = routeOrders.reduce((sum, o) => sum + (o.handlingUnits?.length || 0), 0);

  const placesMap: Record<string, Place> = {};
  availablePlaces.forEach(p => { placesMap[p.id] = p; });

  const filteredAvailableOrders = availableOrders.filter(o => 
    o.barcode.toLowerCase().includes(orderSearch.toLowerCase()) || 
    placesMap[o.placeId]?.name.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredAvailablePlaces = availablePlaces.filter(p => 
    !route.places.includes(p.id) && 
    (p.name.toLowerCase().includes(stopSearch.toLowerCase()) || p.address.toLowerCase().includes(stopSearch.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link href="/dashboard/routes"><ChevronLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider">
                        {route.status === 'completed' ? 'Fullført' : route.status === 'active' ? 'Aktiv' : 'Planlagt'}
                    </Badge>
                    {route.createdAt && (
                        <span className="text-slate-400 text-xs font-medium">Opprettet {format(route.createdAt instanceof Date ? route.createdAt : (route.createdAt as any).toDate(), 'dd. MMM', { locale: nb })}</span>
                    )}
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{route.name}</h1>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="outline" size="lg" onClick={() => setIsEditing(true)} className="h-12 font-bold px-6">
                <Edit2 className="mr-2 h-4 w-4" /> Rediger
            </Button>
            <Button size="lg" onClick={handleOptimize} disabled={isOptimizing} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-200">
                {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Optimer igjen
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
            {/* STATS CARD */}
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <RouteIcon className="h-5 w-5 text-indigo-400" /> Ruteoversikt
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sjåfør</span>
                            <div className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-indigo-500" /><span className="font-bold text-slate-700 truncate">{displayDriverName}</span></div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Kjøretøy</span>
                            <div className="flex items-center gap-2">{vehicle?.type === 'truck' ? <Truck className="h-4 w-4 text-indigo-500" /> : <Car className="h-4 w-4 text-indigo-500" />}<span className="font-bold text-slate-700 truncate">{vehicle?.name || 'Uten bil'}</span></div>
                        </div>
                    </div>
                    <div className="pt-6 border-t grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Stopp</span><span className="text-xl font-black text-slate-900">{places.length}</span></div>
                        <div className="text-center p-2 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Ordrer</span><span className="text-xl font-black text-slate-900">{routeOrders.length}</span></div>
                        <div className="text-center p-2 bg-slate-50 rounded-xl"><span className="block text-[10px] font-bold text-slate-400 uppercase">Paller</span><span className="text-xl font-black text-slate-900">{totalPallets}</span></div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 p-4 border-t flex flex-col gap-2">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11" onClick={() => setIsManageOrdersOpen(true)}>
                        <Package className="mr-2 h-4 w-4" /> Administrer Ordrer
                    </Button>
                    <BulkBarcodeGenerator orders={routeOrders} places={placesMap} buttonLabel="Skriv ut alle etiketter" variant="outline" className="w-full font-bold h-11" />
                </CardFooter>
            </Card>

            {/* STOPS LIST */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Rekkefølge & Stopp</h3>
                    <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50" onClick={() => setIsAddStopOpen(true)}>
                        <PlusCircle className="h-3 w-3 mr-1" /> Legg til stopp
                    </Button>
                </div>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={places.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {places.map((place, index) => (
                                <SortablePlaceItem 
                                    key={place.id} 
                                    id={place.id} 
                                    place={place} 
                                    index={index}
                                    isOptimizing={isOptimizing}
                                    onViewPlace={setSelectedPlace}
                                    onRemovePlace={handleRemoveStop}
                                    orderCount={getStopOrdersCount(place.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {places.length === 0 && (
                    <div className="text-center py-12 bg-white border-2 border-dashed rounded-3xl">
                        <RouteIcon className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Ingen stopp lagt til ennå.</p>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
            {selectedPlace ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border overflow-hidden">
                        <div className="relative aspect-video bg-slate-900">
                            <Image src={selectedPlace.imageUrl || '/icon.png'} alt={selectedPlace.name} fill className="object-cover opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6"><h2 className="text-3xl font-black text-white tracking-tight mb-1">{selectedPlace.name}</h2><p className="text-slate-300 font-medium flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedPlace.address}</p></div>
                            <Button variant="secondary" size="sm" className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-md rounded-full px-4 font-bold" onClick={() => setSelectedPlace(null)}><X className="h-4 w-4 mr-2" /> Lukk visning</Button>
                        </div>
                        
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2"><FileText className="h-3 w-3" /> Instruksjoner</h3>
                                        <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{selectedPlace.description || "Ingen spesifikasjoner."}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordrer på dette stoppet</h3>
                                        <div className="space-y-2">
                                            {routeOrders.filter(o => o.placeId === selectedPlace.id).map(o => (
                                                <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                                                    <div className="flex items-center gap-3"><Package className="h-4 w-4 text-slate-400" /><span className="font-bold text-sm">{o.barcode}</span></div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleToggleOrder(o)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stoppdetaljer</h3>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-200"><span className="text-sm font-bold text-slate-500">Estimert tidsbruk</span><Badge className="bg-white border-slate-200 text-slate-900 font-black">{selectedPlace.estimatedDeliveryTime || 0} min</Badge></div>
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl mt-4" asChild><a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.coordinates?.lat},${selectedPlace.coordinates?.lng}`} target="_blank" rel="noopener noreferrer"><Navigation className="mr-2 h-4 w-4" /> Start Navigasjon</a></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[600px] bg-slate-50/50 border-2 border-dashed rounded-[3rem] p-12 text-center">
                    <div className="p-8 bg-white rounded-full shadow-lg mb-8 animate-bounce-slow"><MapPinned className="h-16 w-16 text-indigo-200" /></div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Planleggingsvisning</h3>
                    <p className="text-slate-400 max-w-sm font-medium mb-8">Tildel ordrer fra organisasjonen eller legg til stopp manuelt for å bygge ruten din.</p>
                    <div className="flex gap-4"><Button variant="outline" className="font-bold h-12 px-6 rounded-xl" onClick={() => setIsAddStopOpen(true)}><MapPin className="mr-2 h-4 w-4" /> Legg til stopp</Button><Button className="bg-slate-900 hover:bg-indigo-600 font-bold h-12 px-6 rounded-xl" onClick={() => setIsManageOrdersOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Tildel Ordrer</Button></div>
                </div>
            )}
        </div>
      </div>

      {/* MANAGE ORDERS DIALOG */}
      <Dialog open={isManageOrdersOpen} onOpenChange={setIsManageOrdersOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-[2rem]">
              <DialogHeader className="p-8 pb-4">
                  <DialogTitle className="text-2xl font-black">Tildel Ordrer</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">Velg ordrer som skal inkluderes i ruten '{route.name}'.</DialogDescription>
              </DialogHeader>
              
              <div className="px-8 pb-4">
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Søk i ordrer eller steder..." className="pl-10 h-12 bg-slate-50 border-none rounded-xl" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} /></div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-2 space-y-3 min-h-[300px]">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-4">Tilgjengelige Ordrer ({filteredAvailableOrders.length})</h4>
                  {filteredAvailableOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-4 bg-white border rounded-2xl hover:border-indigo-200 transition-colors group">
                          <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors"><Package className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" /></div>
                              <div><p className="font-bold text-sm text-slate-900">{o.barcode}</p><p className="text-[10px] text-slate-500 font-medium">{placesMap[o.placeId]?.name || 'Ukjent sted'}</p></div>
                          </div>
                          <Button size="sm" className="bg-slate-900 hover:bg-indigo-600 font-bold rounded-lg h-9" onClick={() => handleToggleOrder(o)}>Legg til</Button>
                      </div>
                  ))}
                  {filteredAvailableOrders.length === 0 && <div className="text-center py-10 text-slate-400 italic">Ingen ledige ordrer funnet.</div>}
                  
                  {routeOrders.length > 0 && (
                      <>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-8">Allerede på ruten ({routeOrders.length})</h4>
                        {routeOrders.map(o => (
                            <div key={o.id} className="flex items-center justify-between p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center"><Package className="h-5 w-5 text-indigo-600" /></div>
                                    <div><p className="font-bold text-sm text-indigo-900">{o.barcode}</p><p className="text-[10px] text-indigo-500 font-medium">{placesMap[o.placeId]?.name}</p></div>
                                </div>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 font-bold" onClick={() => handleToggleOrder(o)}>Fjern</Button>
                            </div>
                        ))}
                      </>
                  )}
              </div>
              <DialogFooter className="p-8 bg-slate-50 border-t"><Button onClick={() => setIsManageOrdersOpen(false)} className="w-full h-12 rounded-xl font-black text-lg">Ferdig</Button></DialogFooter>
          </DialogContent>
      </Dialog>

      {/* ADD STOP DIALOG */}
      <Dialog open={isAddStopOpen} onOpenChange={setIsAddStopOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2rem]">
              <DialogHeader className="p-8 pb-4">
                  <DialogTitle className="text-2xl font-black">Legg til stopp</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">Velg et sted fra registeret for å legge til som et stopp uten ordre.</DialogDescription>
              </DialogHeader>
              <div className="px-8 pb-4">
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Søk i steder..." className="pl-10 h-12 bg-slate-50 border-none rounded-xl" value={stopSearch} onChange={e => setStopSearch(e.target.value)} /></div>
              </div>
              <div className="px-8 py-2 max-h-[400px] overflow-y-auto space-y-2 mb-4">
                  {filteredAvailablePlaces.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer" onClick={() => handleAddStop(p.id)}>
                          <div className="min-w-0"><p className="font-bold text-sm text-slate-900 truncate">{p.name}</p><p className="text-[10px] text-slate-500 truncate">{p.address}</p></div>
                          <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 h-8 w-8 rounded-full"><PlusCircle className="h-5 w-5" /></Button>
                      </div>
                  ))}
                  {filteredAvailablePlaces.length === 0 && <div className="text-center py-10 text-slate-400 italic">Ingen steder funnet.</div>}
              </div>
              <DialogFooter className="p-8 bg-slate-50 border-t"><Button variant="outline" onClick={() => setIsAddStopOpen(false)} className="w-full h-12 rounded-xl font-bold">Lukk</Button></DialogFooter>
          </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
              <DialogHeader><DialogTitle>Rediger Rute</DialogTitle><DialogDescription>Oppdater grunnleggende informasjon om ruten.</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label htmlFor="name">Rutenavn</Label><Input id="name" value={route.name} onChange={(e) => setRoute({ ...route, name: e.target.value })} /></div>
                  <div className="space-y-2">
                      <Label>Kjøretøy</Label>
                      <Select value={route.vehicleId || 'none'} onValueChange={(val) => setRoute({ ...route, vehicleId: val === 'none' ? undefined : val })}>
                          <SelectTrigger><SelectValue placeholder="Velg kjøretøy" /></SelectTrigger>
                          <SelectContent><SelectItem value="none">Uten kjøretøy</SelectItem>{vehicles.map(v => (<SelectItem key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</SelectItem>))}</SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Sjåfør</Label>
                      <Select value={route.driverId || 'none'} onValueChange={(val) => { const selectedDriver = drivers.find(d => d.id === val); setRoute({ ...route, driverId: val === 'none' ? undefined : val, driverName: val === 'none' ? undefined : selectedDriver?.name }); }}>
                          <SelectTrigger><div className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-slate-400" /><SelectValue placeholder="Velg sjåfør" /></div></SelectTrigger>
                          <SelectContent><SelectItem value="none">Ikke tildelt</SelectItem>{drivers.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}</SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter className="flex gap-2"><Button variant="destructive" onClick={handleDeleteRoute} className="mr-auto">Slett Rute</Button><Button variant="outline" onClick={() => setIsEditing(false)}>Avbryt</Button><Button onClick={() => handleUpdateRoute(route)}>Lagre Endringer</Button></DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
