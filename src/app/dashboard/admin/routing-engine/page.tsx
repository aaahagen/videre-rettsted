'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Order, Vehicle, Place, DriverProfile, RouteSuggestion } from '@/lib/types';
import { ConstraintEngine } from '@/lib/routing-engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Truck, User, MapPin, AlertTriangle, CheckCircle2, Clock, Calendar, ArrowRight, Package, Leaf, Battery } from 'lucide-react';
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

                // Only unassigned orders
                setOrders(allOrders.filter(o => !o.routeId && o.status === 'pending'));
                setVehicles(allVehicles.filter(v => v.currentStatuses.includes('ready')));
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
        
        // Use a small timeout to let the UI show the loader
        setTimeout(() => {
            try {
                const engine = new ConstraintEngine();
                const placesMap = new Map(places.map(p => [p.id, p]));
                
                // Assuming a default depot for now (can be organization mainDepot later)
                const depotCoords = { lat: 59.9139, lng: 10.7522 }; // Oslo Default
                
                const results = engine.generateBasicSuggestion(
                    vehicles,
                    drivers,
                    orders,
                    placesMap,
                    depotCoords,
                    "08:00",
                    'monday' // Simplified for first iteration
                );

                setSuggestions(results);
                toast({ title: "Forslag generert", description: `Planla ${results.reduce((sum, s) => sum + s.orders.length, 0)} ordre på ${results.length} ruter.` });
            } catch (err) {
                console.error(err);
                toast({ title: "Feil ved beregning", description: "Noe gikk galt under ruteoptimaliseringen.", variant: "destructive" });
            } finally {
                setCalculating(false);
            }
        }, 500);
    };

    const handleApplyRoute = async (suggestion: RouteSuggestion) => {
        if (!dbUser?.orgId) return;
        
        try {
            setCalculating(true);
            const routeName = `Auto: ${suggestion.places[0]?.name || 'Rute'} - ${new Date().toLocaleDateString('nb-NO')}`;
            
            // 1. Create the Route
            const newRoute = await firebaseDB.createRoute({
                name: routeName,
                orgId: dbUser.orgId,
                places: suggestion.places.map(p => p.id),
                vehicleId: suggestion.vehicleId,
                driverId: suggestion.driverId,
                date: selectedDate,
                status: 'active'
            });

            // 2. Update all orders with the routeId
            await Promise.all(suggestion.orders.map(order => 
                firebaseDB.updateOrder(dbUser.orgId!, order.id, { routeId: newRoute.id })
            ));

            // 3. Create Manifest
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
            
            // Remove the suggested orders from the local state
            setOrders(prev => prev.filter(o => !suggestion.orders.some(so => so.id === o.id)));
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
                    <p className="text-slate-500 font-medium">Automatisk clustering av ordre basert på kapasitet, tid og geografi.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent font-bold text-sm outline-none"
                        />
                    </div>
                    <Button onClick={handleGenerate} disabled={calculating || orders.length === 0} size="lg" className="shadow-lg font-bold gap-2">
                        {calculating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                        Generer Forslag
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
                            <Card key={idx} className="overflow-hidden border-2 hover:border-primary/50 transition-all shadow-md flex flex-col">
                                <CardHeader className="bg-slate-50 border-b pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-white border rounded shadow-sm">
                                                    <Truck className={cn("h-5 w-5", isGreen ? "text-green-600" : "text-slate-700")} />
                                                </div>
                                                <CardTitle className="text-xl font-bold">{vehicle?.name} ({vehicle?.registrationNumber})</CardTitle>
                                                {isGreen && <Leaf className="h-4 w-4 text-green-500 fill-current" />}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                <User className="h-3 w-3" />
                                                Sjåfør: {driver?.name || 'Ikke tildelt'}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-white font-black px-3 py-1">
                                            FORSLAG #{idx + 1}
                                        </Badge>
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
                                            {vehicle?.maxRange && (
                                                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <Battery className="h-2 w-2" /> Rekkevidde: {vehicle.maxRange}km
                                                </div>
                                            )}
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

                                    {/* Warnings Section - The "Cyborg" Part */}
                                    {s.warnings.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                Systemmerknader ({s.warnings.length})
                                            </p>
                                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-2">
                                                {s.warnings.map((w, wIdx) => {
                                                    const isEnvironmental = w.includes("Environmental") || w.includes("ENVIRONMENTAL");
                                                    return (
                                                        <div key={wIdx} className={cn(
                                                            "text-xs flex gap-2 font-medium",
                                                            isEnvironmental ? "text-emerald-800" : "text-amber-800"
                                                        )}>
                                                            {isEnvironmental ? <Leaf className="h-3 w-3 mt-0.5 shrink-0" /> : <div className="h-1 w-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />}
                                                            {w}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stops Timeline */}
                                    <div className="space-y-3">
                                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rekkefølge</p>
                                         <div className="space-y-2">
                                             {s.places.map((p, pIdx) => (
                                                 <div key={pIdx} className="flex items-center gap-3">
                                                     <div className="flex flex-col items-center shrink-0">
                                                         <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                                                             {pIdx + 1}
                                                         </div>
                                                         {pIdx < s.places.length - 1 && <div className="w-0.5 h-4 bg-slate-200" />}
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                         <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold truncate text-slate-800">{p.name}</p>
                                                            {p.isZeroEmissionZone && <Leaf className="h-3 w-3 text-green-600" />}
                                                            {p.isCityCenter && <Building2 className="h-3 w-3 text-blue-600" />}
                                                         </div>
                                                         <p className="text-[10px] text-slate-500 truncate">{p.address}</p>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                    </div>

                                    <Button 
                                        onClick={() => handleApplyRoute(s)} 
                                        className="w-full h-12 text-lg font-bold gap-2"
                                        variant="secondary"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Godkjenn & Opprett Rute
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

import { Building2 } from 'lucide-react';
