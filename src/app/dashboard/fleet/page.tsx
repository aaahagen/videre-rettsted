'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Vehicle } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { VehicleForm } from '@/components/fleet/vehicle-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function FleetPage() {
    const { dbUser } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const { toast } = useToast();

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

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
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
                <Button onClick={() => handleOpenForm()}>
                    <Plus className="mr-2 h-4 w-4" /> Nytt Kjøretøy
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {vehicles.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Ingen kjøretøy registrert ennå.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {vehicles.map(v => (
                                <div key={v.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-lg">{v.name}</p>
                                            <Badge variant="outline">{v.registrationNumber}</Badge>
                                            <Badge variant={v.status === 'active' ? 'default' : v.status === 'maintenance' ? 'destructive' : 'secondary'}>
                                                {v.status === 'active' ? 'I drift' : v.status === 'maintenance' ? 'Verksted' : 'Inaktiv'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                            <span>Type: {v.type === 'truck' ? 'Lastebil' : v.type === 'van' ? 'Varebil' : 'Personbil'}</span>
                                            {v.capabilities?.tailLift && <span className="bg-slate-100 px-2 py-0.5 rounded">Lift</span>}
                                            {v.capabilities?.refrigeration && <span className="bg-slate-100 px-2 py-0.5 rounded">Kjøl/Frys</span>}
                                            {v.capabilities?.trailerCoupling && <span className="bg-slate-100 px-2 py-0.5 rounded">Hengerfeste</span>}
                                            {v.capabilities?.adr && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">ADR</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => handleOpenForm(v)}>
                                            <Edit className="h-4 w-4 mr-2" /> Endre
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(v.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{editingVehicle ? 'Endre Kjøretøy' : 'Nytt Kjøretøy'}</DialogTitle>
                    </DialogHeader>
                    <VehicleForm 
                        initialData={editingVehicle} 
                        onSubmit={handleSubmit} 
                        onCancel={handleCloseForm} 
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
