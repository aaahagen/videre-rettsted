'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Vehicle, VehicleInspection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, AlertTriangle, Truck, Gauge, Camera, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

interface VehicleInspectionFormProps {
    vehicle: Vehicle;
    type: 'pre_trip' | 'post_trip' | 'ad_hoc';
    onSuccess?: () => void;
}

export function VehicleInspectionForm({ vehicle, type, onSuccess }: VehicleInspectionFormProps) {
    const { dbUser } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [mileage, setMileage] = useState('');
    const [checks, setChecks] = useState({
        tires: true,
        brakes: true,
        lights: true,
        fluids: true,
        bodywork: true
    });
    const [damagesReported, setDamagesReported] = useState(false);
    const [damageDescription, setDamageDescription] = useState('');
    const [notes, setNotes] = useState('');

    const resetForm = () => {
        setMileage('');
        setChecks({
            tires: true,
            brakes: true,
            lights: true,
            fluids: true,
            bodywork: true
        });
        setDamagesReported(false);
        setDamageDescription('');
        setNotes('');
    };

    const handleSubmit = async () => {
        if (!dbUser?.orgId || !mileage) {
            toast({
                title: "Mangler info",
                description: "Vennligst fyll inn kilometerstand.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const inspectionData: Omit<VehicleInspection, 'id'> = {
                orgId: dbUser.orgId,
                vehicleId: vehicle.id,
                driverId: dbUser.id,
                timestamp: new Date(),
                type: type,
                mileage: parseInt(mileage),
                checks: checks,
                damagesReported: damagesReported,
                notes: notes,
                damageDetails: damagesReported ? [{
                    description: damageDescription,
                    photos: [] // Future: Add photo upload logic
                }] : undefined
            };

            await firebaseDB.submitVehicleInspection(inspectionData);
            
            // AUTOMATIC STATUS UPDATE: If damage is reported, mark vehicle as "observation"
            if (damagesReported) {
                const currentStatuses = vehicle.currentStatuses || [];
                if (!currentStatuses.includes('observation')) {
                    await firebaseDB.updateVehicle(vehicle.id, {
                        currentStatuses: [...currentStatuses, 'observation']
                    });
                }
                
                // Also create a Damage Report entry for the admin to see
                await firebaseDB.createVehicleDamageReport({
                    orgId: dbUser.orgId,
                    vehicleId: vehicle.id,
                    reportedBy: dbUser.id,
                    reportedByName: dbUser.name || 'Ukjent fører',
                    description: damageDescription,
                    images: [],
                    status: 'reported',
                    createdAt: new Date()
                } as any);
            }
            
            toast({
                title: "Kontroll fullført",
                description: `Sjekkliste for ${vehicle.registrationNumber} er lagret.`,
            });
            
            setIsOpen(false);
            resetForm();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Error submitting inspection:", error);
            toast({
                title: "Feil",
                description: "Kunne ikke lagre kontrollen. Prøv igjen.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCheck = (key: keyof typeof checks) => {
        setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getTypeLabel = () => {
        switch(type) {
            case 'pre_trip': return 'Sjekk før kjøring';
            case 'post_trip': return 'Sjekk etter kjøring';
            default: return 'Ad-hoc kontroll';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) resetForm(); }}>
            <DialogTrigger asChild>
                <Button variant={type === 'pre_trip' ? 'default' : 'outline'} className="gap-2">
                    <Truck className="h-4 w-4" />
                    {getTypeLabel()}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        {getTypeLabel()}
                    </DialogTitle>
                    <CardDescription>
                        Kjøretøy: <span className="font-bold text-slate-900">{vehicle.name} ({vehicle.registrationNumber})</span>
                    </CardDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Mileage */}
                    <div className="space-y-2">
                        <Label htmlFor="mileage" className="text-base font-bold flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-slate-500" />
                            Kilometerstand
                        </Label>
                        <Input 
                            id="mileage"
                            type="number"
                            placeholder="Skriv inn dagens km-stand..."
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            className="text-lg h-12"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4">
                        <Label className="text-base font-bold">Tilstandssjekk</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries({
                                tires: "Dekk & Felg",
                                brakes: "Bremser",
                                lights: "Lys & Lykter",
                                fluids: "Væsker (Olje/Spylervæske)",
                                bodywork: "Karosseri & Utvendig"
                            }).map(([key, label]) => (
                                <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                                    <Label htmlFor={`check-${key}`} className="cursor-pointer font-medium">{label}</Label>
                                    <Switch 
                                        id={`check-${key}`}
                                        checked={checks[key as keyof typeof checks]}
                                        onCheckedChange={() => toggleCheck(key as keyof typeof checks)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Damage Reporting */}
                    <div className={cn(
                        "p-4 rounded-xl border-2 transition-all space-y-4",
                        damagesReported ? "bg-red-50 border-red-200" : "bg-slate-50 border-transparent"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={cn("h-5 w-5", damagesReported ? "text-red-600" : "text-slate-400")} />
                                <Label className="text-base font-bold cursor-pointer" htmlFor="damage-toggle">
                                    Meld om skader eller mangler?
                                </Label>
                            </div>
                            <Switch 
                                id="damage-toggle"
                                checked={damagesReported}
                                onCheckedChange={setDamagesReported}
                            />
                        </div>

                        {damagesReported && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Textarea 
                                    placeholder="Beskriv skaden eller mangelen her..."
                                    value={damageDescription}
                                    onChange={(e) => setDamageDescription(e.target.value)}
                                    className="bg-white border-red-200 focus-visible:ring-red-500"
                                />
                                <Button variant="outline" className="w-full gap-2 bg-white border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800">
                                    <Camera className="h-4 w-4" />
                                    Last opp bildebevis
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* General Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-base font-bold">Generelle kommentarer</Label>
                        <Textarea 
                            id="notes"
                            placeholder="Valgfritt: Legg til andre observasjoner..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t gap-3 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Avbryt</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || !mileage}
                        className="gap-2 px-8 h-12 text-lg font-bold"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Lagre Kontroll
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}