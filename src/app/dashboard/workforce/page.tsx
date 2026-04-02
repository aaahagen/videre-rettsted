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
import { Users, Loader2, Search, Printer, User as UserIcon, FileText, Edit, CalendarDays, UserCheck, Activity, Palmtree, Coffee, Briefcase } from 'lucide-react';
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


                <Card className="bg-white">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label>Velg dato for oversikt</Label>
                                <Input 
                                    type="date"
                                    value={searchDateStr}
                                    onChange={(e) => setSearchDateStr(e.target.value)}
                                    className="w-full sm:w-[240px]"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredDrivers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Ingen funnet.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredDrivers.map(driver => {
                                    const statusInfo = getDriverStatus(driver, searchDate);
                                    
                                    // Calculate upcoming overrides
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
                                        
                                    const visibleOverrides = allUpcomingOverrides.slice(0, 3);
                                    const hasMoreOverrides = allUpcomingOverrides.length > 3;

                                    return (
                                        <div key={driver.id} className="p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:bg-slate-50 transition-colors relative">
                                             {dbUser?.role === 'admin' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="absolute top-2 right-2 text-muted-foreground hover:text-slate-900"
                                                    onClick={() => setEditingDriverProfile(driver)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Rediger profil</span>
                                                </Button>
                                            )}
                                            <div className="flex items-center gap-4 pr-10 w-full lg:w-auto">
                                                {/* Driver Image or Initial Placeholder */}
                                                <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center">
                                                    {(driver.images && driver.images.length > 0 && driver.images[0].url) ? (
                                                        <Image
                                                            src={driver.images[0].url}
                                                            alt={driver.name || driver.email}
                                                            fill
                                                            sizes="48px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <UserIcon className="h-6 w-6 text-slate-400" />
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-1 w-full">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-lg">{driver.name || driver.email}</p>
                                                        {driver.employmentType === 'external' && (
                                                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-1.5 py-0">
                                                                Innleid
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                            
                                                            {driver.employmentType === 'external' && driver.agencyInfo && (
                                                                <div className="flex gap-1 items-center bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 mt-1 sm:mt-0">
                                                                    <span className="font-medium">Innleid fra:</span>
                                                                    <span>{driver.agencyInfo.name}</span>
                                                                    {driver.agencyInfo.phone && <span className="text-amber-700 ml-1">({driver.agencyInfo.phone})</span>}
                                                                </div>
                                                            )}
                                                            
                                                            {driver.certifications?.length ? (
                                                                <div className="flex gap-1 items-center mr-2 border-r pr-3">
                                                                    <span className="font-medium">Sertifikater:</span>
                                                                    {driver.certifications.map((c, i) => (
                                                                        <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded border">{c}</span>
                                                                    ))}
                                                                </div>
                                                            ) : null}
                                                            {driver.skills?.length ? (
                                                                <div className="flex gap-1 items-center">
                                                                    <span className="font-medium">Ferdigheter:</span>
                                                                    {driver.skills.map((s, i) => (
                                                                        <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded border">{s}</span>
                                                                                                                                            ))}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        
                                                        {visibleOverrides.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 items-center mt-1">
                                                                <span className="flex items-center text-xs font-medium text-muted-foreground mr-1">
                                                                    <CalendarDays className="h-3 w-3 mr-1" />
                                                                    Kommende avvik:
                                                                </span>
                                                                {visibleOverrides.map(([dateStr, details]) => {
                                                                    let typeLabel = ''; 
                                                                    let colorClass = '';
                                                                    switch(details.type) { 
                                                                        case 'off': typeLabel = 'Fridag'; colorClass = 'bg-slate-100 text-slate-700 border-slate-200'; break; 
                                                                        case 'vacation': typeLabel = 'Ferie'; colorClass = 'bg-green-100 text-green-700 border-green-200'; break; 
                                                                        case 'sick': typeLabel = 'Syk'; colorClass = 'bg-red-100 text-red-700 border-red-200'; break; 
                                                                        case 'custom': typeLabel = `${details.start}-${details.end}`; colorClass = 'bg-blue-100 text-blue-700 border-blue-200'; break; 
                                                                    }
                                                                    const [year, month, day] = dateStr.split('-');
                                                                    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
                                                                    
                                                                    return (
                                                                        <span key={dateStr} className={cn("px-1.5 py-0.5 rounded border text-[10px] font-medium", colorClass)}>
                                                                            {format(localDate, 'dd.MM', { locale: nb })}: {typeLabel}
                                                                        </span>
                                                                    );
                                                                })}
                                                                {hasMoreOverrides && (
                                                                    <span className="text-[10px] text-muted-foreground ml-1">...og {allUpcomingOverrides.length - 3} til</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {driver.documents?.length ? (
                                                            <div className="flex flex-wrap gap-1 items-center mt-1">
                                                                {driver.documents.map((doc, i) => (
                                                                     <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-colors px-2 py-0.5 rounded border border-blue-200 text-xs">
                                                                         <FileText className="h-3 w-3" />
                                                                         <span className="truncate max-w-[120px]">{doc.name}</span>
                                                                     </a>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap lg:flex-nowrap items-end sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 justify-end">
                                                <Badge variant="outline" className={cn("text-sm py-1 font-medium", statusInfo.color)}>
                                                    {statusInfo.status}
                                                </Badge>

                                                {driver.rotation && driver.rotation.startDate && driver.rotation.weeks?.length > 0 && (
                                                    <Button variant="secondary" size="sm" asChild>
                                                        <a href={`/dashboard/workforce/print?driverId=${driver.id}&date=${searchDate.toISOString()}`} target="_blank" rel="noopener noreferrer">
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            Plan (12 uker)
                                                        </a>
                                                    </Button>
                                                )}

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

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
