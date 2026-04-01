'use client';

import { useState } from 'react';
import { Vehicle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { firebaseStorage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';

interface VehicleFormProps {
    initialData?: Vehicle | null;
    onSubmit: (data: Partial<Vehicle>) => Promise<void>;
    onCancel: () => void;
}

export function VehicleForm({ initialData, onSubmit, onCancel }: VehicleFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<Array<{ url: string, preview?: string, file?: File }>>(
        initialData?.images || []
    );
    const [isUploading, setIsUploading] = useState(false);

    // Image compression logic
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

        const remainingSlots = 8 - images.length;
        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            processFile(file, (preview, resizedFile) => {
                setImages(prev => [...prev, { url: '', preview, file: resizedFile }]);
            });
        });
        
        if (e.target) e.target.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    
    const [formData, setFormData] = useState<Partial<Vehicle>>(
        initialData || {
            name: '',
            registrationNumber: '',
            type: 'van',
            fuelType: 'diesel',
            status: 'active',
            capacity: { weight: undefined, volume: undefined, pallets: undefined },
            dimensions: { length: undefined, height: undefined, width: undefined },
            capabilities: { refrigeration: false, tailLift: false, adr: false, trailerCoupling: false },
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsUploading(true);
        try {
            const finalImages = [];
            for (const img of images) {
                if (img.file) {
                    const ext = img.file.name.split('.').pop() || 'jpg';
                    // We don't have vehicle ID yet if it's new, so use a random folder
                    const vehicleIdFolder = initialData?.id || `temp_${uuidv4()}`;
                    const path = `vehicles/${vehicleIdFolder}/${uuidv4()}.${ext}`;
                    const url = await firebaseStorage.uploadFile(path, img.file);
                    finalImages.push({ url });
                } else {
                    finalImages.push({ url: img.url });
                }
            }
            
            await onSubmit({ ...formData, images: finalImages });
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    const handleChange = (field: keyof Vehicle, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (category: 'capacity' | 'capabilities' | 'dimensions', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] as any),
                [field]: value
            }
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Internt Navn / ID *</Label>
                    <Input 
                        id="name" 
                        required 
                        placeholder="F.eks. Bil 1, Lastebil Nord"
                        value={formData.name || ''} 
                        onChange={e => handleChange('name', e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reg">Registreringsnummer *</Label>
                    <Input 
                        id="reg" 
                        required 
                        placeholder="AB 12345"
                        value={formData.registrationNumber || ''} 
                        onChange={e => handleChange('registrationNumber', e.target.value)} 
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Kjøretøytype</Label>
                    <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="car">Personbil</SelectItem>
                            <SelectItem value="van">Varebil</SelectItem>
                            <SelectItem value="truck">Lastebil</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fuel">Drivstoff</Label>
                    <Select value={formData.fuelType || 'diesel'} onValueChange={(v) => handleChange('fuelType', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="electric">Elektrisk</SelectItem>
                            <SelectItem value="gas">Gass</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Kapasitet</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="weight">Nyttelast (kg)</Label>
                        <Input 
                            id="weight" 
                            type="number" 
                            value={formData.capacity?.weight || ''} 
                            onChange={e => handleNestedChange('capacity', 'weight', e.target.value ? Number(e.target.value) : undefined)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="volume">Volum (m³)</Label>
                        <Input 
                            id="volume" 
                            type="number" 
                            step="0.1"
                            value={formData.capacity?.volume || ''} 
                            onChange={e => handleNestedChange('capacity', 'volume', e.target.value ? Number(e.target.value) : undefined)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pallets">Antall Paller</Label>
                        <Input 
                            id="pallets" 
                            type="number" 
                            value={formData.capacity?.pallets || ''} 
                            onChange={e => handleNestedChange('capacity', 'pallets', e.target.value ? Number(e.target.value) : undefined)} 
                        />
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Egenskaper & Utstyr</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor="tailLift" className="flex-1 cursor-pointer">Bakløfter (Lift)</Label>
                        <Switch 
                            id="tailLift" 
                            checked={formData.capabilities?.tailLift} 
                            onCheckedChange={v => handleNestedChange('capabilities', 'tailLift', v)} 
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor="refrigeration" className="flex-1 cursor-pointer">Kjøl/Frys</Label>
                        <Switch 
                            id="refrigeration" 
                            checked={formData.capabilities?.refrigeration} 
                            onCheckedChange={v => handleNestedChange('capabilities', 'refrigeration', v)} 
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor="trailer" className="flex-1 cursor-pointer">Hengerfeste (Kan trekke henger)</Label>
                        <Switch 
                            id="trailer" 
                            checked={formData.capabilities?.trailerCoupling} 
                            onCheckedChange={v => handleNestedChange('capabilities', 'trailerCoupling', v)} 
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor="adr" className="flex-1 cursor-pointer">ADR (Farlig gods)</Label>
                        <Switch 
                            id="adr" 
                            checked={formData.capabilities?.adr} 
                            onCheckedChange={v => handleNestedChange('capabilities', 'adr', v)} 
                        />
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <div className="space-y-2 max-w-sm">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Aktiv i drift</SelectItem>
                            <SelectItem value="maintenance">På verksted / Vedlikehold</SelectItem>
                            <SelectItem value="inactive">Inaktiv</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            
            {/* Images Section */}
            <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Kjøretøybilder</h3>
                        <p className="text-xs text-muted-foreground">Maks 8 bilder.</p>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {images.length} / 8
                    </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative group rounded-md overflow-hidden border">
                            <div className="relative aspect-square w-full">
                                <Image
                                    src={img.preview || img.url}
                                    alt={`Bilde ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <Button 
                                type="button"
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    
                    {images.length < 8 && (
                        <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="sr-only"
                              ref={fileInputRef}
                              onChange={handleAddImages}
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="h-full aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  fileInputRef.current?.click();
                                }}
                            >
                              <UploadCloud className="h-6 w-6" />
                              <span className="text-xs">Last opp</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>Avbryt</Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                    {(isSubmitting || isUploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Lagre Kjøretøy
                </Button>
            </div>
        </form>
    );
}
