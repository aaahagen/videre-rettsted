'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Order, Vehicle, Place, DriverProfile, RouteSuggestion } from '@/lib/types';
import { ConstraintEngine } from '@/lib/routing-engine';
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
    PlusCircle
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
                
                const results = engine.generateBasicSuggestion(
                    vehicles,
                    drivers,
                    orders,
                    placesMap,
                    depotCoords,
                    "08:00",
                    'monday' 
                );

                setSuggestions(results);
                toast({ 
                    title: strategy === 'balanced' ? "Jevn fordeling generert" : "Effektive ruter generert", 
                    description: `Planla ${results.reduce((sum, s) => sum + s.orders.length, 0)} ordre på ${results.length} ruter.` 
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
            await firebaseDB.createRoute({
                name: `INTERN: ${internalTaskData.name}`,
                orgId: dbUser.orgId,
                places: [],
                vehicleId: internalTaskData.vehicleId,
                driverId: internalTaskData.driverId,
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
            updateSuggestion(suggestionIdx, {
                orders: remainingOrders,
                places: remainingPlaces,
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
            const routeName = `Auto: ${suggestion.places[0]?.name || 'Rute'} - ${new Date().toLocaleDateString('nb-NO')}`;
            
            const newRoute = await firebaseDB.createRoute({
                name: routeName,
                orgId: dbUser.orgId,
                places: suggestion.places.map(p => p.id),
                vehicleId: suggestion.vehicleId,
                driverId: suggestion.driverId,
                date: selectedDate,
                status: 'active'
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
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-amber-500" />
                        Smart Ruteplanlegger
                    </h1>
                    <p className="text-slate-500 font-medium">Planlegg logistikk og fordel arbeidsmengden effektivt.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Strategy Switcher */}
                    <div className="bg-white border rounded-lg p-1 flex items-center gap-1 shadow-sm">
                        <Button 
                            variant={strategy === 'fill_first' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="h-8 text-[10px] font-black uppercase"
                            onClick={() => setStrategy('fill_first')}
                        >
                            <Package className="h-3 w-3 mr-1" /> Fyll opp
                        </Button>
                        <Button 
                            variant={strategy === 'balanced' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="h-8 text-[10px] font-black uppercase"
                            onClick={() => setStrategy('balanced')}
                        >
                            <Scale className="h-3 w-3 mr-1" /> Fordel jevnt
                        </Button>
                    </div>

                    <div className="bg-white border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent font-bold text-xs outline-none"
                        />
                    </div>

                    <Dialog open={isInternalTaskOpen} onOpenChange={setIsInternalTaskOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="font-bold border-indigo-200 text-indigo-700">
                                <Wrench className="h-4 w-4 mr-2" /> Intern Oppgave
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ny Intern Oppgave</DialogTitle>
                                <DialogDescription>Lag en rute for støtteoppgaver som verksted, henting eller flytting av utstyr.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Type Oppgave</Label>
                                    <Input value={internalTaskData.name} onChange={e => setInternalTaskData({...internalTaskData, name: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Kjøretøy</Label>
                                        <Select onValueChange={v => setInternalTaskData({...internalTaskData, vehicleId: v})}>
                                            <SelectTrigger><SelectValue placeholder="Velg..." /></SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sjåfør</Label>
                                        <Select onValueChange={v => setInternalTaskData({...internalTaskData, driverId: v})}>
                                            <SelectTrigger><SelectValue placeholder="Velg..." /></SelectTrigger>
                                            <SelectContent>
                                                {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notater / Instruksjoner</Label>
                                    <Input placeholder="F.eks. Levere bil hos Volvo Furuset kl 09:00" value={internalTaskData.notes} onChange={e => setInternalTaskData({...internalTaskData, notes: e.target.value})} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsInternalTaskOpen(false)}>Avbryt</Button>
                                <Button onClick={handleCreateInternalTask} disabled={!internalTaskData.driverId || !internalTaskData.vehicleId}>Opprett Oppgave</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleGenerate} disabled={calculating || orders.length === 0} size="lg" className="shadow-lg font-bold gap-2">
                        {calculating ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle className="h-5 w-5" />}
                        {suggestions.length > 0 ? 'Beregn på nytt' : 'Generer Forslag'}
                    </Button>
                </div>
            </div>

            {/* STATS BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-50 border-none shadow-none">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Package className="h-6 w-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Ledige Ordre</p>
                            <p className="text-2xl font-black">{orders.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-none shadow-none">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Truck className="h-6 w-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Klare Biler</p>
                            <p className="text-2xl font-black">{vehicles.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-none shadow-none">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><User className="h-6 w-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Sjåfører</p>
                            <p className="text-2xl font-black">{drivers.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-none shadow-none">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Sparkles className="h-6 w-6" /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Forslag</p>
                            <p className="text-2xl font-black">{suggestions.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* SUGGESTIONS GRID */}
            {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {suggestions.map((s, idx) => {
                        const vehicle = vehicles.find(v => v.id === s.vehicleId);
                        const driver = drivers.find(d => d.id === s.driverId);
                        const isGreen = vehicle?.fuelType === 'electric' || vehicle?.fuelType === 'gas';
                        
                        return (
                            <Card key={idx} className="overflow-hidden border-2 hover:border-primary/50 transition-all shadow-md flex flex-col relative group">
                                
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                    onClick={() => handleRemoveSuggestion(idx)}
                                    title="Slett forslag"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <CardHeader className="bg-slate-50 border-b pb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-400">Kjøretøy</Label>
                                            <Select 
                                                value={s.vehicleId} 
                                                onValueChange={(val) => updateSuggestion(idx, { vehicleId: val })}
                                            >
                                                <SelectTrigger className="bg-white font-bold h-10">
                                                    <div className="flex items-center gap-2">
                                                        <Truck className={cn("h-4 w-4", isGreen ? "text-green-600" : "text-slate-500")} />
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

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-slate-400">Sjåfør</Label>
                                            <Select 
                                                value={s.driverId || 'none'} 
                                                onValueChange={(val) => updateSuggestion(idx, { driverId: val === 'none' ? undefined : val })}
                                            >
                                                <SelectTrigger className="bg-white font-bold h-10">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-500" />
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
                                
                                <CardContent className="p-6 flex-1 space-y-6">
                                    {/* Route Metrics */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase mb-1">
                                                <MapPin className="h-3 w-3" /> Distanse
                                            </div>
                                            <p className="text-lg font-black">{s.estimatedDistance.toFixed(1)} km</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase mb-1">
                                                <Clock className="h-3 w-3" /> Varighet
                                            </div>
                                            <p className="text-lg font-black">
                                                {Math.floor(s.estimatedDuration / 60)}t {Math.round(s.estimatedDuration % 60)}m
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase mb-1">
                                                <Package className="h-3 w-3" /> Ordre
                                            </div>
                                            <p className="text-lg font-black">{s.orders.length} stk</p>
                                        </div>
                                    </div>

                                    {/* Warnings Section */}
                                    {s.warnings.length > 0 && (
                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                                            <p className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-1.5">
                                                <AlertTriangle className="h-3 w-3" /> Systemmerknader
                                            </p>
                                            <div className="space-y-1">
                                                {s.warnings.map((w, wIdx) => (
                                                    <div key={wIdx} className="text-[10px] flex gap-2 font-bold text-amber-800">
                                                        <div className="h-1 w-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                                        {w}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stops Timeline with Removal */}
                                    <div className="space-y-4">
                                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rekkefølge og justering</p>
                                         <div className="space-y-3">
                                             {s.places.map((p, pIdx) => {
                                                 const placeOrders = s.orders.filter(o => o.placeId === p.id);
                                                 return (
                                                     <div key={pIdx} className="flex items-start gap-3 p-3 rounded-xl border bg-white hover:bg-slate-50 group/item transition-colors">
                                                         <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                                             {pIdx + 1}
                                                         </div>
                                                         <div className="flex-1 min-w-0">
                                                             <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold truncate text-slate-800">{p.name}</p>
                                                                {p.isZeroEmissionZone && <Leaf className="h-3 w-3 text-green-600" />}
                                                                {p.isCityCenter && <Building2 className="h-3 w-3 text-blue-600" />}
                                                             </div>
                                                             <p className="text-[10px] text-slate-500 truncate mb-2">{p.address}</p>
                                                             
                                                             <div className="flex flex-wrap gap-1.5">
                                                                {placeOrders.map(o => (
                                                                    <Badge key={o.id} variant="secondary" className="h-6 text-[9px] font-bold pr-1">
                                                                        {o.barcode}
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="h-4 w-4 ml-1 hover:text-red-500"
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
                                        className="w-full h-12 text-lg font-bold gap-2 shadow-lg shadow-indigo-100"
                                        variant="default"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Opprett Rute
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed rounded-2xl bg-slate-50 border-slate-200">
                    <Sparkles className="h-12 w-12 text-slate-300" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-700">Ingen forslag enda</h3>
                        <p className="text-slate-400 max-w-sm">Trykk på "Generer Forslag" knappen for å la motoren beregne ruter basert på dagens ordre og flåte.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
