'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Vehicle, VehicleInspection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
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
import { serverTimestamp } from 'firebase/firestore';
import { firebaseStorage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const [damageImages, setDamageImages] = useState<Array<{ preview: string, file: File }>>([]);
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
        setDamageImages([]);
        setNotes('');
    };

    const processFile = (file: File, callback: (preview: string, resizedFile: File) => void) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const preview = canvas.toDataURL('image/jpeg', 0.8);
              canvas.toBlob((blob) => {
                if (blob) {
                    const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
                    callback(preview, resizedFile);
                }
              }, 'image/jpeg', 0.8);
            }
          };
          if (event.target?.result) {
            img.src = event.target.result as string;
          }
        };
        reader.readAsDataURL(file);
    };

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remainingSlots = 4 - damageImages.length;
        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            processFile(file, (preview, resizedFile) => {
                setDamageImages(prev => [...prev, { preview, file: resizedFile }]);
            });
        });
        
        if (e.target) e.target.value = '';
    };

    const removeImage = (index: number) => {
        setDamageImages(prev => prev.filter((_, i) => i !== index));
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

        const newMileage = parseInt(mileage);
        if (vehicle.lastOdometerReading && newMileage < vehicle.lastOdometerReading) {
            if (!confirm(`Kilometerstanden du oppga (${newMileage}) er lavere enn sist registrerte (${vehicle.lastOdometerReading}). Er du sikker?`)) {
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const uploadedUrls: string[] = [];
            for (const img of damageImages) {
                const path = `vehicles/${vehicle.id}/damages/${uuidv4()}.jpg`;
                const url = await firebaseStorage.uploadFile(path, img.file);
                uploadedUrls.push(url);
            }

            const inspectionData: Omit<VehicleInspection, 'id'> = {
                orgId: dbUser.orgId,
                vehicleId: vehicle.id,
                driverId: dbUser.id,
                timestamp: new Date(),
                type: type,
                mileage: newMileage,
                checks: checks,
                damagesReported: damagesReported,
                notes: notes,
                damageDetails: damagesReported ? [{
                    description: damageDescription,
                    photos: uploadedUrls.map(url => ({ url, uploadedAt: new Date() }))
                }] : undefined
            };

            await firebaseDB.submitVehicleInspection(inspectionData);
            
            // UPDATE VEHICLE ODOMETER
            await firebaseDB.updateVehicle(vehicle.id, {
                lastOdometerReading: newMileage,
                lastOdometerDate: serverTimestamp()
            });

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
                    images: uploadedUrls,
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
                        <div className="flex justify-between items-end">
                            <Label htmlFor="mileage" className="text-base font-bold flex items-center gap-2">
                                <Gauge className="h-4 w-4 text-slate-500" />
                                Kilometerstand
                            </Label>
                            {vehicle.lastOdometerReading && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    Sist: {vehicle.lastOdometerReading.toLocaleString('no-NO')} km
                                </span>
                            )}
                        </div>
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
                                
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Bildebevis (maks 4)</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {damageImages.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 bg-white">
                                                <Image src={img.preview} alt="Skade" fill className="object-cover" />
                                                <Button 
                                                    type="button" 
                                                    variant="destructive" 
                                                    size="icon" 
                                                    className="h-6 w-6 absolute top-1 right-1" 
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {damageImages.length < 4 && (
                                            <>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    multiple 
                                                    className="hidden" 
                                                    ref={fileInputRef} 
                                                    onChange={handleAddImages} 
                                                />
                                                <Button 
                                                    variant="outline" 
                                                    className="aspect-square flex flex-col items-center justify-center gap-1 border-dashed border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 h-full"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Camera className="h-6 w-6" />
                                                    <span className="text-[10px] font-bold uppercase">Legg til</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
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
