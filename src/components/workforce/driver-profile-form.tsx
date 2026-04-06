'use client';

import { useState, useRef } from 'react';
import { DriverProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, X, UploadCloud, Trash2, FileText, Download, User as UserIcon, Briefcase, Phone, MapPin, Hash, Building2, UserCircle2, CalendarClock, Banknote, AlertCircle, Heart, StickyNote, Baby, ShieldCheck, BookOpenCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { firebaseStorage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { deleteField } from 'firebase/firestore';

interface DriverProfileFormProps {
    user: DriverProfile;
    onSubmit: (data: Partial<DriverProfile>) => Promise<void>;
    onCancel: () => void;
}

export function DriverProfileForm({ user, onSubmit, onCancel }: DriverProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    
    const [image, setImage] = useState< { url: string, preview?: string, file?: File } | null>(
        (user.images && user.images[0]) || null
    );

    const [documents, setDocuments] = useState<Array<{ url: string; name: string; type: string; file?: File }>>(
        user.documents || []
    );

    const [useRotation, setUseRotation] = useState<boolean>(!!user.rotation);
    const [rotationStartDateStr, setRotationStartDateStr] = useState<string>(
        user.rotation?.startDate || format(new Date(), 'yyyy-MM-dd')
    );
    
    const defaultWeek = () => ({
        days: {
            monday: { isWorking: true, start: '08:00', end: '16:00' },
            tuesday: { isWorking: true, start: '08:00', end: '16:00' },
            wednesday: { isWorking: true, start: '08:00', end: '16:00' },
            thursday: { isWorking: true, start: '08:00', end: '16:00' },
            friday: { isWorking: true, start: '08:00', end: '16:00' },
            saturday: { isWorking: false },
            sunday: { isWorking: false }
        }
    });

    const [rotationWeeks, setRotationWeeks] = useState<any[]>(
        user.rotation?.weeks || [defaultWeek()]
    );

    const [scheduleOverrides, setScheduleOverrides] = useState<DriverProfile['scheduleOverrides']>(user.scheduleOverrides || {});
    const [overrideStartDateStr, setOverrideStartDateStr] = useState<string>('');
    const [overrideEndDateStr, setOverrideEndDateStr] = useState<string>('');
    const [isPeriod, setIsPeriod] = useState(false);
    const [overrideType, setOverrideType] = useState<'off' | 'vacation' | 'sick' | 'custom'>('off');
    const [overrideStart, setOverrideStart] = useState('08:00');
    const [overrideEnd, setOverrideEnd] = useState('16:00');

    const [workingHoursStart, setWorkingHoursStart] = useState(user.workingHours?.start || '08:00');
    const [workingHoursEnd, setWorkingHoursEnd] = useState(user.workingHours?.end || '16:00');
    const [certifications, setCertifications] = useState<string[]>(user.certifications || []);
    const [skills, setSkills] = useState<string[]>(user.skills || []);
    const [newCert, setNewCert] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [employmentType, setEmploymentType] = useState<'internal' | 'external'>(user?.employmentType || 'internal');
    
    // Geofencing state
    const [timeTrackingMethod, setTimeTrackingMethod] = useState<'fixed_location' | 'flexible_location'>(user.timeTrackingMethod || 'fixed_location');
    const [baseAddress, setBaseAddress] = useState(user.baseLocation?.address || '');
    const [baseLat, setBaseLat] = useState(user.baseLocation?.coordinates?.lat?.toString() || '');
    const [baseLng, setBaseLng] = useState(user.baseLocation?.coordinates?.lng?.toString() || '');
    const [baseRadius, setBaseRadius] = useState(user.baseLocation?.radius || 500);

    // HR fields
    const [phone, setPhone] = useState(user.phone || '');
    const [address, setAddress] = useState(user.address || '');
    const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');
    const [nextOfKin, setNextOfKin] = useState(user.nextOfKin || '');
    const [children, setChildren] = useState(user.children || '');
    const [adminNotes, setAdminNotes] = useState(user.adminNotes || '');
    const [seniorityDate, setSeniorityDate] = useState(user.seniorityDate || '');
    const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '');
    const [socialSecurityNumber, setSocialSecurityNumber] = useState(user.socialSecurityNumber || '');
    const [gender, setGender] = useState(user.gender || '');
    const [employeeId, setEmployeeId] = useState(user.employeeId || '');
    const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
    const [department, setDepartment] = useState(user.department || '');
    const [supervisor, setSupervisor] = useState(user.supervisor || '');
    const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus || '');
    const [probationEndDate, setProbationEndDate] = useState(user.probationEndDate || '');
    const [hourlyRate, setHourlyRate] = useState(user.hourlyRate || '');
    const [bankAccountNumber, setBankAccountNumber] = useState(user.bankAccountNumber || '');
    const [taxCode, setTaxCode] = useState(user.taxCode || '');
    const [staffHandbookAcknowledged, setStaffHandbookAcknowledged] = useState(user.staffHandbookAcknowledged || false);
    const [backgroundCheckDate, setBackgroundCheckDate] = useState(user.backgroundCheckDate || '');
    const [agencyName, setAgencyName] = useState(user?.agencyInfo?.name || '');
    const [agencyContact, setAgencyContact] = useState(user?.agencyInfo?.contactPerson || '');
    const [agencyPhone, setAgencyPhone] = useState(user?.agencyInfo?.phone || '');
    const [agencyEmail, setAgencyEmail] = useState(user?.agencyInfo?.email || '');
    const [contracts, setContracts] = useState<DriverProfile['contracts']>(user.contracts || []);
    const [newContractStart, setNewContractStart] = useState('');
    const [newContractEnd, setNewContractEnd] = useState('');
    const [newContractHours, setNewContractHours] = useState('');
    const [newContractRole, setNewContractRole] = useState('Sjåfør');

    const updateRotationDay = (weekIndex: number, day: string, field: string, value: any) => {
        const newWeeks = [...rotationWeeks];
        newWeeks[weekIndex] = {
            ...newWeeks[weekIndex],
            days: {
                ...newWeeks[weekIndex].days,
                [day]: {
                    ...newWeeks[weekIndex].days[day],
                    [field]: value
                }
            }
        };
        setRotationWeeks(newWeeks);
    };

    const addRotationWeek = () => setRotationWeeks([...rotationWeeks, defaultWeek()]);
    const removeRotationWeek = (index: number) => setRotationWeeks(rotationWeeks.filter((_, i) => i !== index));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
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
                            setImage({ url: '', preview, file: resizedFile });
                        }
                    }, 'image/jpeg', 0.8);
                }
            };
            if (event.target?.result) img.src = event.target.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleAddDocuments = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const newDocs = files.map(file => ({ url: '', name: file.name, type: file.type, file: file }));
        setDocuments(prev => [...prev, ...newDocs]);
    };

    const removeDocument = (index: number) => setDocuments(prev => prev.filter((_, i) => i !== index));

    const addOverride = () => {
        if (!overrideStartDateStr) return;
        const newOverrides = { ...scheduleOverrides };
        const overrideData = { type: overrideType, ...(overrideType === 'custom' ? { start: overrideStart, end: overrideEnd } : {}) };
        if (isPeriod && overrideEndDateStr) {
             let currentDate = new Date(overrideStartDateStr);
             const endDate = new Date(overrideEndDateStr);
             while (currentDate <= endDate) {
                 newOverrides[format(currentDate, 'yyyy-MM-dd')] = overrideData;
                 currentDate = addDays(currentDate, 1);
             }
        } else {
             newOverrides[overrideStartDateStr] = overrideData;
        }
        setScheduleOverrides(newOverrides);
        setOverrideStartDateStr(''); setOverrideEndDateStr(''); setIsPeriod(false);
    };

    const removeOverride = (dateStr: string) => {
        const updated = { ...scheduleOverrides };
        delete updated[dateStr];
        setScheduleOverrides(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsUploading(true);
        try {
            let imageData = image?.file ? [{ url: await firebaseStorage.uploadFile(`users/${user.id}/profile/${uuidv4()}`, image.file) }] : (image ? [{ url: image.url }] : []);
            let uploadedDocuments = [];
            for (const doc of documents) {
                if (doc.file) {
                    const url = await firebaseStorage.uploadFile(`users/${user.id}/documents/${uuidv4()}_${doc.name}`, doc.file);
                    uploadedDocuments.push({ url, name: doc.name, type: doc.type, uploadedAt: new Date() });
                } else uploadedDocuments.push({ url: doc.url, name: doc.name, type: doc.type });
            }

            const dataToSubmit: Partial<DriverProfile> = {
                certifications, skills, scheduleOverrides, images: imageData, documents: uploadedDocuments,
                employmentType, timeTrackingMethod,
                role: employmentType === 'external' ? 'contractor' : 'driver',
                phone, address, emergencyContact, nextOfKin, children, adminNotes, seniorityDate,
                dateOfBirth, socialSecurityNumber, gender, employeeId, jobTitle, department, supervisor,
                employmentStatus, probationEndDate, hourlyRate: Number(hourlyRate) || deleteField() as any,
                bankAccountNumber, taxCode, staffHandbookAcknowledged, backgroundCheckDate,
                baseLocation: baseAddress ? {
                    address: baseAddress,
                    coordinates: { lat: parseFloat(baseLat) || 0, lng: parseFloat(baseLng) || 0 },
                    radius: baseRadius
                } : deleteField() as any,
                agencyInfo: employmentType === 'external' ? { name: agencyName, contactPerson: agencyContact, phone: agencyPhone, email: agencyEmail } : deleteField() as any,
                rotation: useRotation ? { startDate: rotationStartDateStr, weeks: rotationWeeks } : deleteField() as any,
                workingHours: useRotation ? deleteField() as any : { start: workingHoursStart, end: workingHoursEnd }
            };
            await onSubmit(dataToSubmit);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start gap-6">
                {/* LEFT COLUMN */}
                <div className="w-full lg:w-1/3 space-y-6 lg:sticky top-0">
                    <Card className="bg-slate-50/50">
                        <CardHeader className="flex-row items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={image?.preview || image?.url} alt={user.name} />
                                <AvatarFallback><UserIcon /></AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{user.name}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <input type="file" accept="image/*" className="sr-only" ref={fileInputRef} onChange={handleImageChange} />
                             <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}><UploadCloud className="mr-2 h-4 w-4" /> Endre bilde</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50/50">
                        <CardHeader><CardTitle>Dokumenter</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                             <input type="file" multiple className="sr-only" ref={documentInputRef} onChange={handleAddDocuments} />
                             {documents.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-2 border rounded-md bg-white">
                                    <div className="flex items-center gap-2 overflow-hidden"><FileText className="h-5 w-5 text-slate-500" /><span className="text-sm truncate">{doc.name}</span></div>
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeDocument(i)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" className="w-full border-dashed mt-2" onClick={() => documentInputRef.current?.click()}><UploadCloud className="mr-2 h-4 w-4" /> Last opp</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div className="w-full lg:w-2/3 space-y-6">
                    <Card className="bg-slate-50/50">
                        <CardHeader>
                            <CardTitle>Personalinformasjon</CardTitle>
                            <CardDescription>Grunnleggende informasjon for de ansatte.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Telefonnummer</Label>
                                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Tlf nr" type="tel" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Adresse</Label>
                                    <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Full adresse" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nødkontakt / Pårørende</Label>
                                    <Input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Navn og tlf" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ansatt siden</Label>
                                    <Input type="date" value={seniorityDate} onChange={e => setSeniorityDate(e.target.value)} />
                                </div>
                            </div>
                        
                                <div className="space-y-2 mt-4">
                                    <Label>Fødselsdato</Label>
                                    <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Personnummer / D-nummer</Label>
                                    <Input value={socialSecurityNumber} onChange={e => setSocialSecurityNumber(e.target.value)} placeholder="11 siffer" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kjønn</Label>
                                    <Select value={gender} onValueChange={setGender}>
                                        <SelectTrigger><SelectValue placeholder="Velg kjønn" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Mann</SelectItem>
                                            <SelectItem value="female">Kvinne</SelectItem>
                                            <SelectItem value="other">Annet</SelectItem>
                                            <SelectItem value="prefer_not_to_say">Ønsker ikke å oppgi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ansattnummer</Label>
                                    <Input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="F.eks. 1001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stillingstittel</Label>
                                    <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Sjåfør" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Avdeling</Label>
                                    <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Transport" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nærmeste leder</Label>
                                    <Input value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="Navn på leder" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stillingsprosent / Status</Label>
                                    <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                                        <SelectTrigger><SelectValue placeholder="Velg status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full-time">Heltid (100%)</SelectItem>
                                            <SelectItem value="part-time">Deltid</SelectItem>
                                            <SelectItem value="temporary">Midlertidig</SelectItem>
                                            <SelectItem value="on-call">Tilkalling / Ringevikar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Prøvetid utløper</Label>
                                    <Input type="date" value={probationEndDate} onChange={e => setProbationEndDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Timelønn / Lønn</Label>
                                    <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="NOK" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bankkontonummer</Label>
                                    <Input value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="11 siffer" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Skattekort / Tabell</Label>
                                    <Input value={taxCode} onChange={e => setTaxCode(e.target.value)} placeholder="F.eks. 7100" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dato for bakgrunnssjekk</Label>
                                    <Input type="date" value={backgroundCheckDate} onChange={e => setBackgroundCheckDate(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-1 sm:col-span-2 flex items-center gap-2 pt-2 border-t mt-2">
                                    <Switch checked={staffHandbookAcknowledged} onCheckedChange={setStaffHandbookAcknowledged} id="handbook" />
                                    <Label htmlFor="handbook">Har lest og akseptert personalhåndboken</Label>
                                </div>
                            <div className="space-y-2 mt-4 pt-4 border-t">
                                <Label>Admin Notat (Kun synlig for ledere)</Label>
                                <textarea 
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={adminNotes} 
                                    onChange={e => setAdminNotes(e.target.value)} 
                                    placeholder="Interne notater..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50/50">
                        <CardHeader><CardTitle>Tidsregistrering & Geofencing</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className={`p-3 rounded-lg border cursor-pointer ${timeTrackingMethod === 'fixed_location' ? 'bg-white border-primary' : 'bg-slate-100'}`}>
                                    <input type="radio" checked={timeTrackingMethod === 'fixed_location'} onChange={() => setTimeTrackingMethod('fixed_location')} className="mr-2" />
                                    <span className="font-bold text-sm">Fast Oppmøte</span>
                                </label>
                                <label className={`p-3 rounded-lg border cursor-pointer ${timeTrackingMethod === 'flexible_location' ? 'bg-white border-primary' : 'bg-slate-100'}`}>
                                    <input type="radio" checked={timeTrackingMethod === 'flexible_location'} onChange={() => setTimeTrackingMethod('flexible_location')} className="mr-2" />
                                    <span className="font-bold text-sm">Fleksibel</span>
                                </label>
                            </div>
                            <div className="space-y-4 border-t pt-4">
                                <Label>Alternativt Depot (Valgfritt)</Label>
                                <Input value={baseAddress} onChange={e => setBaseAddress(e.target.value)} placeholder="Adresse" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input value={baseLat} onChange={e => setBaseLat(e.target.value)} placeholder="Lat" />
                                    <Input value={baseLng} onChange={e => setBaseLng(e.target.value)} placeholder="Lng" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50/50">
                        <CardHeader><CardTitle>Avvik & Ferie</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-4"><Switch checked={isPeriod} onCheckedChange={setIsPeriod} /> <Label>Periode?</Label></div>
                            <div className="flex gap-2">
                                <Input type="date" value={overrideStartDateStr} onChange={e => setOverrideStartDateStr(e.target.value)} />
                                {isPeriod && <Input type="date" value={overrideEndDateStr} onChange={e => setOverrideEndDateStr(e.target.value)} />}
                                <Button type="button" onClick={addOverride}>Legg til</Button>
                            </div>
                            <div className="mt-4 space-y-2">
                                {Object.entries(scheduleOverrides || {}).map(([date, details]) => (
                                    <div key={date} className="flex justify-between items-center p-2 bg-white border rounded">
                                        <span className="text-sm font-medium">{date}: {details.type}</span>
                                        <Button variant="ghost" size="sm" onClick={() => removeOverride(date)}><X className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* FULL WIDTH BOTTOM CARD */}
            <Card className="bg-slate-50/50">
                <CardHeader className="flex-row justify-between items-center">
                    <div><CardTitle>Arbeidstid</CardTitle><CardDescription>Turnus eller fast tid</CardDescription></div>
                    <div className="flex items-center gap-2"><Label>Bruk turnus?</Label><Switch checked={useRotation} onCheckedChange={setUseRotation} /></div>
                </CardHeader>
                <CardContent>
                    {useRotation ? (
                        <div className="space-y-4">
                            {rotationWeeks.map((week, wIdx) => (
                                <div key={wIdx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                        <div key={day} className="p-2 border rounded bg-white">
                                            <div className="flex justify-between mb-1"><Label className="text-[10px] uppercase font-bold">{day.slice(0,3)}</Label><Switch checked={week.days[day].isWorking} onCheckedChange={v => updateRotationDay(wIdx, day, 'isWorking', v)} className="scale-75" /></div>
                                            {week.days[day].isWorking && <div className="space-y-1"><Input type="time" value={week.days[day].start} onChange={e => updateRotationDay(wIdx, day, 'start', e.target.value)} className="h-8 text-xs" /><Input type="time" value={week.days[day].end} onChange={e => updateRotationDay(wIdx, day, 'end', e.target.value)} className="h-8 text-xs" /></div>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addRotationWeek} className="w-full">Legg til uke</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4"><Input type="time" value={workingHoursStart} onChange={e => setWorkingHoursStart(e.target.value)} /><Input type="time" value={workingHoursEnd} onChange={e => setWorkingHoursEnd(e.target.value)} /></div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 border-t pt-6">
                <Button type="button" variant="ghost" onClick={onCancel}>Avbryt</Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>{(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Lagre Profil</Button>
            </div>
        </form>
    );
}
