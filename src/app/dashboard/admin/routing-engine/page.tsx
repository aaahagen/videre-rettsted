'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Order, Vehicle, Place, DriverProfile, RouteSuggestion } from '@/lib/types';
import { ConstraintEngine, getDistanceFromLatLonInKm } from '@/lib/routing-engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Loader2, 
    Sparkles, 
    Truck, 
    User, 
    MapPin, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    Calendar, 
    ArrowRight, 
    Package, 
    Leaf, 
    Battery, 
    Trash2, 
    X,
    Building2,
    RefreshCw,
    Scale,
    Wrench,
    PlusCircle,
    Settings2,
    Info,
    LayoutGrid,
    Target
} from 'lucide-react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

/**
 * RoutingEnginePage er kontrollsenteret for automatisert ruteplanlegging.
 * 
 * Siden bruker ConstraintEngine for å:
 * - Validere kjøretøyets lastekapasitet (vekt/volum).
 * - Sjekke miljøkrav (ADR/Nullutslipp).
 * - Optimalisere stopprekkefølge basert på geolokasjon.
 */
export default function RoutingEnginePage() {
    const { dbUser } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    
    const [suggestions, setSuggestions] = useState<RouteSuggestion[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [strategy, setStrategy] = useState<'fill_first' | 'balanced'>('fill_first');

    // Internal Task Dialog State
    const [isInternalTaskOpen, setIsInternalTaskOpen] = useState(false);
    const [internalTaskData, setInternalTaskData] = useState({
        name: 'Verksted / Service',
        vehicleId: '',
        driverId: '',
        notes: ''
    });

    useEffect(() => {
        async function loadData() {
            if (!dbUser?.orgId) return;
            try {
                const [allOrders, allVehicles, allUsers, allPlaces] = await Promise.all([
                    firebaseDB.getOrders(dbUser.orgId),
                    firebaseDB.getVehicles(dbUser.orgId),
                    firebaseDB.getUsers(dbUser.orgId),
                    firebaseDB.getPlaces(dbUser.orgId)
                ]);

                setOrders(allOrders.filter(o => !o.routeId && o.status === 'pending'));
                setVehicles(allVehicles.filter(v => v.currentStatuses.includes('ready') || v.currentStatuses.includes('parked')));
                setDrivers(allUsers.filter(u => (u.role === 'driver' || u.role === 'contractor') && u.status !== 'paused') as DriverProfile[]);
                setPlaces(allPlaces);
            } catch (err) {
                console.error(err);
                toast({ title: "Feil ved lasting", description: "Kunne ikke hente data for ruteplanlegging.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [dbUser?.orgId]);

    const formatDuration = (minutes: number): string => {
        if (isNaN(minutes) || minutes === 0) return "--";
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        if (h === 0) return `${m} min`;
        if (m === 0) return `${h} t`;
        return `${h} t ${m} min`;
    };

    const handleGenerate = () => {
        if (orders.length === 0) {
            toast({ title: "Ingen ordre", description: "Det er ingen ledige ordre å planlegge ruter for." });
            return;
        }

        setCalculating(true);
        
        setTimeout(() => {
            try {
                const engine = new ConstraintEngine({ assignmentStrategy: strategy });
                const placesMap = new Map(places.map(p => [p.id, p]));
                const depotCoords = { lat: 59.9139, lng: 10.7522 }; // Oslo Default
                
                const dayOfWeek = format(new Date(selectedDate), 'eeee').toLowerCase();

                const results = engine.generateBasicSuggestion(
                    vehicles,
                    drivers,
                    orders,
                    placesMap,
                    depotCoords,
                    "08:00",
                    dayOfWeek
                );

                setSuggestions(results);
                toast({ 
                    title: strategy === 'balanced' ? "Jevn fordeling generert" : "Effektive ruter generert", 
                    description: `Planla ${results.reduce((sum, s) => sum + s.orders.length, 0)} ordre på ${results.length} ruter for ${format(new Date(selectedDate), 'PP')}.` 
                });
            } catch (err) {
                console.error(err);
                toast({ title: "Feil ved beregning", description: "Noe gikk galt under ruteoptimaliseringen.", variant: "destructive" });
            } finally {
                setCalculating(false);
            }
        }, 500);
    };

    const handleCreateInternalTask = async () => {
        if (!dbUser?.orgId || !internalTaskData.vehicleId || !internalTaskData.driverId) return;

        try {
            setCalculating(true);
            const driver = drivers.find(d => d.id === internalTaskData.driverId);
            await firebaseDB.createRoute({
                name: `INTERN: ${internalTaskData.name}`,
                orgId: dbUser.orgId,
                places: [],
                vehicleId: internalTaskData.vehicleId,
                driverId: internalTaskData.driverId,
                driverName: driver?.name,
                date: selectedDate,
                status: 'active',
                notes: internalTaskData.notes
            });

            toast({ title: "Oppgave opprettet", description: "Den interne oppgaven er lagret som en aktiv rute." });
            setIsInternalTaskOpen(false);
        } catch (err) {
            console.error(err);
            toast({ title: "Kunne ikke lagre", variant: "destructive" });
        } finally {
            setCalculating(false);
        }
    };

    const updateSuggestion = (idx: number, updates: Partial<RouteSuggestion>) => {
        setSuggestions(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...updates };
            return next;
        });
    };

    const recalculateSuggestionMetrics = (orders: Order[], places: Place[]): { duration: number, distance: number } => {
        const depotCoords = { lat: 59.9139, lng: 10.7522 };
        let distance = 0;
        let duration = 0;
        let currentCoords = depotCoords;
        const visitedPlaceIds = new Set<string>();

        // Heuristic: Process stops in the order they appear in the places list
        for (const place of places) {
            const dist = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lng, place.coordinates!.lat, place.coordinates!.lng);
            distance += dist;
            
            const travelTime = (dist / 40) * 60; // 40km/h average
            const stopTime = visitedPlaceIds.has(place.id) ? 2 : (place.estimatedDeliveryTime || 15);
            
            duration += travelTime + stopTime;
            visitedPlaceIds.add(place.id);
            currentCoords = place.coordinates!;
        }

        return { duration, distance };
    };

    const removeOrderFromSuggestion = (suggestionIdx: number, orderId: string) => {
        const suggestion = suggestions[suggestionIdx];
        const removedOrder = suggestion.orders.find(o => o.id === orderId);
        if (!removedOrder) return;

        const remainingOrders = suggestion.orders.filter(o => o.id !== orderId);
        const remainingPlaces = suggestion.places.filter(p => 
            remainingOrders.some(ro => ro.placeId === p.id)
        );

        setOrders(prev => [...prev, removedOrder]);

        if (remainingOrders.length === 0) {
            setSuggestions(prev => prev.filter((_, i) => i !== suggestionIdx));
        } else {
            const { duration, distance } = recalculateSuggestionMetrics(remainingOrders, remainingPlaces);
            updateSuggestion(suggestionIdx, {
                orders: remainingOrders,
                places: remainingPlaces,
                estimatedDuration: duration,
                estimatedDistance: distance
            });
        }
    };

    const handleRemoveSuggestion = (idx: number) => {
        const suggestion = suggestions[idx];
        setOrders(prev => [...prev, ...suggestion.orders]);
        setSuggestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleApplyRoute = async (suggestion: RouteSuggestion) => {
        if (!dbUser?.orgId) return;
        
        try {
            setCalculating(true);
            const routeName = `Auto: ${suggestion.places[0]?.name || 'Rute'} - ${new Date(selectedDate).toLocaleDateString('nb-NO')}`;
            
            const driver = drivers.find(d => d.id === suggestion.driverId);

            const newRoute = await firebaseDB.createRoute({
                name: routeName,
                orgId: dbUser.orgId,
                places: suggestion.places.map(p => p.id),
                vehicleId: suggestion.vehicleId,
                driverId: suggestion.driverId,
                driverName: driver?.name,
                date: selectedDate,
                status: 'active',
                duration: formatDuration(suggestion.estimatedDuration),
                distance: suggestion.estimatedDistance
            });

            await Promise.all(suggestion.orders.map(order => 
                firebaseDB.updateOrder(dbUser.orgId!, order.id, { routeId: newRoute.id })
            ));

            await firebaseDB.createManifest({
                orgId: dbUser.orgId,
                routeId: newRoute.id,
                vehicleId: suggestion.vehicleId,
                status: 'pending',
                orders: suggestion.orders.map(o => ({
                    orderId: o.id,
                    barcode: o.barcode,
                    status: 'pending',
                    totalItems: o.details.numberOfItems || 1,
                    loadedItems: 0
                }))
            });

            toast({ title: "Rute opprettet", description: "Ruten og manifestet er lagret i databasen." });
            setSuggestions(prev => prev.filter(s => s !== suggestion));

        } catch (err) {
            console.error(err);
            toast({ title: "Kunne ikke lagre", description: "Noe gikk galt under lagring av ruten.", variant: "destructive" });
        } finally {
            setCalculating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-10">
            {/* CLEAN HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 flex items-center gap-4">
                        <Sparkles className="h-10 w-10 text-amber-500 shrink-0" />
                        Ruteplanlegger
                    </h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">Optimaliser arbeidsflyten med intelligent ressursfordeling.</p>
                </div>
                
                <Button 
                    onClick={handleGenerate} 
                    disabled={calculating || orders.length === 0} 
                    size="lg" 
                    className="w-full md:w-auto h-14 px-8 text-lg font-black gap-3 shadow-xl bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    {calculating ? <Loader2 className="h-6 w-6 animate-spin" /> : <RefreshCw className="h-6 w-6" />}
                    {suggestions.length > 0 ? 'Beregn på nytt' : 'Generer ruter nå'}
                </Button>
            </div>

            {/* CONTROL TOOLBAR CARD */}
            <Card className="border-2 border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b px-6 py-3 flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Planleggingsparametre</span>
                </div>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Planleggingsdato</Label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                <input 
                                    type="date" 
                                    value={selectedDate} 
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 h-12 rounded-xl pl-10 pr-4 font-bold text-sm outline-none focus:border-indigo-200 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Optimaliseringsstrategi</Label>
                            <div className="flex p-1 bg-slate-100 rounded-xl h-12 border-2 border-slate-100">
                                <button 
                                    onClick={() => setStrategy('fill_first')}
                                    className={cn(
                                        "flex-1 rounded-lg text-[10px] font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all",
                                        strategy === 'fill_first' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Package className="h-3.5 w-3.5" /> Fyll opp
                                </button>
                                <button 
                                    onClick={() => setStrategy('balanced')}
                                    className={cn(
                                        "flex-1 rounded-lg text-[10px] font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all",
                                        strategy === 'balanced' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Scale className="h-3.5 w-3.5" /> Fordel jevnt
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Dialog open={isInternalTaskOpen} onOpenChange={setIsInternalTaskOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-indigo-100 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50">
                                        <Wrench className="h-4 w-4 mr-2" /> Opprett Intern Oppgave
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="font-headline text-2xl">Ny Intern Oppgave</DialogTitle>
                                        <DialogDescription>Lag en rute for støtteoppgaver som verksted eller flytting.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-5 py-4">
                                        <div className="space-y-2">
                                            <Label>Hva skal gjøres?</Label>
                                            <Input value={internalTaskData.name} onChange={e => setInternalTaskData({...internalTaskData, name: e.target.value})} className="h-11" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Kjøretøy</Label>
                                                <Select onValueChange={v => setInternalTaskData({...internalTaskData, vehicleId: v})}>
                                                    <SelectTrigger className="h-11"><SelectValue placeholder="Velg..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Sjåfør</Label>
                                                <Select onValueChange={v => setInternalTaskData({...internalTaskData, driverId: v})}>
                                                    <SelectTrigger className="h-11"><SelectValue placeholder="Velg..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ekstra info</Label>
                                            <Input placeholder="F.eks. Lokasjon eller tidspunkt" value={internalTaskData.notes} onChange={e => setInternalTaskData({...internalTaskData, notes: e.target.value})} className="h-11" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsInternalTaskOpen(false)} className="rounded-xl h-11">Avbryt</Button>
                                        <Button onClick={handleCreateInternalTask} disabled={!internalTaskData.driverId || !internalTaskData.vehicleId} className="rounded-xl h-11 bg-indigo-600 hover:bg-indigo-700">Opprett Oppgave</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* RESOURCE STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Package />} label="Ledige Ordre" value={orders.length} color="blue" />
                <StatCard icon={<Truck />} label="Klare Biler" value={vehicles.length} color="emerald" />
                <StatCard icon={<User />} label="Aktive Sjåfører" value={drivers.length} color="indigo" />
                <StatCard icon={<Sparkles />} label="Nye Forslag" value={suggestions.length} color="amber" />
            </div>

            <Separator className="my-8" />

            {/* SUGGESTIONS GRID */}
            {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {suggestions.map((s, idx) => {
                        const vehicle = vehicles.find(v => v.id === s.vehicleId);
                        const driver = drivers.find(d => d.id === s.driverId);
                        const isGreen = vehicle?.fuelType === 'electric' || vehicle?.fuelType === 'gas';
                        
                        return (
                            <Card key={idx} className="overflow-hidden border-2 border-slate-100 hover:border-indigo-200 transition-all shadow-lg shadow-slate-100/50 flex flex-col relative group rounded-2xl">
                                
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20 h-10 w-10 rounded-full hover:bg-red-50"
                                    onClick={() => handleRemoveSuggestion(idx)}
                                    title="Slett forslag"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>

                                <CardHeader className="bg-slate-50/50 border-b p-6 pb-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-xl bg-white border shadow-sm flex items-center justify-center">
                                            <Target className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="font-headline text-xl">Ruteutkast {idx + 1}</CardTitle>
                                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Automatisk forslag</CardDescription>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tildelt Kjøretøy</Label>
                                            <Select 
                                                value={s.vehicleId} 
                                                onValueChange={(val) => updateSuggestion(idx, { vehicleId: val })}
                                            >
                                                <SelectTrigger className="bg-white font-bold h-11 border-slate-200 rounded-xl shadow-sm">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <Truck className={cn("h-4 w-4 shrink-0", isGreen ? "text-green-600" : "text-slate-500")} />
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicles.map(v => (
                                                        <SelectItem key={v.id} value={v.id}>{v.name} ({v.registrationNumber})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tildelt Sjåfør</Label>
                                            <Select 
                                                value={s.driverId || 'none'} 
                                                onValueChange={(val) => updateSuggestion(idx, { driverId: val === 'none' ? undefined : val })}
                                            >
                                                <SelectTrigger className="bg-white font-bold h-11 border-slate-200 rounded-xl shadow-sm">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <User className="h-4 w-4 shrink-0 text-slate-500" />
                                                        <SelectValue placeholder="Velg sjåfør" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Ingen sjåfør</SelectItem>
                                                    {drivers.map(d => (
                                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-6 flex-1 space-y-8 bg-white">
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <MetricBox icon={<MapPin className="h-3.5 w-3.5" />} label="Distanse" value={`${s.estimatedDistance.toFixed(1)} km`} />
                                        <MetricBox icon={<Clock className="h-3.5 w-3.5" />} label="Varighet" value={formatDuration(s.estimatedDuration)} />
                                        <MetricBox icon={<Package className="h-3.5 w-3.5" />} label="Ordre" value={`${s.orders.length} stk`} />
                                    </div>

                                    {/* Warnings */}
                                    {s.warnings.length > 0 && (
                                        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Systemmerknader</span>
                                            </div>
                                            <div className="space-y-1.5 pl-1">
                                                {s.warnings.map((w, wIdx) => (
                                                    <div key={wIdx} className="text-[10px] flex gap-2 font-bold text-amber-800 leading-tight">
                                                        <div className="h-1 w-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                                        {w}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="space-y-4">
                                         <div className="flex items-center justify-between">
                                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                 <LayoutGrid className="h-3 w-3" /> Stopp-sekvens
                                             </h4>
                                             <Badge variant="outline" className="text-[9px] font-bold border-slate-100 text-slate-400">{s.places.length} stopp</Badge>
                                         </div>
                                         <div className="space-y-3 relative pl-3 border-l-2 border-slate-50 ml-1">
                                             {s.places.map((p, pIdx) => {
                                                 const placeOrders = s.orders.filter(o => o.placeId === p.id);
                                                 return (
                                                     <div key={pIdx} className="relative group/stop">
                                                         {/* Sequence Marker */}
                                                         <div className="absolute -left-[1.25rem] top-2 w-4 h-4 rounded-full bg-white border-2 border-slate-200 group-hover/stop:border-indigo-600 transition-colors z-10 flex items-center justify-center">
                                                            <div className="w-1 h-1 rounded-full bg-slate-300 group-hover/stop:bg-indigo-600 transition-colors" />
                                                         </div>

                                                         <div className="bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 p-3 rounded-xl transition-all">
                                                             <div className="flex items-start justify-between gap-3">
                                                                 <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                                                                        {p.isZeroEmissionZone && <Leaf className="h-3 w-3 text-green-600" />}
                                                                        {p.isCityCenter && <Building2 className="h-3 w-3 text-blue-600" />}
                                                                    </div>
                                                                    <p className="text-[9px] text-slate-400 truncate mb-2">{p.address}</p>
                                                                 </div>
                                                                 <span className="text-[10px] font-black text-slate-300">#{pIdx + 1}</span>
                                                             </div>
                                                             
                                                             <div className="flex flex-wrap gap-1.5">
                                                                {placeOrders.map(o => (
                                                                    <Badge key={o.id} variant="secondary" className="h-6 text-[9px] font-bold bg-white border border-slate-100 shadow-sm pr-1 text-slate-600">
                                                                        {o.barcode}
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="h-4 w-4 ml-1 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                                            onClick={() => removeOrderFromSuggestion(idx, o.id)}
                                                                        >
                                                                            <X className="h-2 w-2" />
                                                                        </Button>
                                                                    </Badge>
                                                                ))}
                                                             </div>
                                                         </div>
                                                     </div>
                                                 );
                                             })}
                                         </div>
                                    </div>

                                    <Button 
                                        onClick={() => handleApplyRoute(s)} 
                                        className="w-full h-14 text-lg font-black gap-3 shadow-xl bg-slate-900 hover:bg-indigo-600 transition-all rounded-xl"
                                        variant="default"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Lagre og aktiver rute
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6 border-4 border-dashed rounded-[2.5rem] bg-slate-50/50 border-slate-100 p-8">
                    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-bounce-slow">
                        <Sparkles className="h-16 w-16 text-indigo-200" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Klar for ruteoptimalisering?</h3>
                        <p className="text-slate-500 max-w-sm font-medium">Klikk på knappen ovenfor for å beregne ruter basert på dagens {orders.length} ledige ordre og {vehicles.length} tilgjengelige kjøretøy.</p>
                    </div>
                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex items-center gap-2 opacity-50"><Package className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Intelligent lastekapasitet</span></div>
                        <div className="flex items-center gap-2 opacity-50"><Target className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Geografisk optimalisering</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100"
    };

    return (
        <Card className={cn("border-2 shadow-none overflow-hidden rounded-2xl", colors[color])}>
            <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
                    <p className="text-3xl font-black leading-none">{value}</p>
                </div>
                <div className="p-3 bg-white/40 backdrop-blur-sm rounded-xl">
                    {icon && <icon.type {...icon.props} className="h-6 w-6" />}
                </div>
            </CardContent>
        </Card>
    );
}

function MetricBox({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors group">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">
                {icon} {label}
            </div>
            <p className="text-sm font-black text-slate-800">{value}</p>
        </div>
    );
}