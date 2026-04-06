const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/workforce/driver-profile-form.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state variables
const stateHook = "const [phone, setPhone] = useState(user.phone || '');";
const newState = `
    const [timeTrackingMethod, setTimeTrackingMethod] = useState<'fixed_location' | 'flexible_location'>(user.timeTrackingMethod || 'fixed_location');
    const [baseAddress, setBaseAddress] = useState(user.baseLocation?.address || '');
    const [baseLat, setBaseLat] = useState(user.baseLocation?.coordinates?.lat?.toString() || '');
    const [baseLng, setBaseLng] = useState(user.baseLocation?.coordinates?.lng?.toString() || '');
    const [baseRadius, setBaseRadius] = useState(user.baseLocation?.radius || 500);
`;
content = content.replace(stateHook, newState + '\n    ' + stateHook);

// 2. Replace the ENTIRE dataToSubmit object to avoid regex partial matches
const badSubmitObjRegex = /const dataToSubmit: Partial<DriverProfile> = \{[\s\S]*?\};/;
const newSubmitObj = `const dataToSubmit: Partial<DriverProfile> = {
                certifications,
                skills,
                scheduleOverrides,
                images: imageData,
                documents: uploadedDocuments,
                employmentType,
                role: employmentType === 'external' ? 'contractor' : 'driver',
                phone,
                address,
                emergencyContact,
                nextOfKin,
                children,
                adminNotes,
                seniorityDate,
                dateOfBirth,
                socialSecurityNumber,
                gender,
                employeeId,
                jobTitle,
                department,
                supervisor,
                employmentStatus,
                probationEndDate,
                bankAccountNumber,
                taxCode,
                staffHandbookAcknowledged,
                backgroundCheckDate,
                timeTrackingMethod,
                baseLocation: baseAddress ? {
                    address: baseAddress,
                    coordinates: { lat: parseFloat(baseLat) || 0, lng: parseFloat(baseLng) || 0 },
                    radius: baseRadius
                } : deleteField() as any,
            };

            if (hourlyRate) {
                dataToSubmit.hourlyRate = Number(hourlyRate);
            } else {
                dataToSubmit.hourlyRate = deleteField() as any;
            }

            if (employmentType === 'external') {
                dataToSubmit.agencyInfo = {
                    name: agencyName,
                    contactPerson: agencyContact,
                    phone: agencyPhone,
                    email: agencyEmail,
                };
            } else {
                dataToSubmit.agencyInfo = deleteField() as any;
            }

            if (useRotation) {
                dataToSubmit.rotation = {
                    startDate: rotationStartDateStr,
                    weeks: rotationWeeks,
                };
                dataToSubmit.workingHours = deleteField() as any;
            } else {
                dataToSubmit.workingHours = {
                    start: workingHoursStart,
                    end: workingHoursEnd,
                };
                dataToSubmit.rotation = deleteField() as any;
            }`;

content = content.replace(badSubmitObjRegex, newSubmitObj);

// 3. Add UI Card
const uiHook = '                    <Card className="bg-slate-50/50">\n                        <CardHeader>\n                            <CardTitle>Arbeidskontrakter</CardTitle>';

const geofenceUI = `
                    <Card className="bg-slate-50/50">
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
                                        <div><p className="font-bold text-sm">Fast Oppmøte</p><p className="text-xs text-slate-500">Må være innenfor geofence for å stemple.</p></div>
                                    </label>
                                    <label className={\`flex items-start p-3 rounded-lg border cursor-pointer transition-all \${timeTrackingMethod === 'flexible_location' ? 'bg-white border-primary shadow-sm' : 'bg-slate-100/50 hover:bg-slate-100'}\`}>
                                        <input type="radio" name="trackingMethod" className="mt-1 mr-3" checked={timeTrackingMethod === 'flexible_location'} onChange={() => setTimeTrackingMethod('flexible_location')} />
                                        <div><p className="font-bold text-sm">Fleksibel</p><p className="text-xs text-slate-500">Kan stemple fra hvor som helst (GPS logges).</p></div>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between"><Label className="text-sm font-bold">Alternativt Depot</Label><Badge variant="outline" className="text-[10px]">Valgfritt</Badge></div>
                                <div className="grid gap-4">
                                    <div className="space-y-2"><Label htmlFor="baseAddress" className="text-xs">Adresse</Label><Input id="baseAddress" value={baseAddress} onChange={e => setBaseAddress(e.target.value)} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label htmlFor="baseLat" className="text-xs">Lat</Label><Input id="baseLat" value={baseLat} onChange={e => setBaseLat(e.target.value)} /></div>
                                        <div className="space-y-2"><Label htmlFor="baseLng" className="text-xs">Lng</Label><Input id="baseLng" value={baseLng} onChange={e => setBaseLng(e.target.value)} /></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between"><Label htmlFor="baseRadius" className="text-xs">Radius: {baseRadius}m</Label></div>
                                        <input type="range" min="100" max="2000" step="50" value={baseRadius} onChange={e => setBaseRadius(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
`;
content = content.replace(uiHook, geofenceUI + '\n' + uiHook);

fs.writeFileSync(filePath, content);
console.log('Fixed syntax safely via direct block replacement');
