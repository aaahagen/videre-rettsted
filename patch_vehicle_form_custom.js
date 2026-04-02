const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import Plus and Trash2 if not already imported
if (!content.includes('import { Plus')) {
    content = content.replace(`import { Edit2, Loader2, UploadCloud, X } from 'lucide-react';`, `import { Edit2, Loader2, UploadCloud, X, Plus, Trash2 } from 'lucide-react';`);
} else {
    // If it has Plus but no Trash2, add it.
    if (!content.includes('Trash2')) {
        content = content.replace(`Plus,`, `Plus, Trash2,`);
    }
}

// 2. Add handlers for custom fields
const targetHandlers = `    const handleNestedChange = (parent: keyof Vehicle, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...((prev[parent] as Record<string, any>) || {}),
                [field]: value
            }
        }));
    };`;

const newHandlers = `    const handleNestedChange = (parent: keyof Vehicle, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...((prev[parent] as Record<string, any>) || {}),
                [field]: value
            }
        }));
    };

    const handleAddCustomField = () => {
        const currentCustomFields = formData.capabilities?.customFields || [];
        handleNestedChange('capabilities', 'customFields', [...currentCustomFields, { name: '', value: '' }]);
    };

    const handleUpdateCustomField = (index: number, key: 'name' | 'value', val: string) => {
        const currentCustomFields = [...(formData.capabilities?.customFields || [])];
        currentCustomFields[index] = { ...currentCustomFields[index], [key]: val };
        handleNestedChange('capabilities', 'customFields', currentCustomFields);
    };

    const handleRemoveCustomField = (index: number) => {
        const currentCustomFields = [...(formData.capabilities?.customFields || [])];
        currentCustomFields.splice(index, 1);
        handleNestedChange('capabilities', 'customFields', currentCustomFields);
    };`;

content = content.replace(targetHandlers, newHandlers);

// 3. Update the UI to include the custom fields section in Egenskaper & Utstyr
const targetCapabilitiesUI = `                    <div className="mt-4 space-y-2">
                        <Label htmlFor="capabilitiesNotes">Utfyllende informasjon om utstyr</Label>
                        <Textarea 
                            id="capabilitiesNotes" 
                            placeholder="F.eks. Lastebøyler, stropper, jekketralle inkludert..." 
                            value={formData.capabilities?.notes || ''} 
                            onChange={e => handleNestedChange('capabilities', 'notes', e.target.value)} 
                            className="resize-none"
                        />
                    </div>
                </CardContent>`;

const newCapabilitiesUI = `                    
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
                </CardContent>`;

content = content.replace(targetCapabilitiesUI, newCapabilitiesUI);

fs.writeFileSync(file, content);
