'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useSearch } from '@/hooks/use-search';
import { firebaseDB } from '@/lib/firebase/database';
import { Vehicle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, SearchX, Plus, Loader2, Edit, Trash2, FileText, Weight, Box, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { VehicleForm } from '@/components/fleet/vehicle-form';
import { VehicleDetailsModal } from '@/components/fleet/vehicle-details-modal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format, isBefore, addDays, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function FleetPage() {
    const { dbUser } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { query: searchQuery, setContext } = useSearch();
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const { toast } = useToast();
    const [stats, setStats] = useState({ ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 });
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    
    useEffect(() => {
        const newStats = { ready: 0, pending_workshop: 0, workshop: 0, observation: 0, on_tour: 0, parked: 0 };
        vehicles.forEach(v => {
            const statuses = v.currentStatuses || [];
            if (statuses.length === 0) {
                if (v.status === 'active') newStats.ready++;
                if (v.status === 'maintenance') newStats.workshop++;
            } else {
                statuses.forEach(s => {
                    if (newStats[s as keyof typeof newStats] !== undefined) {
                         newStats[s as keyof typeof newStats]++;
                    }
                });
            }
        });
        setStats(newStats);
    }, [vehicles]);


    useEffect(() => {
        const handleOpen = () => handleOpenForm();
        window.addEventListener('open-new-vehicle-form', handleOpen);
        return () => window.removeEventListener('open-new-vehicle-form', handleOpen);
    }, []);

    useEffect(() => {
        setContext('Kjøretøy', '/dashboard/fleet');
        return () => setContext('Steder', '/dashboard/new');
    }, [setContext]);

    useEffect(() => {
        if (dbUser?.orgId) {
            loadVehicles();
        }
    }, [dbUser]);

    const loadVehicles = async () => {
        try {
            setIsLoading(true);
            const data = await firebaseDB.getVehicles(dbUser!.orgId);
            setVehicles(data);
            
            // If a vehicle is currently selected for details, refresh its data
            if (selectedVehicle) {
                const updated = data.find(v => v.id === selectedVehicle.id);
                if (updated) setSelectedVehicle(updated);
            }
        } catch (error) {
            console.error("Failed to load vehicles", error);
            toast({ title: "Feil", description: "Kunne ikke laste kjøretøy", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenForm = (vehicle: Vehicle | null = null) => {
        setEditingVehicle(vehicle);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingVehicle(null);
    };

    const handleSubmit = async (data: Partial<Vehicle>) => {
        if (!dbUser?.orgId) return;

        try {
            if (data.id) {
                await firebaseDB.updateVehicle(data.id, data);
                toast({ 
                    title: "Lagret", 
                    description: editingVehicle ? "Kjøretøyet ble oppdatert." : "Nytt kjøretøy ble lagt til." 
                });
            } else {
                await firebaseDB.createVehicle({ ...data, orgId: dbUser.orgId } as any);
                toast({ title: "Lagret", description: "Nytt kjøretøy ble lagt til." });
            }
            await loadVehicles();
            handleCloseForm();
        } catch (error) {
            console.error("Failed to save vehicle", error);
            toast({ title: "Feil", description: "Kunne ikke lagre kjøretøyet.", variant: "destructive" });
        }
    };

    const handleDeleteClick = async (e: React.MouseEvent, vehicle: Vehicle) => {
        e.preventDefault();
        e.stopPropagation();
        setVehicleToDelete(vehicle);
    };

    const confirmDelete = async () => {
        if (!vehicleToDelete || deleteConfirmationText !== "slett kjøretøy") return;
        try {
            await firebaseDB.deleteVehicle(vehicleToDelete.id);
            toast({ title: "Slettet", description: "Kjøretøyet ble fjernet." });
            setVehicleToDelete(null);
            setDeleteConfirmationText("");
            await loadVehicles();
        } catch (error: any) {
            console.error("Failed to delete vehicle:", error);
            toast({ 
                title: "Feil", 
                description: `Kunne ikke slette kjøretøyet: ${error.message || 'Ukjent feil'}`, 
                variant: "destructive" 
            });
        }
    };

    const getDeadlineStatus = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            const date = parseISO(dateStr);
            const today = new Date();
            const warningDate = addDays(today, 30);
            
            if (isBefore(date, today)) return 'expired';
            if (isBefore(date, warningDate)) return 'warning';
            return 'ok';
        } catch (e) {
            return null;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const safeQuery = (searchQuery || '').toLowerCase();
    const filteredVehicles = vehicles.filter(v => 
        (v.name?.toLowerCase().includes(safeQuery) || false) ||
        (v.registrationNumber?.toLowerCase().includes(safeQuery) || false)
    );

    const getVehicleTypeLabel = (type: string) => {
        switch(type) {
            case 'truck': return 'Lastebil';
            case 'van': return 'Varebil';
            case 'tractor': return 'Trekkvogn';
            case 'trailer': return 'Henger';
            case 'car': return 'Liten bil';
            default: return 'Personbil';
        }
    };

    return (
        <TooltipProvider>
            <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Truck className="h-8 w-8 text-primary" />
                            Kjøretøypark
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Administrer bedriftens kjøretøy og deres egenskaper for ruteplanlegging.
                        </p>
                    </div>
                    
                </div>

                {/* Statistics Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Klar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">På rute</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.on_tour}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Parkert</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-600">{stats.parked}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Observasjon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.observation}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Venter på verksted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.pending_workshop}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">På verksted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.workshop}</div>
                        </CardContent>
                    </Card>
                </div>

                {filteredVehicles.length === 0 && searchQuery ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
                        <div className="rounded-full bg-slate-100 p-6 mb-4">
                            <SearchX className="h-12 w-12 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Ingen kjøretøy matchet "{searchQuery}"
                        </h2>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-white rounded-xl border border-slate-200">
                        <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Ingen kjøretøy registrert ennå.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicles.map(v => (
                            <Card 
                                key={v.id} 
                                onClick={() => setSelectedVehicle(v)}
                                className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden bg-white border-slate-200 group cursor-pointer"
                            >
                                {v.images && v.images.length > 0 && (
                                    <div className="w-full h-48 relative bg-slate-100 border-b border-slate-100">
                                        <img 
                                            src={v.images.find(img => img.isMain)?.url || v.images[0].url} 
                                            alt={v.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <CardHeader className="pb-3 flex flex-row items-start justify-between relative">
                                    <div className="flex-1 min-w-0 pr-20">
                                        <CardTitle className="text-xl font-bold truncate">{v.name}</CardTitle>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            <Badge variant="outline">{v.registrationNumber}</Badge>
                                            {v.currentStatuses && v.currentStatuses.length > 0 ? (
                                                v.currentStatuses.map(s => {
                                                    const statusMap: any = {
                                                        'ready': { label: 'Klar', color: 'bg-green-100 text-green-800 hover:bg-green-100' },
                                                        'on_tour': { label: 'På rute', color: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
                                                        'parked': { label: 'Parkert', color: 'bg-slate-100 text-slate-800 hover:bg-slate-100' },
                                                        'observation': { label: 'Obs', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
                                                        'pending_workshop': { label: 'Venter verksted', color: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
                                                        'workshop': { label: 'Verksted', color: 'bg-red-100 text-red-800 hover:bg-red-100' }
                                                    };
                                                    const sm = statusMap[s] || { label: s, color: 'bg-slate-100' };
                                                    return <Badge key={s} variant="outline" className={`border-0 ${sm.color}`}>{sm.label}</Badge>
                                                })
                                            ) : (
                                                <Badge variant={v.status === 'active' ? 'default' : v.status === 'maintenance' ? 'destructive' : 'secondary'}>
                                                    {v.status === 'active' ? 'Klar (Gammel)' : v.status === 'maintenance' ? 'Verksted (Gammel)' : 'Inaktiv'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {dbUser?.role === 'admin' && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 z-30">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-slate-400 hover:text-slate-900 bg-white/90 backdrop-blur shadow-sm border border-slate-100" 
                                                onClick={(e) => { e.stopPropagation(); handleOpenForm(v); }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-white/90 backdrop-blur shadow-sm border border-slate-100" 
                                                onClick={(e) => handleDeleteClick(e, v)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-0 flex-grow flex flex-col justify-between gap-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                            <Truck className="h-4 w-4 text-indigo-500" />
                                            <span>{getVehicleTypeLabel(v.type)}</span>
                                        </div>

                                        {/* COMPLIANCE MINI DASHBOARD */}
                                        <div className="grid grid-cols-1 gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-slate-500 font-bold uppercase tracking-tight">EU-kontroll:</span>
                                                <div className="flex items-center gap-1.5 font-black">
                                                    {v.euControl ? (
                                                        <>
                                                            <span className={cn(
                                                                getDeadlineStatus(v.euControl) === 'expired' ? "text-red-600" : 
                                                                getDeadlineStatus(v.euControl) === 'warning' ? "text-orange-600" : "text-emerald-600"
                                                            )}>
                                                                {format(parseISO(v.euControl), 'dd.MM.yy')}
                                                            </span>
                                                            {getDeadlineStatus(v.euControl) !== 'ok' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                                                        </>
                                                    ) : <span className="text-slate-300 italic">Ikke satt</span>}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-slate-500 font-bold uppercase tracking-tight">Service:</span>
                                                <span className="font-black text-slate-700">{v.nextService || <span className="text-slate-300 italic">Ikke satt</span>}</span>
                                            </div>

                                            {(v.type === 'truck' || v.type === 'tractor') && (
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-slate-500 font-bold uppercase tracking-tight">Fartsskriver:</span>
                                                    <div className="flex items-center gap-1.5 font-black">
                                                        {v.tachographCalibration ? (
                                                            <>
                                                                <span className={cn(
                                                                    getDeadlineStatus(v.tachographCalibration) === 'expired' ? "text-red-600" : 
                                                                    getDeadlineStatus(v.tachographCalibration) === 'warning' ? "text-orange-600" : "text-emerald-600"
                                                                )}>
                                                                    {format(parseISO(v.tachographCalibration), 'dd.MM.yy')}
                                                                </span>
                                                                {getDeadlineStatus(v.tachographCalibration) !== 'ok' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                                                            </>
                                                        ) : <span className="text-slate-300 italic">Ikke satt</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {v.capabilities?.tailLift && <Badge variant="secondary">Lift</Badge>}
                                            {v.capabilities?.refrigeration && <Badge variant="secondary">Kjøl/Frys</Badge>}
                                            {v.capabilities?.trailerCoupling && <Badge variant="secondary">Hengerfeste</Badge>}
                                            {v.capabilities?.adr && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">ADR</Badge>}
                                            {v.capabilities?.flatbed && <Badge variant="outline" className="bg-slate-100 border-slate-300">Flak/Åpen</Badge>}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                                        <div className="flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            <span>SE DETALJER & STATUS</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>{editingVehicle ? 'Endre Kjøretøy' : 'Registrer Nytt Kjøretøy'}</DialogTitle>
                            <DialogDescription>
                                Fyll ut detaljene nedenfor for å legge til eller oppdatere et kjøretøy i flåten din.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <VehicleForm 
                              initialData={editingVehicle}
                              orgId={dbUser?.orgId || ''}
                              onSubmit={handleSubmit} 
                              onCancel={handleCloseForm} 
                          />
                        </div>
                    </DialogContent>
                </Dialog>

                <VehicleDetailsModal 
                    vehicle={selectedVehicle} 
                    isOpen={!!selectedVehicle} 
                    onClose={() => setSelectedVehicle(null)} 
                    onUpdate={loadVehicles}
                />

                <Dialog open={!!vehicleToDelete} onOpenChange={(open) => {
                    if (!open) {
                        setVehicleToDelete(null);
                        setDeleteConfirmationText("");
                    }
                }}>
                    <DialogContent className="max-w-md" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Bekreft sletting</DialogTitle>
                            <DialogDescription>
                                Er du sikker på at du vil slette <strong>{vehicleToDelete?.name}</strong>? Dette kan ikke angres.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <Label htmlFor="confirm-delete">Skriv "slett kjøretøy" for å bekrefte</Label>
                            <Input 
                                id="confirm-delete"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                placeholder="slett kjøretøy"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setVehicleToDelete(null); setDeleteConfirmationText(""); }}>Avbryt</Button>
                            <Button variant="destructive" onClick={confirmDelete} disabled={deleteConfirmationText !== "slett kjøretøy"}>Slett Kjøretøy</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
