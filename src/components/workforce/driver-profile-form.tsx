'use client';

import { useState } from 'react';
import { DriverProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, X, Calendar as CalendarIcon, UploadCloud, Trash2, FileText, Download } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef } from 'react';
import Image from 'next/image';
import { firebaseStorage } from '@/lib/firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
    const [rotationStartDate, setRotationStartDate] = useState<Date | undefined>(user.rotation?.startDate ? new Date(user.rotation.startDate) : undefined);
    
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
    
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [overrideType, setOverrideType] = useState<'off' | 'vacation' | 'sick' | 'custom'>('off');
    const [overrideStart, setOverrideStart] = useState('08:00');
    const [overrideEnd, setOverrideEnd] = useState('16:00');
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [turnusCalendarOpen, setTurnusCalendarOpen] = useState(false);

    const addOverride = () => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        setScheduleOverrides(prev => ({
            ...prev,
            [dateStr]: {
                type: overrideType,
                ...(overrideType === 'custom' ? { start: overrideStart, end: overrideEnd } : {})
            }
        }));
        setSelectedDate(undefined);
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
                    const fileExtension = doc.name.split('.').pop() || '';
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
                    startDate: rotationStartDate ? format(rotationStartDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
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
            <div className="space-y-4">
                {!useRotation && <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Arbeidstid (Standard)</h3>}
                {!useRotation && <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start">Starttid</Label>
                        <Input 
                            id="start" 
                            type="time" 
                            required 
                            value={workingHoursStart}
                            onChange={(e) => setWorkingHoursStart(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end">Sluttid</Label>
                        <Input 
                            id="end" 
                            type="time" 
                            required 
                            value={workingHoursEnd}
                            onChange={(e) => setWorkingHoursEnd(e.target.value)}
                        />
                                        </div>
                </div>
                }
            </div>
            <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Turnusplan (Rotasjon)</h3>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="useRotation" className="text-sm">Bruk turnus</Label>
                        <Switch id="useRotation" checked={useRotation} onCheckedChange={setUseRotation} />
                    </div>
                </div>

                {useRotation && (
                    <div className="space-y-6 bg-slate-50 p-4 rounded-lg border">
                        <div className="space-y-2 max-w-xs">
                            <Label>Startdato for turnus</Label>
                            <Popover open={turnusCalendarOpen} onOpenChange={setTurnusCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !rotationStartDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {rotationStartDate ? format(rotationStartDate, "PPP", { locale: nb }) : <span>Velg startdato</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[150]" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={rotationStartDate}
                                        onSelect={(date) => {
                                            setRotationStartDate(date);
                                            setTurnusCalendarOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-muted-foreground">Denne datoen markerer uke 1 i rotasjonen.</p>
                        </div>

                        <div className="space-y-4">
                            {rotationWeeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="bg-white border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="font-semibold text-primary">Uke {weekIndex + 1}</h4>
                                        {rotationWeeks.length > 1 && (
                                            <Button variant="ghost" size="sm" type="button" onClick={() => removeRotationWeek(weekIndex)} className="text-destructive h-8 px-2">
                                                Fjern uke
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((dayKey) => {
                                            const dayData = week.days[dayKey];
                                            const dayNames: Record<string, string> = { monday: 'Man', tuesday: 'Tir', wednesday: 'Ons', thursday: 'Tor', friday: 'Fre', saturday: 'Lør', sunday: 'Søn' };
                                            
                                            return (
                                                <div key={dayKey} className={`border rounded p-2 flex flex-col gap-2 ${dayData.isWorking ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs font-bold uppercase">{dayNames[dayKey]}</Label>
                                                        <Switch 
                                                            checked={dayData.isWorking} 
                                                            onCheckedChange={(v) => updateRotationDay(weekIndex, dayKey, 'isWorking', v)} 
                                                            className="scale-75 origin-right"
                                                        />
                                                    </div>
                                                    {dayData.isWorking ? (
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <Input 
                                                                type="time" 
                                                                value={dayData.start || ''} 
                                                                onChange={(e) => updateRotationDay(weekIndex, dayKey, 'start', e.target.value)} 
                                                                className="h-7 text-xs px-2"
                                                            />
                                                            <Input 
                                                                type="time" 
                                                                value={dayData.end || ''} 
                                                                onChange={(e) => updateRotationDay(weekIndex, dayKey, 'end', e.target.value)} 
                                                                className="h-7 text-xs px-2"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-14 flex items-center justify-center text-xs text-muted-foreground italic">
                                                            Fridag
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" onClick={addRotationWeek} className="w-full border-dashed">
                            <Plus className="mr-2 h-4 w-4" /> Legg til ny uke i rotasjonen
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Avvik / Ferie</h3>
                
                <div className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 p-4 rounded-lg border">
                    <div className="space-y-2 w-full sm:w-auto">
                        <Label>Dato</Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[180px] justify-start text-left font-normal",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP", { locale: nb }) : <span>Velg dato</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[150]" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date);
                                        setCalendarOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    <div className="space-y-2 w-full sm:w-auto">
                        <Label>Type</Label>
                        <Select value={overrideType} onValueChange={(v: any) => setOverrideType(v)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
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
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label>Start</Label>
                                <Input type="time" value={overrideStart} onChange={e => setOverrideStart(e.target.value)} className="w-[100px]"/>
                            </div>
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label>Slutt</Label>
                                <Input type="time" value={overrideEnd} onChange={e => setOverrideEnd(e.target.value)} className="w-[100px]"/>
                            </div>
                        </>
                    )}

                    <Button type="button" onClick={addOverride} disabled={!selectedDate} className="w-full sm:w-auto">
                        Legg til
                    </Button>
                </div>

                {scheduleOverrides && Object.keys(scheduleOverrides).length > 0 && (
                    <div className="space-y-2 mt-4">
                        {Object.entries(scheduleOverrides).sort(([a], [b]) => a.localeCompare(b)).map(([date, details]) => {
                            let typeLabel = '';
                            let colorClass = '';
                            switch(details.type) {
                                case 'off': typeLabel = 'Fridag'; colorClass = 'bg-slate-100 text-slate-700'; break;
                                case 'vacation': typeLabel = 'Ferie'; colorClass = 'bg-green-100 text-green-700 border-green-200'; break;
                                case 'sick': typeLabel = 'Syk'; colorClass = 'bg-red-100 text-red-700 border-red-200'; break;
                                case 'custom': typeLabel = `Arbeider ${details.start} - ${details.end}`; colorClass = 'bg-blue-100 text-blue-700 border-blue-200'; break;
                            }
                            return (
                                <div key={date} className="flex justify-between items-center p-2 border rounded bg-white">
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium w-24">{format(new Date(date), 'dd.MM.yyyy')}</span>
                                        <span className={`px-2 py-0.5 rounded text-sm border ${colorClass}`}>
                                            {typeLabel}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" type="button" onClick={() => removeOverride(date)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Sertifiseringer</h3>
                <div className="flex gap-2">
                    <Input 
                        placeholder="F.eks. ADR, Truckførerbevis" 
                        value={newCert}
                        onChange={(e) => setNewCert(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addCert();
                            }
                        }}
                    />
                    <Button type="button" variant="secondary" onClick={addCert}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                            {cert}
                            <button type="button" onClick={() => removeCert(cert)} className="hover:text-blue-900 ml-1">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    {certifications.length === 0 && <span className="text-sm text-muted-foreground italic">Ingen sertifiseringer lagt til.</span>}
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Spesialferdigheter / Godkjenninger</h3>
                <div className="flex gap-2">
                    <Input 
                        placeholder="F.eks. Montering, Kjøl/Frys erfaring" 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill();
                            }
                        }}
                    />
                    <Button type="button" variant="secondary" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium border border-slate-200">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-slate-900 ml-1">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    {skills.length === 0 && <span className="text-sm text-muted-foreground italic">Ingen ferdigheter lagt til.</span>}
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Dokumenter</h3>
                        <p className="text-xs text-muted-foreground">Last opp kursbevis, attester og andre dokumenter. (Maks 10MB per fil)</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-10 w-10 shrink-0 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="text-sm font-medium truncate" title={doc.name}>
                                        {doc.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground uppercase">
                                        {doc.file ? 'Venter på opplasting...' : doc.type.split('/')[1] || 'Fil'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!doc.file && doc.url && (
                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-slate-900">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download={doc.name}>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => removeDocument(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    <div className="pt-2">
                        <input
                            type="file"
                            multiple
                            className="sr-only"
                            ref={documentInputRef}
                            onChange={handleAddDocuments}
                        />
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full border-dashed flex items-center justify-center gap-2 text-muted-foreground"
                            onClick={(e) => {
                                e.preventDefault();
                                documentInputRef.current?.click();
                            }}
                        >
                            <UploadCloud className="h-4 w-4" />
                            <span>Last opp dokument(er)</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <div>
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Sjåførbilde</h3>
                    <p className="text-xs text-muted-foreground">Legg til et bilde av sjåføren.</p>
                </div>
                
                <div className="w-48">
                    {image ? (
                        <div className="relative group rounded-md overflow-hidden border">
                            <div className="relative aspect-square w-full">
                                <Image
                                    src={image.preview || image.url}
                                    alt="Sjåførbilde"
                                    fill
                                    sizes="(max-width: 768px) 192px, 192px"
                                    className="object-cover"
                                />
                            </div>
                            <Button 
                                type="button"
                                variant="destructive" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={removeImage}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="h-48 w-48 aspect-square flex flex-col items-center justify-center gap-2 text-muted-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  fileInputRef.current?.click();
                                }}
                            >
                              <UploadCloud className="h-8 w-8" />
                              <span className="text-sm">Last opp bilde</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
                <Button type="button" variant="outline" onClick={onCancel}>Avbryt</Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                    {(isSubmitting || isUploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Lagre Profil
                </Button>
            </div>
        </form>
    );
}
