'use client';

import { useState, useRef, useEffect } from 'react';
import { Vehicle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Trash2, Loader2, FileText, Download, Plus, Star, Info, Settings2, Construction } from 'lucide-react';
import Image from 'next/image';
import { firebaseStorage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { firebaseDB } from '@/lib/firebase/database';
import { cn } from '@/lib/utils';
import { deleteField } from 'firebase/firestore';

interface VehicleFormProps {
    initialData?: Vehicle | null;
    orgId: string;
    onSubmit: (data: Partial<Vehicle>) => Promise<void>;
    onCancel: () => void;
}

export function VehicleForm({ initialData, orgId, onSubmit, onCancel }: VehicleFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docFileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<Array<{ url: string, preview?: string, file?: File, isMain?: boolean }>>(
        initialData?.images || []
    );
     const [documents, setDocuments] = useState<Array<{ url: string, name: string, type: 'registration' | 'insurance' | 'other', file?: File }>>(
        initialData?.documents || []
    );
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<Partial<Vehicle>>(
        initialData || {
            name: '',
            registrationNumber: '',
            type: 'van',
            config: 'rigid',
            fuelType: 'diesel',
            currentStatuses: ['ready'], status: 'active',
            capacity: { weight: undefined, volume: undefined, pallets: undefined },
            dimensions: { length: undefined, height: undefined, width: undefined },
            capabilities: { refrigeration: false, tailLift: false, adr: false, trailerCoupling: false, fifthWheel: false },
            documents: [],
        }
    );

    // Auto-adjust config based on type
    useEffect(() => {
        if (formData.type === 'trailer') {
            setFormData(prev => ({ ...prev, config: 'drawbar', fuelType: undefined }));
        } else if (formData.type === 'tractor') {
             setFormData(prev => ({ ...prev, config: 'tractor' }));
        } else if (formData.type === 'van' || formData.type === 'car') {
             setFormData(prev => ({ ...prev, config: 'rigid' }));
        }
    }, [formData.type]);
    
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

     const handleAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDocuments(prev => [...prev, { url: '', name: file.name, type: 'other', file }]);
        if (e.target) e.target.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const setMainImage = (index: number) => {
        setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === index })));
    };

    const handleAddCustomField = () => {
        const currentFields = formData.capabilities?.customFields || [];
        handleChange('capabilities', {
            ...formData.capabilities,
            customFields: [...currentFields, { name: '', value: '' }]
        });
    };

    const handleUpdateDocumentName = (index: number, newName: string) => {
        setDocuments(prev => {
            const next = [...prev];
            next[index] = { ...next[index], name: newName };
            return next;
        });
    };

    const handleUpdateCustomField = (index: number, field: 'name' | 'value', value: string) => {
        const currentFields = [...(formData.capabilities?.customFields || [])];
        currentFields[index] = { ...currentFields[index], [field]: value };
        handleChange('capabilities', {
            ...formData.capabilities,
            customFields: currentFields
        });
    };

    const handleRemoveCustomField = (index: number) => {
        const currentFields = (formData.capabilities?.customFields || []).filter((_, i) => i !== index);
        handleChange('capabilities', {
            ...formData.capabilities,
            customFields: currentFields
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsUploading(true);
        try {
            let currentVehicleId = initialData?.id;
            
            // Explicitly handle clearing capacity and dimensions
            const cleanedCapacity = {
                weight: typeof formData.capacity?.weight !== 'number' ? deleteField() : formData.capacity.weight,
                volume: typeof formData.capacity?.volume !== 'number' ? deleteField() : formData.capacity.volume,
                pallets: typeof formData.capacity?.pallets !== 'number' ? deleteField() : formData.capacity.pallets,
                notes: formData.capacity?.notes || deleteField()
            };

            const cleanedDimensions = {
                height: typeof formData.dimensions?.height !== 'number' ? deleteField() : formData.dimensions.height,
                width: typeof formData.dimensions?.width !== 'number' ? deleteField() : formData.dimensions.width,
                length: typeof formData.dimensions?.length !== 'number' ? deleteField() : formData.dimensions.length
            };

            let finalFormData = { 
                ...formData, 
                orgId,
                capacity: cleanedCapacity,
                dimensions: cleanedDimensions
            };

            // If creating a new vehicle, create it first to get an ID
            if (!currentVehicleId) {
                const newVehicle = await firebaseDB.createVehicle(finalFormData as any);
                currentVehicleId = newVehicle.id;
                finalFormData = { ...finalFormData, id: newVehicle.id };
            }

            const finalImages = [];
            for (const img of images) {
                if (img.file) {
                    const ext = img.file.name.split('.').pop() || 'jpg';
                    const path = `vehicles/${currentVehicleId}/${uuidv4()}.${ext}`;
                    const url = await firebaseStorage.uploadFile(path, img.file);
                    finalImages.push({ url, isMain: img.isMain });
                } else {
                    finalImages.push({ url: img.url, isMain: img.isMain });
                }
            }
            
            const finalDocuments = [];
            for (const doc of documents) {
                if (doc.file) {
                    const path = `vehicles/${currentVehicleId}/documents/${doc.file.name}`;
                    const url = await firebaseStorage.uploadFile(path, doc.file, {
                        customMetadata: {
                            originalName: doc.file.name,
                            docType: doc.type,
                        }
                    });
                    finalDocuments.push({ url, name: doc.file.name, type: doc.type });
                } else {
                    finalDocuments.push(doc);
                }
            }

            await onSubmit({ ...finalFormData, images: finalImages, documents: finalDocuments } as any);
        } catch (error) {
            console.error("Error submitting vehicle form:", error);
            throw error;
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

    const isTrailer = formData.type === 'trailer';
    const isTractor = formData.type === 'tractor';

    const safeNumberValue = (val: any) => {
        if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) {
            return '';
        }
        return val;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. CORE IDENTITY */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Basisinformasjon
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Intern-navn / Kallesignal *</Label>
                            <Input required placeholder="F.eks. Bil 402, Kranbil Nord" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Registreringsnummer *</Label>
                            <Input required placeholder="AB 12345" value={formData.registrationNumber || ''} onChange={e => handleChange('registrationNumber', e.target.value)} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Type Enhet</Label>
                            <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="van">Varebil</SelectItem>
                                    <SelectItem value="truck">Lastebil (Rigid)</SelectItem>
                                    <SelectItem value="tractor">Trekkvogn (Tractor)</SelectItem>
                                    <SelectItem value="trailer">Henger / Semi-henger</SelectItem>
                                    <SelectItem value="car">Liten bil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Konfigurasjon</Label>
                            <Select value={formData.config} onValueChange={(v) => handleChange('config', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rigid">Fast påbygg (Rigid)</SelectItem>
                                    <SelectItem value="box_swap">Løscontainer / Swap-body</SelectItem>
                                    <SelectItem value="fixed_box">Fast Skap</SelectItem>
                                    <SelectItem value="flatbed">Flakbil / Åpen</SelectItem>
                                    <SelectItem value="tractor">Kun trekkvogn</SelectItem>
                                    <SelectItem value="drawbar">Slepvogn (Drawbar)</SelectItem>
                                    <SelectItem value="semi">Semi-trailer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {!isTrailer && (
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Drivstoff</Label>
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
                        )}

                         <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Operasjonell Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Klar for rute</SelectItem>
                                    <SelectItem value="maintenance">Verksted / Service</SelectItem>
                                    <SelectItem value="inactive">Ikke i bruk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. PHYSICAL CONSTRAINTS */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5 text-primary" />
                        Tekniske Begrensninger
                    </CardTitle>
                    <CardDescription>Brukes av ruteplanleggeren for å unngå overlast og trange passasjer.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Maks Nyttelast (kg)</Label>
                            <Input type="number" value={safeNumberValue(formData.capacity?.weight)} onChange={e => handleNestedChange('capacity', 'weight', e.target.value ? Number(e.target.value) : undefined)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Maks Volum (m³)</Label>
                            <Input type="number" step="0.1" value={safeNumberValue(formData.capacity?.volume)} onChange={e => handleNestedChange('capacity', 'volume', e.target.value ? Number(e.target.value) : undefined)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Pallplasser</Label>
                            <Input type="number" value={safeNumberValue(formData.capacity?.pallets)} onChange={e => handleNestedChange('capacity', 'pallets', e.target.value ? Number(e.target.value) : undefined)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Utvendig Høyde (m)</Label>
                            <Input type="number" step="0.01" placeholder="F.eks. 3.45" value={safeNumberValue(formData.dimensions?.height)} onChange={e => handleNestedChange('dimensions', 'height', parseFloat(e.target.value) || undefined)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Bredde (m)</Label>
                            <Input type="number" step="0.01" placeholder="F.eks. 2.55" value={safeNumberValue(formData.dimensions?.width)} onChange={e => handleNestedChange('dimensions', 'width', parseFloat(e.target.value) || undefined)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Total Lengde (m)</Label>
                            <Input type="number" step="0.01" placeholder="F.eks. 18.75" value={safeNumberValue(formData.dimensions?.length)} onChange={e => handleNestedChange('dimensions', 'length', parseFloat(e.target.value) || undefined)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. CAPABILITIES */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        Egenskaper & Koblinger
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/30">
                            <Label className="flex-1 cursor-pointer font-bold text-slate-700" htmlFor="refrigeration">Kjøl/Frys (Thermo)</Label>
                            <Switch id="refrigeration" checked={formData.capabilities?.refrigeration} onCheckedChange={v => handleNestedChange('capabilities', 'refrigeration', v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/30">
                            <Label className="flex-1 cursor-pointer font-bold text-slate-700" htmlFor="adr">ADR (Farlig gods)</Label>
                            <Switch id="adr" checked={formData.capabilities?.adr} onCheckedChange={v => handleNestedChange('capabilities', 'adr', v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/30">
                            <Label className="flex-1 cursor-pointer font-bold text-slate-700" htmlFor="tailLift">Bakløfter (Lift)</Label>
                            <Switch id="tailLift" checked={formData.capabilities?.tailLift} onCheckedChange={v => handleNestedChange('capabilities', 'tailLift', v)} />
                        </div>

                        {!isTrailer && (
                            <>
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/30">
                                    <Label className="flex-1 cursor-pointer font-bold text-slate-700" htmlFor="trailer">Hengerfeste (VBG/Slep)</Label>
                                    <Switch id="trailer" checked={formData.capabilities?.trailerCoupling} onCheckedChange={v => handleNestedChange('capabilities', 'trailerCoupling', v)} />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/30">
                                    <Label className="flex-1 cursor-pointer font-bold text-slate-700" htmlFor="fifthWheel">Svingskive (Fifth Wheel)</Label>
                                    <Switch id="fifthWheel" checked={formData.capabilities?.fifthWheel} onCheckedChange={v => handleNestedChange('capabilities', 'fifthWheel', v)} />
                                </div>
                            </>
                        )}
                        
                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/30">
                            <Label className="flex-1 cursor-pointer font-bold text-slate-700" htmlFor="flatbed">Flak / Åpen plan</Label>
                            <Switch id="flatbed" checked={formData.capabilities?.flatbed} onCheckedChange={v => handleNestedChange('capabilities', 'flatbed', v)} />
                        </div>
                    </div>
                    
                    {/* Custom Fields Section */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-base font-bold text-slate-800">Spesialutstyr & Merknader</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField} className="h-8 font-bold border-dashed">
                                <Plus className="h-4 w-4 mr-1" /> Legg til egenskap
                            </Button>
                        </div>
                        
                        {formData.capabilities?.customFields && formData.capabilities.customFields.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {formData.capabilities.customFields.map((field, index) => (
                                    <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg border shadow-sm">
                                        <div className="flex-1 space-y-2">
                                            <Input placeholder="Navn (f.eks. Kran-rekkevidde)" 
                                                value={field.name} 
                                                onChange={(e) => handleUpdateCustomField(index, 'name', e.target.value)}
                                                className="h-8 text-xs font-bold uppercase tracking-wider"
                                            />
                                            <Input placeholder="Verdi (f.eks. 15m / 3 tonn)" 
                                                value={field.value} 
                                                onChange={(e) => handleUpdateCustomField(index, 'value', e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleRemoveCustomField(index)}
                                            className="text-slate-400 hover:text-destructive h-8 w-8"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-muted-foreground text-center py-6 bg-slate-50/50 rounded-xl border-2 border-dashed">
                                Ingen spesifikasjoner lagt til.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 4. VISUALS */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                 <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                    <CardTitle>Bilder</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className={cn(
                                "relative aspect-[4/3] rounded-lg overflow-hidden border-2",
                                img.isMain ? "border-primary" : "border-slate-100"
                            )}>
                                <Image src={img.preview || img.url} alt={`Bilde ${index + 1}`} fill className="object-cover" />
                                <div className="absolute top-1 right-1 flex gap-1">
                                    <Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={() => removeImage(index)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                    {!img.isMain && (
                                        <Button type="button" variant="secondary" size="icon" className="h-6 w-6" onClick={() => setMainImage(index)}>
                                            <Star className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {images.length < 8 && (
                            <div className="flex flex-col gap-2">
                                <input type="file" accept="image/*" multiple className="sr-only" ref={fileInputRef} onChange={handleAddImages} />
                                <Button type="button" variant="outline" className="aspect-[4/3] flex flex-col items-center justify-center gap-2 min-h-[120px]" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
                                  <UploadCloud className="h-6 w-6" />
                                  <span className="text-[10px] font-bold uppercase">Legg til bilde</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

             {/* 5. DOCUMENTATION */}
             <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
                    <CardTitle>Dokumentasjon</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="sr-only" ref={docFileInputRef} onChange={handleAddDocument} />
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/30">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <Input 
                                    value={doc.name} 
                                    onChange={(e) => handleUpdateDocumentName(index, e.target.value)} 
                                    className="h-8 text-sm font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0"
                                />
                            </div>
                            <div className="flex gap-2">
                                {doc.url && (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Button type="button" variant="outline" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                                    </a>
                                )}
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => removeDocument(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => docFileInputRef.current?.click()}>
                        <Plus className="mr-2 h-4 w-4" /> Legg til dokument (Vognkort, etc)
                    </Button>
                </CardContent>
            </Card>
            
            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="ghost" onClick={onCancel}>Avbryt</Button>
                <Button type="submit" disabled={isSubmitting || isUploading} size="lg" className="px-8 font-bold">
                    {(isSubmitting || isUploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {initialData ? 'Oppdater Enhet' : 'Registrer Enhet'}
                </Button>
            </div>
        </form>
    );
}
