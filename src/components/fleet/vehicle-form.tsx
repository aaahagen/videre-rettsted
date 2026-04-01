'use client';

import { useState } from 'react';
import { Vehicle } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface VehicleFormProps {
    initialData?: Vehicle | null;
    onSubmit: (data: Partial<Vehicle>) => Promise<void>;
    onCancel: () => void;
}

export function VehicleForm({ initialData, onSubmit, onCancel }: VehicleFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
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

            <div className="flex justify-end gap-3 border-t pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>Avbryt</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Lagre Kjøretøy
                </Button>
            </div>
        </form>
    );
}
