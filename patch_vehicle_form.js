const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetCapacityContent = `                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </CardContent>`;

const newCapacityContent = `                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </CardContent>`;

content = content.replace(targetCapacityContent, newCapacityContent);

const targetCapabilitiesContent = `                            <Switch id="adr" checked={formData.capabilities?.adr} onCheckedChange={v => handleNestedChange('capabilities', 'adr', v)} />
                        </div>
                    </div>
                </CardContent>`;

const newCapabilitiesContent = `                            <Switch id="adr" checked={formData.capabilities?.adr} onCheckedChange={v => handleNestedChange('capabilities', 'adr', v)} />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
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

content = content.replace(targetCapabilitiesContent, newCapabilitiesContent);

// We need to import Textarea if it's not imported
if (!content.includes(`import { Textarea }`)) {
    content = content.replace(`import { Input } from '@/components/ui/input';`, `import { Input } from '@/components/ui/input';\nimport { Textarea } from '@/components/ui/textarea';`);
}

fs.writeFileSync(file, content);
