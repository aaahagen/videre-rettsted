'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { DriverProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Users, Loader2, Search, Printer } from 'lucide-react';
import { format, differenceInWeeks, isValid, startOfWeek, addDays } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
    return { status: 'Ingen plan satt', short: '-', type: 'unknown', color: 'bg-slate-100 text-slate-500 italic border-slate-200' };
};

export default function WorkforcePage() {
    const { dbUser } = useAuth();
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchDate, setSearchDate] = useState<Date>(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    
    // Print state
    
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
            setDrivers(users.filter(u => u.role === 'driver') as DriverProfile[]);
        } catch (error) {
            console.error("Failed to load drivers", error);
        } finally {
            setIsLoading(false);
        }
    };

    
    const filteredDrivers = drivers.filter(d => 
        (d.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
        (d.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );

    if (isLoading) {
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
                            Søk etter sjåfører og se tilgjengelighet og arbeidsplan for en spesifikk dato.
                        </p>
                    </div>
                </div>

                <Card className="bg-white">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="space-y-2 w-full sm:w-64 relative">
                                <Label>Søk etter sjåfør</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Navn eller e-post..." 
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 w-full sm:w-auto">
                                <Label>Velg dato for oversikt</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full sm:w-[240px] justify-start text-left font-normal",
                                                !searchDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {searchDate ? format(searchDate, "PPP", { locale: nb }) : <span>Velg dato</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={searchDate}
                                            onSelect={(date) => date && setSearchDate(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredDrivers.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Ingen sjåfører funnet.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredDrivers.map(driver => {
                                    const statusInfo = getDriverStatus(driver, searchDate);
                                    return (
                                        <div key={driver.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-lg">{driver.name || driver.email}</p>
                                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
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
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                                                <Badge variant="outline" className={cn("text-sm py-1 font-medium", statusInfo.color)}>
                                                    {statusInfo.status}
                                                </Badge>
                                                
                                                <Button variant="secondary" size="sm" asChild>
                                                    <a href={`/dashboard/workforce/print?driverId=${driver.id}&date=${searchDate.toISOString()}`} target="_blank" rel="noopener noreferrer">
                                                        <Printer className="mr-2 h-4 w-4" />
                                                        Plan (12 uker)
                                                    </a>
                                                </Button>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog for Previewing Print */}
                
            </div>

            
        </>
    );
}
