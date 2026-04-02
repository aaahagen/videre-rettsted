'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { DriverProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Loader2, Search, Printer, User as UserIcon, FileText, Edit, CalendarDays, UserCheck, Activity, Palmtree, Coffee, Briefcase , ChevronDown, ChevronUp } from 'lucide-react';
import { format, differenceInWeeks, isValid } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DriverProfileForm } from '@/components/workforce/driver-profile-form';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useToast } from '@/hooks/use-toast';
import { useSearch } from '@/hooks/use-search';

// --- Core Logic for computing a driver's status on a specific date ---
const getDriverStatus = (driver: DriverProfile, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // 1. Check for single-day overrides first (highest priority)
    if (driver.scheduleOverrides && driver.scheduleOverrides[dateStr]) {
        const override = driver.scheduleOverrides[dateStr];
        switch (override.type) {
            case 'off': return { status: 'Fridag', short: 'Fri', type: 'off', color: 'bg-slate-100 text-slate-700' };
            case 'vacation': return { status: 'Ferie', short: 'Ferie', type: 'vacation', color: 'bg-green-100 text-green-800 border-green-200' };
            case 'sick': return { status: 'Syk', short: 'Syk', type: 'sick', color: 'bg-red-100 text-red-800 border-red-200' };
            case 'custom': return { status: `Jobber ${override.start} - ${override.end}`, short: `${override.start}-${override.end}`, type: 'working', color: 'bg-blue-100 text-blue-800 border-blue-200' };
        }
    }

    // 2. Check for Rotation
    if (driver.rotation && driver.rotation.startDate && driver.rotation.weeks?.length > 0) {
        const rotStartDate = new Date(driver.rotation.startDate);
        if (isValid(rotStartDate) && date >= rotStartDate) {
            // Calculate which week in the rotation cycle this date falls into
            const diffInWeeks = differenceInWeeks(date, rotStartDate);
            const rotationIndex = diffInWeeks % driver.rotation.weeks.length;
            const weekPlan = driver.rotation.weeks[rotationIndex];

            const dayName = format(date, 'EEEE').toLowerCase(); // 'monday', 'tuesday', etc.
            const dayPlan = weekPlan.days[dayName as keyof typeof weekPlan.days];

            if (dayPlan && dayPlan.isWorking) {
                return { status: `Jobber ${dayPlan.start} - ${dayPlan.end} (Turnus)`, short: `${dayPlan.start}-${dayPlan.end}`, type: 'working', color: 'bg-blue-50 text-blue-700 border-blue-200' };
            } else {
                return { status: 'Fridag (Turnus)', short: 'Fri', type: 'off', color: 'bg-slate-100 text-slate-600 border-slate-200' };
            }
        }
    }

    // 3. Fallback to standard working hours (if defined)
    if (driver.workingHours?.start && driver.workingHours?.end) {
        // Assume weekends are off if standard hours are used
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
            return { status: 'Helg (Standard)', short: 'Helg', type: 'off', color: 'bg-slate-100 text-slate-500 border-slate-200' };
        }
        return { status: `Jobber ${driver.workingHours.start} - ${driver.workingHours.end} (Standard)`, short: `${driver.workingHours.start}-${driver.workingHours.end}`, type: 'working', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }

    // 4. Default if nothing is set
    return { status: 'Bruker Turnusplan', short: 'Turnus', type: 'unknown', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
};

export default function WorkforcePage() {
    const { dbUser } = useAuth();
    const { toast } = useToast();
    const { query: searchQuery, setContext } = useSearch();
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchDateStr, setSearchDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    
    const [editingDriverProfile, setEditingDriverProfile] = useState<DriverProfile | null>(null);
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const toggleCard = (id: string) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    
    useEffect(() => {
        setContext('Personell', '/dashboard/admin'); // Redirects to admin page where invitations are sent
        return () => setContext('Steder', '/dashboard/new');
    }, [setContext]);

    useEffect(() => {
        if (dbUser?.orgId) {
            loadDrivers();
        }
    }, [dbUser]);

    const loadDrivers = async () => {
        try {
            setIsLoading(true);
            const users = await firebaseDB.getUsers(dbUser!.orgId);
            // Only show drivers
            setDrivers(users.filter(u => u.role === 'driver' || u.role === 'contractor') as DriverProfile[]);
        } catch (error) {
            console.error("Failed to load drivers", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateDriverProfile = async (data: Partial<DriverProfile>) => {
        if (!editingDriverProfile) return;
        try {
            await updateDoc(doc(db, 'users', editingDriverProfile.id), data);
            toast({
                title: "Profil oppdatert",
                description: "Profilen ble lagret.",
            });
            setEditingDriverProfile(null);
            loadDrivers(); // Reload to show new data
            setTimeout(() => { document.body.style.pointerEvents = ''; }, 300);
        } catch (error: any) {
            toast({
                title: "Feil ved oppdatering",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    
    const filteredDrivers = drivers.filter(d => 
        (d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (d.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );

    // Parse the search date securely
    let searchDate = new Date();
    if (searchDateStr) {
        const [year, month, day] = searchDateStr.split('-');
        if (year && month && day) {
            searchDate = new Date(Number(year), Number(month) - 1, Number(day));
        }
    }

const stats = useMemo(() => {
        let working = 0;
        let sick = 0;
        let vacation = 0;
        let off = 0;
        let contractors = 0;

        drivers.forEach(driver => {
            if (driver.role === 'contractor' || driver.employmentType === 'external') {
                contractors++;
            }
            
            const statusInfo = getDriverStatus(driver, searchDate);
            if (statusInfo.type === 'working') working++;
            else if (statusInfo.type === 'sick') sick++;
            else if (statusInfo.type === 'vacation') vacation++;
            else if (statusInfo.type === 'off') off++;
        });

        return { working, sick, vacation, off, contractors, total: drivers.length };
    }, [drivers, searchDate]);

    if (isLoading && drivers.length === 0) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }



    


    return (
        <>
            {/* MAIN APP CONTENT - Hidden during print */}
            <div className="print:hidden container mx-auto max-w-7xl px-4 py-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Users className="h-8 w-8 text-primary" />
                            Personelloversikt
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Søk etter personell og se tilgjengelighet og arbeidsplan for en spesifikk dato.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-4">
                    <Card className="bg-blue-50 border-blue-100 shadow-sm">
                        <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center">
                            <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mb-1 sm:mb-2" />
                            <p className="text-lg sm:text-2xl font-bold text-blue-900">{stats.working}</p>
                            <p className="text-[9px] sm:text-xs font-medium text-blue-700 uppercase tracking-tighter sm:tracking-wider">På jobb</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-100 shadow-sm">
                        <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mb-1 sm:mb-2" />
                            <p className="text-lg sm:text-2xl font-bold text-red-900">{stats.sick}</p>
                            <p className="text-[9px] sm:text-xs font-medium text-red-700 uppercase tracking-tighter sm:tracking-wider">Syk</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100 shadow-sm">
                        <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center">
                            <Palmtree className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1 sm:mb-2" />
                            <p className="text-lg sm:text-2xl font-bold text-green-900">{stats.vacation}</p>
                            <p className="text-[9px] sm:text-xs font-medium text-green-700 uppercase tracking-tighter sm:tracking-wider">Ferie</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-slate-200 shadow-sm">
                        <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center">
                            <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 mb-1 sm:mb-2" />
                            <p className="text-lg sm:text-2xl font-bold text-slate-700">{stats.off}</p>
                            <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-tighter sm:tracking-wider">Fridag</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100 shadow-sm">
                        <CardContent className="p-2 sm:p-4 flex flex-col items-center justify-center text-center">
                            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mb-1 sm:mb-2" />
                            <p className="text-lg sm:text-2xl font-bold text-amber-900">{stats.contractors}</p>
                            <p className="text-[9px] sm:text-xs font-medium text-amber-700 uppercase tracking-tighter sm:tracking-wider">Innleid (Totalt)</p>
                        </CardContent>
                    </Card>
                </div>


                <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="space-y-2 w-full sm:w-auto max-w-full">
                        <Label className="text-sm font-semibold text-slate-700">Velg dato for oversikt</Label>
                        <Input 
                            type="date"
                            value={searchDateStr}
                            onChange={(e) => setSearchDateStr(e.target.value)}
                            className="w-full max-w-full sm:w-[240px] bg-slate-50 border-slate-300"
                        />
                    </div>
                </div>

                {filteredDrivers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200">
                        <div className="rounded-full bg-slate-100 p-6 mb-4">
                            <Search className="h-12 w-12 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900">Ingen funnet.</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDrivers.map(driver => {
                            const statusInfo = getDriverStatus(driver, searchDate);
                            
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            const allUpcomingOverrides = driver.scheduleOverrides 
                                ? Object.entries(driver.scheduleOverrides)
                                    .filter(([dateStr]) => {
                                        const [year, month, day] = dateStr.split('-');
                                        const overrideDate = new Date(Number(year), Number(month) - 1, Number(day));
                                        return overrideDate >= today;
                                    })
                                    .sort(([a], [b]) => a.localeCompare(b))
                                : [];
                                

                            const isExpanded = !!expandedCards[driver.id];

                            return (
                                <Card key={driver.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                                    {dbUser?.role === 'admin' && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute top-2 right-2 text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={() => setEditingDriverProfile(driver)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <div className={`h-1.5 w-full ${statusInfo.type === 'working' ? 'bg-blue-500' : statusInfo.type === 'sick' ? 'bg-red-500' : statusInfo.type === 'vacation' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    
                                    <CardHeader className="pb-3 flex flex-row items-start gap-4">
                                        <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                                            {(driver.images && driver.images.length > 0 && driver.images[0].url) ? (
                                                <Image
                                                    src={driver.images[0].url}
                                                    alt={driver.name || driver.email}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="h-6 w-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <CardTitle className="text-lg font-bold truncate" title={driver.name || driver.email}>
                                                {driver.name || driver.email}
                                            </CardTitle>
                                            <div className="flex items-center mt-1">
                                                {driver.employmentType === 'external' ? (
                                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0">
                                                        Innleid
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] px-1.5 py-0">
                                                        Fast
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-0 flex-grow flex flex-col justify-start gap-4">
                                        <div className="space-y-4">
                                            <div 
                                                className="bg-slate-50 hover:bg-slate-100 transition-colors p-2.5 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center cursor-pointer relative"
                                                onClick={() => toggleCard(driver.id)}
                                            >
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Status {format(searchDate, 'dd.MM')}</span>
                                                <Badge variant="outline" className={cn("text-sm py-1 font-medium", statusInfo.color)}>
                                                    {statusInfo.status}
                                                </Badge>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                                                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                                    {(driver.certifications?.length || driver.skills?.length) ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {driver.certifications?.map((c, i) => (
                                                                <span key={i} className="bg-slate-100 px-2 py-0.5 rounded-md border text-xs font-medium text-slate-700">{c}</span>
                                                            ))}
                                                            {driver.skills?.map((s, i) => (
                                                                <span key={i} className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-xs font-medium text-blue-700">{s}</span>
                                                            ))}
                                                        </div>
                                                    ) : null}

                                                    {allUpcomingOverrides.length > 0 && (
                                                        <div className="space-y-1.5 bg-rose-50/50 p-2 rounded border border-rose-100">
                                                            <span className="flex items-center text-[10px] uppercase font-bold tracking-wider text-rose-600">
                                                                <CalendarDays className="h-3 w-3 mr-1" />
                                                                Kommende fravær
                                                            </span>
                                                            <div className="flex flex-col gap-1 mt-1 max-h-[120px] overflow-y-auto pr-1 no-scrollbar">
                                                                {allUpcomingOverrides.map(([dateStr, details]) => {
                                                                    let typeLabel = ''; 
                                                                    switch(details.type) { 
                                                                        case 'off': typeLabel = 'Fridag'; break; 
                                                                        case 'vacation': typeLabel = 'Ferie'; break; 
                                                                        case 'sick': typeLabel = 'Sykemelding'; break; 
                                                                        case 'custom': typeLabel = `${details.start}-${details.end}`; break; 
                                                                    }
                                                                    const [year, month, day] = dateStr.split('-');
                                                                    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                                                                    
                                                                    return (
                                                                        <div key={dateStr} className="flex justify-between items-center text-xs">
                                                                            <span className="font-medium text-slate-700">{format(localDate, 'dd.MM')}</span>
                                                                            <span className="text-slate-500">{typeLabel}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                                
                                                            </div>
                                                        </div>
                                                    )}

                                                    {driver.employmentType === 'external' && driver.agencyInfo && (
                                                        <div className="flex flex-col gap-1 bg-amber-50 text-amber-800 p-2 rounded border border-amber-200 text-xs">
                                                            <span className="font-bold text-[10px] uppercase tracking-wider text-amber-600/80">Byrå Info</span>
                                                            <div className="flex justify-between font-medium">
                                                                <span>{driver.agencyInfo.name}</span>
                                                                {driver.agencyInfo.phone && <span>{driver.agencyInfo.phone}</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="flex items-center justify-between pt-2 border-t mt-auto animate-in fade-in duration-200">
                                                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                                    {driver.documents?.map((doc, i) => (
                                                        <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors px-2 py-1 rounded text-[10px] font-medium shrink-0" title={doc.name}>
                                                            <FileText className="h-3 w-3 shrink-0" />
                                                            <span className="truncate max-w-[60px]">{doc.name.split('.')[0]}</span>
                                                        </a>
                                                    ))}
                                                </div>

                                                {driver.rotation && driver.rotation.startDate && driver.rotation.weeks?.length > 0 && (
                                                    <Button variant="secondary" size="sm" asChild className="h-7 text-xs px-2 shrink-0 ml-2">
                                                        <a href={`/dashboard/workforce/print?driverId=${driver.id}&date=${searchDate.toISOString()}`} target="_blank" rel="noopener noreferrer">
                                                            <Printer className="mr-1 h-3 w-3" />
                                                            Plan
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Edit Driver Profile Dialog */}
                <Dialog open={!!editingDriverProfile} onOpenChange={(open) => {
                    if (!open) {
                        setEditingDriverProfile(null);
                        setTimeout(() => { document.body.style.pointerEvents = ''; }, 300);
                    }
                }}>
                <DialogContent className="max-w-6xl w-[95vw] rounded-xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Rediger profil</DialogTitle>
                        <DialogDescription>
                          Oppdater arbeidstid, kompetanse og personlig informasjon.
                        </DialogDescription>
                    </DialogHeader>
                     <div className="py-4">
                        {editingDriverProfile && (
                            <DriverProfileForm 
                                user={editingDriverProfile} 
                                onSubmit={handleUpdateDriverProfile} 
                                onCancel={() => {
                                    setEditingDriverProfile(null);
                                    setTimeout(() => { document.body.style.pointerEvents = ''; }, 300);
                                }} 
                            />
                        )}
                    </div>
                </DialogContent>
                </Dialog>
                
            </div>

            
        </>
    );
}
