'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useSearch } from '@/hooks/use-search';
import { firebaseDB } from '@/lib/firebase/database';
import { Vehicle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, SearchX, Plus, Loader2, Edit, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { VehicleForm } from '@/components/fleet/vehicle-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
            if (editingVehicle) {
                await firebaseDB.updateVehicle(editingVehicle.id, data);
                toast({ title: "Lagret", description: "Kjøretøyet ble oppdatert." });
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

    const handleDelete = async (id: string) => {
        if (!confirm("Er du sikker på at du vil slette dette kjøretøyet?")) return;
        
        try {
            await firebaseDB.deleteVehicle(id);
            toast({ title: "Slettet", description: "Kjøretøyet ble fjernet." });
            await loadVehicles();
        } catch (error) {
            console.error("Failed to delete vehicle", error);
            toast({ title: "Feil", description: "Kunne ikke slette kjøretøyet.", variant: "destructive" });
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
                            <Card key={v.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden bg-white border-slate-200">
                                {v.images && v.images.length > 0 && (
                                    <div className="w-full h-48 relative bg-slate-100 border-b border-slate-100">
                                        <img 
                                            src={v.images.find(img => img.isMain)?.url || v.images[0].url} 
                                            alt={v.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-bold">{v.name}</CardTitle>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline">{v.registrationNumber}</Badge>
                                            <Badge variant={v.status === 'active' ? 'default' : v.status === 'maintenance' ? 'destructive' : 'secondary'}>
                                                {v.status === 'active' ? 'I drift' : v.status === 'maintenance' ? 'Verksted' : 'Inaktiv'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end -mt-2 -mr-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => handleOpenForm(v)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(v.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 flex-grow flex flex-col justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                            <Truck className="h-4 w-4" />
                                            <span>{v.type === 'truck' ? 'Lastebil' : v.type === 'van' ? 'Varebil' : v.type === 'trailer' ? 'Henger' : 'Personbil'}</span>

                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            {v.capabilities?.tailLift && <Badge variant="secondary">Lift</Badge>}
                                            {v.capabilities?.refrigeration && <Badge variant="secondary">Kjøl/Frys</Badge>}
                                            {v.capabilities?.trailerCoupling && <Badge variant="secondary">Hengerfeste</Badge>}
                                            {v.capabilities?.adr && <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">ADR</Badge>}
                                            {v.capabilities?.flatbed && <Badge variant="outline" className="bg-slate-100 border-slate-300">Flak/Åpen</Badge>}
                                        </div>
                                        {(v.dimensions?.height || v.dimensions?.width || v.dimensions?.length) && (
                                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                                {v.dimensions.height && <span title="Høyde">H: {v.dimensions.height}m</span>}
                                                {v.dimensions.width && <span title="Bredde">B: {v.dimensions.width}m</span>}
                                                {v.dimensions.length && <span title="Lengde">L: {v.dimensions.length}m</span>}
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
                              onSubmit={handleSubmit} 
                              onCancel={handleCloseForm} 
                          />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
