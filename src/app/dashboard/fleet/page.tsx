'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useSearch } from '@/hooks/use-search';
import { firebaseDB } from '@/lib/firebase/database';
import { Vehicle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, SearchX, Plus, Loader2, Edit, Trash2, FileText, Weight, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { VehicleForm } from '@/components/fleet/vehicle-form';
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

export default function FleetPage() {
    const { dbUser } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { query: searchQuery, setContext } = useSearch();
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
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
            // VehicleForm handles the initial creation if it's new to secure an ID for uploads.
            // We update the document here with the complete data (including image/doc URLs).
            if (data.id) {
                await firebaseDB.updateVehicle(data.id, data);
                toast({ 
                    title: "Lagret", 
                    description: editingVehicle ? "Kjøretøyet ble oppdatert." : "Nytt kjøretøy ble lagt til." 
                });
            } else {
                // Fallback for safety
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
                            <Card key={v.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden bg-white border-slate-200 group">
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
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                                            <Truck className="h-4 w-4 text-indigo-500" />
                                            <span>{getVehicleTypeLabel(v.type)}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {v.capabilities?.tailLift && <Badge variant="secondary">Lift</Badge>}
                                            {v.capabilities?.refrigeration && <Badge variant="secondary">Kjøl/Frys</Badge>}
                                            {v.capabilities?.trailerCoupling && <Badge variant="secondary">Hengerfeste</Badge>}
                                            {v.capabilities?.adr && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">ADR</Badge>}
                                            {v.capabilities?.flatbed && <Badge variant="outline" className="bg-slate-100 border-slate-300">Flak/Åpen</Badge>}
                                        </div>

                                        {(v.dimensions?.height || v.dimensions?.width || v.dimensions?.length || v.capacity?.weight || v.capacity?.volume) && (
                                            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                                                {v.capacity?.weight && (
                                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                        <Weight className="h-3 w-3 text-slate-400" />
                                                        <span className="font-bold text-slate-700">{v.capacity.weight} kg</span>
                                                    </div>
                                                )}
                                                {v.capacity?.volume && (
                                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                        <Box className="h-3 w-3 text-slate-400" />
                                                        <span className="font-bold text-slate-700">{v.capacity.volume} m³</span>
                                                    </div>
                                                )}
                                                <div className="flex gap-2 items-center text-slate-400 font-medium">
                                                    {v.dimensions?.height && <span title="Høyde">H: {v.dimensions.height}m</span>}
                                                    {v.dimensions?.width && <span title="Bredde">B: {v.dimensions.width}m</span>}
                                                    {v.dimensions?.length && <span title="Lengde">L: {v.dimensions.length}m</span>}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {v.capabilities?.customFields && v.capabilities.customFields.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                                                {v.capabilities.customFields.map((field, idx) => (
                                                    <div key={idx} className="bg-slate-50 border border-slate-100 px-2 py-1 rounded text-[10px] flex flex-col">
                                                        <span className="text-muted-foreground font-semibold uppercase tracking-tighter">{field.name}</span>
                                                        <span className="text-slate-700 font-bold">{field.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {(v.capacity?.notes || v.capabilities?.notes) && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                                {v.capacity?.notes && (
                                                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md">
                                                        <span className="font-semibold block mb-0.5 text-slate-700">Kapasitet info:</span>
                                                        <span className="whitespace-pre-wrap">{v.capacity.notes}</span>
                                                    </div>
                                                )}
                                                {v.capabilities?.notes && (
                                                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md">
                                                        <span className="font-semibold block mb-0.5 text-slate-700">Utstyr info:</span>
                                                        <span className="whitespace-pre-wrap">{v.capabilities.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {v.documents && v.documents.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vedlagte Dokumenter</span>
                                                <div className="flex flex-col gap-1.5">
                                                    {v.documents.map((doc, idx) => (
                                                        <a 
                                                            key={idx} 
                                                            href={doc.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-primary transition-colors border border-slate-200 rounded-md p-2 group"
                                                        >
                                                            <FileText className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                                                            <span className="truncate">{doc.name}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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