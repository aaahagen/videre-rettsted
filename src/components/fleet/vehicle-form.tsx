'use client';

import { useState, useRef } from 'react';
import { Vehicle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Trash2, Loader2, FileText, Download, Plus } from 'lucide-react';
import Image from 'next/image';
import { firebaseStorage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface VehicleFormProps {
    initialData?: Vehicle | null;
    onSubmit: (data: Partial<Vehicle>) => Promise<void>;
    onCancel: () => void;
}

export function VehicleForm({ initialData, onSubmit, onCancel }: VehicleFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docFileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<Array<{ url: string, preview?: string, file?: File }>>(
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
            fuelType: 'diesel',
            status: 'active',
            capacity: { weight: undefined, volume: undefined, pallets: undefined },
            dimensions: { length: undefined, height: undefined, width: undefined },
            capabilities: { refrigeration: false, tailLift: false, adr: false, trailerCoupling: false },
            documents: [],
        }
    );
    
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
        
        // For now, default to 'other'. Could add a dropdown later.
        setDocuments(prev => [...prev, { url: '', name: file.name, type: 'other', file }]);
        if (e.target) e.target.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddCustomField = () => {
        const currentFields = formData.capabilities?.customFields || [];
        handleChange('capabilities', {
            ...formData.capabilities,
            customFields: [...currentFields, { name: '', value: '' }]
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
            const finalImages = [];
            for (const img of images) {
                if (img.file) {
                    const ext = img.file.name.split('.').pop() || 'jpg';
                    const vehicleIdFolder = initialData?.id || `temp_${uuidv4()}`;
                    const path = `vehicles/${vehicleIdFolder}/${uuidv4()}.${ext}`;
                    const url = await firebaseStorage.uploadFile(path, img.file);
                    finalImages.push({ url });
                } else {
                    finalImages.push({ url: img.url });
                }
            }
            
            const finalDocuments = [];
            for (const doc of documents) {
                if (doc.file) {
                    const vehicleIdFolder = initialData?.id || `temp_${uuidv4()}`;
                    const path = `vehicles/${vehicleIdFolder}/documents/${doc.file.name}`;
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

            await onSubmit({ ...formData, images: finalImages, documents: finalDocuments });
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
            
            <Card className="bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Generelt</CardTitle>
                    <CardDescription>Basisinformasjon for å identifisere kjøretøyet.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Internt Navn / ID *</Label>
                            <Input id="name" required placeholder="F.eks. Bil 1, Lastebil Nord" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg">Registreringsnummer *</Label>
                            <Input id="reg" required placeholder="AB 12345" value={formData.registrationNumber || ''} onChange={e => handleChange('registrationNumber', e.target.value)} />
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
                         <div className="space-y-2">
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
                </CardContent>
            </Card>

            <Card className="bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Fysiske Dimensjoner</CardTitle>
                    <CardDescription>Viktig informasjon for sjåføren angående broer, tunneler og trange veier.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="height">Høyde (meter)</Label>
                            <Input 
                                id="height" 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="F.eks. 3.2" 
                                value={formData.dimensions?.height || ''} 
                                onChange={e => handleChange('dimensions', { ...formData.dimensions, height: parseFloat(e.target.value) || undefined })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="width">Bredde (meter)</Label>
                            <Input 
                                id="width" 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="F.eks. 2.5" 
                                value={formData.dimensions?.width || ''} 
                                onChange={e => handleChange('dimensions', { ...formData.dimensions, width: parseFloat(e.target.value) || undefined })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="length">Lengde (meter)</Label>
                            <Input 
                                id="length" 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="F.eks. 12" 
                                value={formData.dimensions?.length || ''} 
                                onChange={e => handleChange('dimensions', { ...formData.dimensions, length: parseFloat(e.target.value) || undefined })} 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Kapasitet</CardTitle>
                    <CardDescription>Definer lasteevnen til kjøretøyet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="weight">Nyttelast (kg)</Label>
                            <Input id="weight" type="number" value={formData.capacity?.weight || ''} onChange={e => handleNestedChange('capacity', 'weight', e.target.value ? Number(e.target.value) : undefined)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="volume">Volum (m³)</Label>
                            <Input id="volume" type="number" step="0.1" value={formData.capacity?.volume || ''} onChange={e => handleNestedChange('capacity', 'volume', e.target.value ? Number(e.target.value) : undefined)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pallets">Antall Paller</Label>
                            <Input id="pallets" type="number" value={formData.capacity?.pallets || ''} onChange={e => handleNestedChange('capacity', 'pallets', e.target.value ? Number(e.target.value) : undefined)} />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <Label htmlFor="capacityNotes">Utfyllende informasjon om kapasitet</Label>
                        <Textarea 
                            id="capacityNotes" 
                            placeholder="Skriv inn eventuelle begrensninger eller merknader angående kapasitet..." 
                            value={formData.capacity?.notes || ''} 
                            onChange={e => handleNestedChange('capacity', 'notes', e.target.value)} 
                            className="resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Egenskaper & Utstyr</CardTitle>
                    <CardDescription>Spesifiser hvilket utstyr kjøretøyet har.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <Label htmlFor="tailLift" className="flex-1 cursor-pointer">Bakløfter (Lift)</Label>
                            <Switch id="tailLift" checked={formData.capabilities?.tailLift} onCheckedChange={v => handleNestedChange('capabilities', 'tailLift', v)} />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <Label htmlFor="refrigeration" className="flex-1 cursor-pointer">Kjøl/Frys</Label>
                            <Switch id="refrigeration" checked={formData.capabilities?.refrigeration} onCheckedChange={v => handleNestedChange('capabilities', 'refrigeration', v)} />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <Label htmlFor="trailer" className="flex-1 cursor-pointer">Hengerfeste</Label>
                            <Switch id="trailer" checked={formData.capabilities?.trailerCoupling} onCheckedChange={v => handleNestedChange('capabilities', 'trailerCoupling', v)} />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <Label htmlFor="adr" className="flex-1 cursor-pointer">ADR (Farlig gods)</Label>
                            <Switch id="adr" checked={formData.capabilities?.adr} onCheckedChange={v => handleNestedChange('capabilities', 'adr', v)} />
                        </div>
                    </div>
                    
                    {/* Custom Fields Section */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-base font-semibold">Egendefinerte Egenskaper</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddCustomField} className="h-8">
                                <Plus className="h-4 w-4 mr-1" /> Legg til egenskap
                            </Button>
                        </div>
                        
                        {formData.capabilities?.customFields && formData.capabilities.customFields.length > 0 ? (
                            <div className="space-y-3">
                                {formData.capabilities.customFields.map((field, index) => (
                                    <div key={index} className="flex items-start gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                                        <div className="flex-1 space-y-2">
                                            <Input 
                                                placeholder="Navn på egenskap (f.eks. Jekketralle)" 
                                                value={field.name} 
                                                onChange={(e) => handleUpdateCustomField(index, 'name', e.target.value)}
                                                className="h-8 text-sm bg-white"
                                            />
                                            <Input 
                                                placeholder="Verdi (f.eks. Ja, 2 stk, Manuell)" 
                                                value={field.value} 
                                                onChange={(e) => handleUpdateCustomField(index, 'value', e.target.value)}
                                                className="h-8 text-sm bg-white"
                                            />
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleRemoveCustomField(index)}
                                            className="text-slate-400 hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic text-center py-4 bg-slate-50 rounded-md border border-dashed border-slate-200">
                                Ingen egendefinerte egenskaper lagt til enda.
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                        <Label htmlFor="capabilitiesNotes">Utfyllende informasjon om utstyr</Label>
                        <Textarea 
                            id="capabilitiesNotes" 
                            placeholder="F.eks. Lastebøyler, stropper, jekketralle inkludert..." 
                            value={formData.capabilities?.notes || ''} 
                            onChange={e => handleNestedChange('capabilities', 'notes', e.target.value)} 
                            className="resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-50/50">
                 <CardHeader>
                    <CardTitle>Kjøretøybilder</CardTitle>
                    <CardDescription>Last opp bilder av kjøretøyet. Maks 8 bilder.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative group rounded-md overflow-hidden border bg-white">
                                <div className="relative aspect-square w-full">
                                    <Image src={img.preview || img.url} alt={`Bilde ${index + 1}`} fill className="object-cover" />
                                </div>
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        
                        {images.length < 8 && (
                            <div className="flex flex-col gap-2">
                                <input type="file" accept="image/*" multiple className="sr-only" ref={fileInputRef} onChange={handleAddImages} />
                                <Button type="button" variant="outline" className="h-full aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground bg-white" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
                                  <UploadCloud className="h-6 w-6" />
                                  <span className="text-xs">Last opp</span>
                                </Button>
                            </div>
                        )}
                    </div>
                     <div className="text-right text-sm text-muted-foreground mt-2">{images.length} / 8</div>
                </CardContent>
            </Card>

             <Card className="bg-slate-50/50">
                <CardHeader>
                    <CardTitle>Dokumenter</CardTitle>
                    <CardDescription>Last opp og administrer viktige dokumenter som vognkort og forsikringsbevis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="sr-only" ref={docFileInputRef} onChange={handleAddDocument} />
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-slate-500" />
                                <span className="font-medium text-sm truncate">{doc.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {doc.url && (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Button type="button" variant="outline" size="icon" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </a>
                                )}
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeDocument(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={() => docFileInputRef.current?.click()}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Last opp dokument
                    </Button>
                </CardContent>
            </Card>
            
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Avbryt</Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                    {(isSubmitting || isUploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {initialData ? 'Lagre Endringer' : 'Registrer Kjøretøy'}
                </Button>
            </div>
        </form>
    );
}
