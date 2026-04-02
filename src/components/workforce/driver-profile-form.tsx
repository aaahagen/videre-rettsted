'use client';

import { useState, useRef } from 'react';
import { DriverProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, X, UploadCloud, Trash2, FileText, Download, User as UserIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { firebaseStorage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        processFile(file, (preview, resizedFile) => {
            setImage({ url: '', preview, file: resizedFile });
        });
        
        if (e.target) e.target.value = '';
    };

    const removeImage = () => {
        setImage(null);
    };

    const handleAddDocuments = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newDocs = files.map(file => ({
            url: '',
            name: file.name,
            type: file.type,
            file: file
        }));

        setDocuments(prev => [...prev, ...newDocs]);
        
        if (e.target) e.target.value = '';
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

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

    const addRotationWeek = () => {
        setRotationWeeks([...rotationWeeks, defaultWeek()]);
    };

    const removeRotationWeek = (index: number) => {
        setRotationWeeks(rotationWeeks.filter((_, i) => i !== index));
    };

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

    const [scheduleOverrides, setScheduleOverrides] = useState<DriverProfile['scheduleOverrides']>(user.scheduleOverrides || {});
    
    const [overrideStartDateStr, setOverrideStartDateStr] = useState<string>('');
    const [overrideEndDateStr, setOverrideEndDateStr] = useState<string>('');
    const [isPeriod, setIsPeriod] = useState(false);

    const [overrideType, setOverrideType] = useState<'off' | 'vacation' | 'sick' | 'custom'>('off');
    const [overrideStart, setOverrideStart] = useState('08:00');
    const [overrideEnd, setOverrideEnd] = useState('16:00');

    const addOverride = () => {
        if (!overrideStartDateStr) return;

        const newOverrides = { ...scheduleOverrides };
        const overrideData = {
            type: overrideType,
            ...(overrideType === 'custom' ? { start: overrideStart, end: overrideEnd } : {})
        };

        if (isPeriod && overrideEndDateStr) {
             const startParts = overrideStartDateStr.split('-');
             const endParts = overrideEndDateStr.split('-');
             const startDate = new Date(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));
             const endDate = new Date(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));

             let currentDate = startDate;
             while (currentDate <= endDate) {
                 const dateStr = format(currentDate, 'yyyy-MM-dd');
                 newOverrides[dateStr] = overrideData;
                 currentDate = addDays(currentDate, 1);
             }
        } else {
             newOverrides[overrideStartDateStr] = overrideData;
        }

        setScheduleOverrides(newOverrides);
        setOverrideStartDateStr('');
        setOverrideEndDateStr('');
        setIsPeriod(false);
    };

    const removeOverride = (dateStr: string) => {
        setScheduleOverrides(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            delete updated[dateStr];
            return updated;
        });
    };

    const [workingHoursStart, setWorkingHoursStart] = useState(user.workingHours?.start || '08:00');
    const [workingHoursEnd, setWorkingHoursEnd] = useState(user.workingHours?.end || '16:00');
    const [certifications, setCertifications] = useState<string[]>(user.certifications || []);
    const [skills, setSkills] = useState<string[]>(user.skills || []);
    const [newCert, setNewCert] = useState('');
    const [newSkill, setNewSkill] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsUploading(true);

        try {
            let imageData: { url: string; }[] = [];
            
            if (image && image.file) {
                const uniqueId = uuidv4();
                const path = `users/${user.id}/profile/${uniqueId}`;
                const url = await firebaseStorage.uploadFile(path, image.file);
                imageData = [{ url }];
            } else if (image) {
                imageData = [{ url: image.url }];
            }

            let uploadedDocuments: { url: string; name: string; type: string; uploadedAt?: any }[] = [];
            
            for (const doc of documents) {
                if (doc.file) {
                    const uniqueId = uuidv4();
                    const safeName = doc.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                    const path = `users/${user.id}/documents/${uniqueId}_${safeName}`;
                    const url = await firebaseStorage.uploadFile(path, doc.file);
                    uploadedDocuments.push({
                        url,
                        name: doc.name,
                        type: doc.type,
                        uploadedAt: new Date()
                    });
                } else {
                    uploadedDocuments.push({
                        url: doc.url,
                        name: doc.name,
                        type: doc.type
                    });
                }
            }


            const dataToSubmit: any = {
                certifications,
                skills,
                scheduleOverrides,
                images: imageData,
                documents: uploadedDocuments,
            };

            if (useRotation) {
                dataToSubmit.rotation = {
                    startDate: rotationStartDateStr,
                    weeks: rotationWeeks,
                };
                dataToSubmit.workingHours = deleteField();
            } else {
                dataToSubmit.workingHours = {
                    start: workingHoursStart,
                    end: workingHoursEnd,
                };
                dataToSubmit.rotation = deleteField();
            }

            await onSubmit(dataToSubmit);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };


    const addCert = () => {
        if (newCert.trim() && !certifications.includes(newCert.trim())) {
            setCertifications([...certifications, newCert.trim()]);
            setNewCert('');
        }
    };

    const removeCert = (cert: string) => {
        setCertifications(certifications.filter(c => c !== cert));
    };

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start gap-6">
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
                             <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Endre bilde
                            </Button>
                        </CardContent>
                    </Card>

                     <Card className="bg-slate-50/50">
                        <CardHeader>
                            <CardTitle>Dokumenter</CardTitle>
                            <CardDescription>Last opp kursbevis, attester o.l.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <input type="file" multiple className="sr-only" ref={documentInputRef} onChange={handleAddDocuments} />
                             {documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-2 pr-1 border rounded-md bg-white">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-5 w-5 text-slate-500 shrink-0" />
                                        <span className="font-medium text-sm truncate" title={doc.name}>{doc.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        {doc.url && (
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </a>
                                        )}
                                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeDocument(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" className="w-full border-dashed mt-2" onClick={() => documentInputRef.current?.click()}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Last opp
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="w-full lg:w-2/3 space-y-6">
                    <Card className="bg-slate-50/50">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>Arbeidstid</CardTitle>
                                    <CardDescription>Definer standard arbeidstid eller en rullerende turnusplan.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 pt-1">
                                    <Label htmlFor="useRotation" className="text-sm font-normal text-muted-foreground">Bruk turnus?</Label>
                                    <Switch id="useRotation" checked={useRotation} onCheckedChange={setUseRotation} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!useRotation ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start">Standard starttid</Label>
                                        <Input id="start" type="time" required value={workingHoursStart} onChange={(e) => setWorkingHoursStart(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end">Standard sluttid</Label>
                                        <Input id="end" type="time" required value={workingHoursEnd} onChange={(e) => setWorkingHoursEnd(e.target.value)} />
                                    </div>
                                </div>
                            ) : (
                               <div className="space-y-6">
                                    <div className="space-y-2 w-full sm:max-w-[200px]">
                                        <Label>Startdato for turnus</Label>
                                        <Input 
                                            type="date" 
                                            value={rotationStartDateStr} 
                                            onChange={(e) => setRotationStartDateStr(e.target.value)}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">Denne datoen markerer uke 1 i rotasjonen.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {rotationWeeks.map((week, weekIndex) => (
                                            <div key={weekIndex} className="bg-white border rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                                    <h4 className="font-semibold text-primary">Uke {weekIndex + 1}</h4>
                                                    {rotationWeeks.length > 1 && <Button variant="ghost" size="sm" type="button" onClick={() => removeRotationWeek(weekIndex)} className="text-destructive h-8 px-2">Fjern uke</Button>}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((dayKey) => {
                                                        const dayData = week.days[dayKey];
                                                        const dayNames: Record<string, string> = { monday: 'Man', tuesday: 'Tir', wednesday: 'Ons', thursday: 'Tor', friday: 'Fre', saturday: 'Lør', sunday: 'Søn' };
                                                        return (
                                                            <div key={dayKey} className={`border rounded p-2 flex flex-col gap-2 ${dayData.isWorking ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-100'}`}>
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-xs font-bold uppercase">{dayNames[dayKey]}</Label>
                                                                    <Switch checked={dayData.isWorking} onCheckedChange={(v) => updateRotationDay(weekIndex, dayKey, 'isWorking', v)} className="scale-75 origin-right" />
                                                                </div>
                                                                {dayData.isWorking ? (
                                                                    <div className="flex flex-col gap-1 mt-1">
                                                                        <Input type="time" value={dayData.start || ''} onChange={(e) => updateRotationDay(weekIndex, dayKey, 'start', e.target.value)} className="h-7 text-xs px-2" />
                                                                        <Input type="time" value={dayData.end || ''} onChange={(e) => updateRotationDay(weekIndex, dayKey, 'end', e.target.value)} className="h-7 text-xs px-2" />
                                                                    </div>
                                                                ) : <div className="h-14 flex items-center justify-center text-xs text-muted-foreground italic">Fri</div>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" onClick={addRotationWeek} className="w-full border-dashed"><Plus className="mr-2 h-4 w-4" /> Legg til uke i rotasjonen</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50/50">
                         <CardHeader>
                            <CardTitle>Avvik & Ferie</CardTitle>
                            <CardDescription>Legg til sykemelding, ferie eller avvikende arbeidstid. Bruk perioder for lengre fravær.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white p-4 rounded-lg border space-y-4">
                                <div className="flex items-center gap-2">
                                    <Switch id="isPeriod" checked={isPeriod} onCheckedChange={setIsPeriod} />
                                    <Label htmlFor="isPeriod">Registrer for en periode (flere dager)</Label>
                                </div>

                                <div className="grid grid-cols-2 md:flex md:flex-row gap-3 items-end">
                                    <div className="space-y-2 col-span-2 md:w-[150px]">
                                        <Label>{isPeriod ? 'Fra dato' : 'Dato'}</Label>
                                        <Input 
                                            type="date" 
                                            value={overrideStartDateStr} 
                                            onChange={(e) => setOverrideStartDateStr(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    {isPeriod && (
                                        <div className="space-y-2 col-span-2 md:w-[150px]">
                                            <Label>Til dato</Label>
                                            <Input 
                                                type="date" 
                                                value={overrideEndDateStr} 
                                                onChange={(e) => setOverrideEndDateStr(e.target.value)}
                                                className="w-full"
                                                min={overrideStartDateStr}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="space-y-2 col-span-2 md:w-[140px]">
                                        <Label>Type</Label>
                                        <Select value={overrideType} onValueChange={(v: any) => setOverrideType(v)}>
                                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                            <SelectContent className="z-[150]">
                                                <SelectItem value="off">Fridag</SelectItem>
                                                <SelectItem value="vacation">Ferie</SelectItem>
                                                <SelectItem value="sick">Sykemelding</SelectItem>
                                                <SelectItem value="custom">Tilpasset tid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {overrideType === 'custom' && (
                                        <>
                                            <div className="space-y-2 col-span-1 md:w-[90px]">
                                                <Label>Start</Label>
                                                <Input type="time" value={overrideStart} onChange={e => setOverrideStart(e.target.value)} />
                                            </div>
                                            <div className="space-y-2 col-span-1 md:w-[90px]">
                                                <Label>Slutt</Label>
                                                <Input type="time" value={overrideEnd} onChange={e => setOverrideEnd(e.target.value)} />
                                            </div>
                                        </>
                                    )}
                                    <div className="col-span-2 md:w-auto">
                                        <Button type="button" onClick={addOverride} disabled={!overrideStartDateStr || (isPeriod && !overrideEndDateStr)} className="w-full">Legg til</Button>
                                    </div>
                                </div>
                            </div>

                            {scheduleOverrides && Object.keys(scheduleOverrides).length > 0 && (
                                <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2">
                                    {Object.entries(scheduleOverrides).sort(([a], [b]) => a.localeCompare(b)).map(([date, details]) => {
                                        let typeLabel = ''; let colorClass = '';
                                        switch(details.type) { case 'off': typeLabel = 'Fridag'; colorClass = 'bg-slate-100 text-slate-700'; break; case 'vacation': typeLabel = 'Ferie'; colorClass = 'bg-green-100 text-green-700 border-green-200'; break; case 'sick': typeLabel = 'Syk'; colorClass = 'bg-red-100 text-red-700 border-red-200'; break; case 'custom': typeLabel = `Arbeider ${details.start} - ${details.end}`; colorClass = 'bg-blue-100 text-blue-700 border-blue-200'; break; }
                                        
                                        const [year, month, day] = date.split('-');
                                        const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                                        
                                        return (
                                            <div key={date} className="flex justify-between items-center p-2 border rounded bg-white">
                                                <div className="flex items-center gap-4">
                                                    <span className="font-medium w-24 whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {format(localDate, 'dd. MMM yyyy', { locale: nb })}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs border ${colorClass}`}>{typeLabel}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" type="button" onClick={() => removeOverride(date)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                     <Card className="bg-slate-50/50">
                        <CardHeader>
                            <CardTitle>Kompetanse</CardTitle>
                            <CardDescription>Legg til sertifiseringer og spesialferdigheter.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Sertifiseringer</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="F.eks. ADR, Truckførerbevis" value={newCert} onChange={(e) => setNewCert(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCert(); }}} />
                                    <Button type="button" variant="secondary" onClick={addCert}><Plus className="h-4 w-4" /></Button>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {certifications.map((cert, i) => ( <div key={i} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"> {cert} <button type="button" onClick={() => removeCert(cert)} className="hover:text-blue-900 ml-1"><X className="h-3 w-3" /></button></div>))}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Spesialferdigheter</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="F.eks. Montering, Kjøl/Frys" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}} />
                                    <Button type="button" variant="secondary" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {skills.map((skill, i) => (<div key={i} className="flex items-center gap-1 bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm font-medium border border-slate-300"> {skill} <button type="button" onClick={() => removeSkill(skill)} className="hover:text-slate-900 ml-1"><X className="h-3 w-3" /></button></div>))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
                <Button type="button" variant="ghost" onClick={onCancel}>Avbryt</Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                    {(isSubmitting || isUploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Lagre Profil
                </Button>
            </div>
        </form>
    );
}
