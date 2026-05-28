'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useSearch } from '@/hooks/use-search';
import { firebaseDB } from '@/lib/firebase/database';
import { Vehicle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, SearchX, Loader2, Edit, Trash2, ShieldCheck, AlertTriangle, Info, Gauge, Download } from 'lucide-react';
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
  TooltipProvider,
} from "@/components/ui/tooltip"
import { format, isBefore, addDays, parseISO, differenceInDays } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/**
 * FleetPage er kontrollpanelet for organisasjonens kjøretøypark.
 * 
 * Siden gir administratorer mulighet til å:
 * - Se sanntidsstatus for alle enheter (Klar, På rute, Verksted, etc.).
 * - Overvåke teknisk samsvar (EU-kontroll, Service, Fartsskriver).
 * - Administrere enhetens egenskaper (Kapasitet, dimensjoner, utstyr).
 * - Registrere lovpålagte nedlastinger av fartsskriverdata.
 * - Håndtere skaderapportering og verkstedoppfølging via `VehicleDetailsModal`.
 * 
 * Visningen inkluderer et filtrerbart rutenett av kjøretøykort og en 
 * statistikkoversikt i toppen.
 */
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
    
    /**
     * Beregner flåtestatistikk basert på aktive statuser.
     */
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

    /**
     * Henter alle kjøretøy tilhørende organisasjonen.
     */
    const loadVehicles = async () => {
        try {
            setIsLoading(true);
            const data = await firebaseDB.getVehicles(dbUser!.orgId);
            setVehicles(data);
            
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

    /**
     * Lagrer eller oppdaterer et kjøretøy.
     * 
     * @param data - De oppdaterte kjøretøydataene.
     */
    const handleSubmit = async (data: Partial<Vehicle>) => {
        if (!dbUser?.orgId) return;

        console.log("[FleetPage] handleSubmit called with data:", data);

        try {
            // Use the unified saveVehicle function which is more robust
            await firebaseDB.saveVehicle(data.id, { ...data, orgId: dbUser.orgId });
            
            toast({ 
                title: "Lagret", 
                description: data.id ? "Kjøretøyet ble oppdatert." : "Nytt kjøretøy ble lagt til." 
            });
            
            await loadVehicles();
            handleCloseForm();
        } catch (error: any) {
            console.error("[FleetPage] Save failed:", error);
            toast({ 
                title: "Feil ved lagring", 
                description: error.message || "Kunne ikke lagre kjøretøyet til databasen.", 
                variant: "destructive" 
            });
        }
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
            toast({ title: "Feil", description: "Kunne ikke slette kjøretøyet.", variant: "destructive" });
        }
    };

    /**
     * Bestemmer visuell status for en frist (EU-kontroll, Service, etc.)
     */
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

    /**
     * Bestemmer visuell status for fartsskriver-nedlasting (90 dager).
     */
    const getTachoStatus = (dateStr?: string) => {
        if (!dateStr) return 'missing';
        try {
            const date = parseISO(dateStr);
            const today = new Date();
            const daysSince = differenceInDays(today, date);
            
            if (daysSince > 90) return 'expired';
            if (daysSince > 80) return 'warning';
            return 'ok';
        } catch (e) {
            return 'missing';
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
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Truck className="h-8 w-8 text-primary" /> Kjøretøypark
                        </h1>
                        <p className="text-muted-foreground mt-2">Administrer flåten og teknisk samsvar.</p>
                    </div>
                </div>

                {/* Status Dashboard */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <StatusStat value={stats.ready} label="Klar" color="text-green-600" />
                    <StatusStat value={stats.on_tour} label="På rute" color="text-blue-600" />
                    <StatusStat value={stats.parked} label="Parkert" color="text-slate-600" />
                    <StatusStat value={stats.observation} label="Obs" color="text-yellow-600" />
                    <StatusStat value={stats.pending_workshop} label="Venter" color="text-orange-600" />
                    <StatusStat value={stats.workshop} label="Verksted" color="text-red-600" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map(v => (
                        <Card key={v.id} onClick={() => setSelectedVehicle(v)} className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
                            {v.images?.[0] && (
                                <div className="w-full h-48 relative border-b"><img src={v.images[0].url} alt={v.name} className="w-full h-full object-cover" /></div>
                            )}
                            <CardHeader className="pb-3 flex flex-row justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-bold truncate">{v.name}</CardTitle>
                                    <Badge variant="outline" className="mt-2">{v.registrationNumber}</Badge>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenForm(v); }}><Edit className="h-4 w-4" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                    <span className="flex items-center gap-2"><Truck className="h-4 w-4" />{v.type}</span>
                                    {v.lastOdometerReading && <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{v.lastOdometerReading.toLocaleString()} km</span>}
                                </div>

                                <div className="p-3 rounded-lg bg-slate-50 border space-y-1.5">
                                    <DeadlineRow label="EU-kontroll" date={v.euControl} status={getDeadlineStatus(v.euControl)} />
                                    <DeadlineRow label="Service" value={v.nextService} />
                                    {v.lastTachoDownloadDate && <DeadlineRow label="Fartsskriver" date={v.lastTachoDownloadDate} status={getTachoStatus(v.lastTachoDownloadDate)} />}
                                </div>
                                <div className="pt-2 flex items-center gap-1 text-[10px] font-black text-primary uppercase"><Info className="h-3 w-3" /> Se detaljer</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Enhetsdetaljer</DialogTitle></DialogHeader>
                        <VehicleForm initialData={editingVehicle} orgId={dbUser?.orgId || ''} onSubmit={handleSubmit} onCancel={handleCloseForm} />
                    </DialogContent>
                </Dialog>

                <VehicleDetailsModal vehicle={selectedVehicle} isOpen={!!selectedVehicle} onClose={() => setSelectedVehicle(null)} onUpdate={loadVehicles} />
            </div>
        </TooltipProvider>
    );
}

function StatusStat({ value, label, color }: any) {
    return (
        <Card className="bg-white border-slate-200">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-[9px] font-bold uppercase text-slate-400">{label}</CardTitle></CardHeader>
            <CardContent className="p-3 pt-0"><div className={cn("text-xl font-black", color)}>{value}</div></CardContent>
        </Card>
    );
}

function DeadlineRow({ label, date, value, status }: any) {
    return (
        <div className="flex justify-between text-[10px]">
            <span className="text-slate-500 uppercase font-bold">{label}:</span>
            <span className={cn("font-black", status === 'expired' ? "text-red-600" : status === 'warning' ? "text-orange-500" : "text-slate-700")}>
                {date ? format(parseISO(date), 'dd.MM.yy') : value || '---'}
            </span>
        </div>
    );
}
