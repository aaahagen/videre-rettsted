const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variables near other state definitions
const hookStart = "const [employmentType, setEmploymentType] = useState<'internal' | 'external'>(user?.employmentType || 'internal');";
const geofenceState = `
    const [timeTrackingMethod, setTimeTrackingMethod] = useState<'fixed_location' | 'flexible_location'>(user.timeTrackingMethod || 'fixed_location');
    const [baseAddress, setBaseAddress] = useState(user.baseLocation?.address || '');
    const [baseLat, setBaseLat] = useState(user.baseLocation?.coordinates?.lat?.toString() || '');
    const [baseLng, setBaseLng] = useState(user.baseLocation?.coordinates?.lng?.toString() || '');
    const [baseRadius, setBaseRadius] = useState(user.baseLocation?.radius || 500);`;

content = content.replace(hookStart, hookStart + '\n' + geofenceState);

// 2. Add to submission payload
const submitTarget = "employmentType,";
const geofencePayload = `employmentType,
                timeTrackingMethod,
                baseLocation: baseAddress ? {
                    address: baseAddress,
                    coordinates: { lat: parseFloat(baseLat) || 0, lng: parseFloat(baseLng) || 0 },
                    radius: baseRadius
                } : deleteField() as any,`;

content = content.replace(submitTarget, geofencePayload);

// 3. Add UI Block
const uiTarget = '<Card className="bg-slate-50/50">\n                        <CardHeader>\n                            <CardTitle>Avvik & Ferie</CardTitle>';
const geofenceUI = `<Card className="bg-slate-50/50">
                        <CardHeader>
                            <CardTitle>Tidsregistrering & Geofencing</CardTitle>
                            <CardDescription>Bestem hvordan denne sjåføren skal stemple inn og ut.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Stemplingsmetode</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className={\`flex items-start p-3 rounded-lg border cursor-pointer transition-all \${timeTrackingMethod === 'fixed_location' ? 'bg-white border-primary shadow-sm' : 'bg-slate-100/50 hover:bg-slate-100'}\`}>
                                        <input type="radio" name="trackingMethod" className="mt-1 mr-3" checked={timeTrackingMethod === 'fixed_location'} onChange={() => setTimeTrackingMethod('fixed_location')} />
                                        <div><p className="font-bold text-sm">Fast Oppmøte</p><p className="text-xs text-slate-500">Må være innenfor geofence for å stemple. Best for depot-baserte ruter.</p></div>
                                    </label>
                                    <label className={\`flex items-start p-3 rounded-lg border cursor-pointer transition-all \${timeTrackingMethod === 'flexible_location' ? 'bg-white border-primary shadow-sm' : 'bg-slate-100/50 hover:bg-slate-100'}\`}>
                                        <input type="radio" name="trackingMethod" className="mt-1 mr-3" checked={timeTrackingMethod === 'flexible_location'} onChange={() => setTimeTrackingMethod('flexible_location')} />
                                        <div><p className="font-bold text-sm">Fleksibel / Langtransport</p><p className="text-xs text-slate-500">Kan stemple fra hvor som helst. Posisjon lagres for verifisering.</p></div>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between"><Label className="text-sm font-bold">Alternativt Depot / Hjemmeadresse</Label><Badge variant="outline" className="text-[10px]">Valgfritt</Badge></div>
                                <p className="text-xs text-slate-500">Dersom denne sjåføren starter fra en annen lokasjon enn hoveddepotet, legg inn detaljene her.</p>
                                <div className="grid gap-4">
                                    <div className="space-y-2"><Label htmlFor="baseAddress" className="text-xs">Adresse</Label><Input id="baseAddress" value={baseAddress} onChange={e => setBaseAddress(e.target.value)} placeholder="F.eks. Hjemmeadresse" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label htmlFor="baseLat" className="text-xs">Lat</Label><Input id="baseLat" value={baseLat} onChange={e => setBaseLat(e.target.value)} placeholder="59.9" /></div>
                                        <div className="space-y-2"><Label htmlFor="baseLng" className="text-xs">Lng</Label><Input id="baseLng" value={baseLng} onChange={e => setBaseLng(e.target.value)} placeholder="10.7" /></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between"><Label htmlFor="baseRadius" className="text-xs">Radius: {baseRadius}m</Label></div>
                                        <input type="range" min="100" max="2000" step="50" value={baseRadius} onChange={e => setBaseRadius(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>\n\n                    `;

content = content.replace(uiTarget, geofenceUI + uiTarget);

fs.writeFileSync(filePath, content);
console.log('Fixed driver-profile-form.tsx safely');
