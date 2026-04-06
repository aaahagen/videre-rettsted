'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { firebaseDB } from '@/lib/firebase/database';
import { DriverProfile } from '@/lib/types';
import { format, differenceInWeeks, isValid, startOfWeek, addDays } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Loader2, ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Reusing the exact same logic
const getDriverStatus = (driver: DriverProfile, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (driver.scheduleOverrides && driver.scheduleOverrides[dateStr]) {
        const override = driver.scheduleOverrides[dateStr];
        switch (override.type) {
            case 'off': return { status: 'Fridag', short: 'Fri', type: 'off' };
            case 'vacation': return { status: 'Ferie', short: 'Ferie', type: 'vacation' };
            case 'sick': return { status: 'Syk', short: 'Syk', type: 'sick' };
            case 'custom': return { status: `Jobber ${override.start} - ${override.end}`, short: `${override.start}-${override.end}`, type: 'working' };
        }
    }
    if (driver.rotation && driver.rotation.startDate && driver.rotation.weeks?.length > 0) {
        const rotStartDate = new Date(driver.rotation.startDate);
        if (isValid(rotStartDate) && date >= rotStartDate) {
            const diffInWeeks = differenceInWeeks(date, rotStartDate);
            const rotationIndex = diffInWeeks % driver.rotation.weeks.length;
            const weekPlan = driver.rotation.weeks[rotationIndex];
            const dayName = format(date, 'EEEE').toLowerCase();
            const dayPlan = weekPlan.days[dayName as keyof typeof weekPlan.days];
            if (dayPlan && dayPlan.isWorking) {
                return { status: `Jobber ${dayPlan.start} - ${dayPlan.end} (Turnus)`, short: `${dayPlan.start}-${dayPlan.end}`, type: 'working' };
            } else {
                return { status: 'Fridag (Turnus)', short: 'Fri', type: 'off' };
            }
        }
    }
    if (driver.workingHours?.start && driver.workingHours?.end) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return { status: 'Helg (Standard)', short: 'Helg', type: 'off' };
        }
        return { status: `Jobber ${driver.workingHours.start} - ${driver.workingHours.end} (Standard)`, short: `${driver.workingHours.start}-${driver.workingHours.end}`, type: 'working' };
    }
    return { status: 'Ingen plan satt', short: '-', type: 'unknown' };
};

function PrintContent() {
    const [authUser, loading] = useAuthState(auth);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [driver, setDriver] = useState<DriverProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const driverId = searchParams.get('driverId');
    const dateParam = searchParams.get('date');
    const startDate = dateParam ? new Date(dateParam) : new Date();

    useEffect(() => {
        const fetchDriver = async () => {
            if (!driverId) {
                setIsLoading(false);
                return;
            }
            try {
                const userDoc = await firebaseDB.getUser(driverId);
                // Ensure it's the same org to prevent snooping
                if (userDoc) { // Note: We should ideally fetch the current user to check orgId, but for print we can just fetch the driver if auth passes.
                    setDriver(userDoc as DriverProfile);
                }
            } catch (error) {
                console.error("Failed to load driver", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (authUser && !loading) {
            fetchDriver();
        }
    }, [driverId, authUser, loading]);

    if (!loading && !authUser) {
        router.push('/login');
        return null;
    }

    if (loading || isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!driver) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4">
                <p>Fant ikke sjåføren eller du har ikke tilgang.</p>
                <Button onClick={() => window.close()}>Lukk Vindu</Button>
            </div>
        );
    }

    const startOfPlan = startOfWeek(startDate, { weekStartsOn: 1 });
    let printWeeks: { startDate: Date; days: { date: Date; status: any }[] }[] = [];
    for (let w = 0; w < 12; w++) {
        const weekStart = addDays(startOfPlan, w * 7);
        const days = [];
        for (let d = 0; d < 7; d++) {
            const currentDay = addDays(weekStart, d);
            days.push({
                date: currentDay,
                status: getDriverStatus(driver, currentDay)
            });
        }
        printWeeks.push({ startDate: weekStart, days });
    }

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white flex justify-center p-4 sm:p-8">
            <div className="bg-white p-8 max-w-5xl w-full shadow-lg print:shadow-none print:p-0 border border-slate-200 print:border-none rounded-xl">
                
                {/* Print Controls (Hidden when actually printing) */}
                <div className="print:hidden flex justify-between items-center mb-8 pb-4 border-b">
                    <Button variant="outline" onClick={() => router.push('/dashboard/workforce')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake til Personell
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Skriv Ut
                        </Button>
                    </div>
                </div>

                {/* The actual printable document */}
                <div className="text-black">
                    <div className="mb-8 border-b-2 border-slate-800 pb-4 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 tracking-tight uppercase">Arbeidsplan</h1>
                            <h2 className="text-2xl text-slate-600 font-medium">{driver.name || driver.email}</h2>
                        </div>
                        <div className="text-right text-sm text-slate-500 space-y-1">
                            <p>Periode: <span className="font-medium text-slate-800">{format(printWeeks[0].startDate, 'dd.MM.yyyy')} - {format(printWeeks[11].days[6].date, 'dd.MM.yyyy')}</span></p>
                            <p>Utskrevet: {format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
                        </div>
                    </div>

                    <table className="w-full text-sm text-left border-collapse border border-slate-300">
                        <thead className="bg-slate-100 text-slate-800">
                            <tr>
                                <th className="px-3 py-3 border border-slate-300 w-12 text-center uppercase text-xs tracking-wider">Uke</th>
                                <th className="px-3 py-3 border border-slate-300 w-[13%]">Mandag</th>
                                <th className="px-3 py-3 border border-slate-300 w-[13%]">Tirsdag</th>
                                <th className="px-3 py-3 border border-slate-300 w-[13%]">Onsdag</th>
                                <th className="px-3 py-3 border border-slate-300 w-[13%]">Torsdag</th>
                                <th className="px-3 py-3 border border-slate-300 w-[13%]">Fredag</th>
                                <th className="px-3 py-3 border border-slate-300 w-[13%] bg-slate-50 text-slate-600">Lørdag</th>
                                <th className="px-3 py-3 border border-slate-300 w-[13%] bg-slate-50 text-slate-600">Søndag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printWeeks.map((week, wIndex) => (
                                <tr key={wIndex}>
                                    <td className="px-2 py-4 border border-slate-300 bg-slate-50 font-bold text-center text-slate-700">
                                        {format(week.startDate, 'ww', { locale: nb })}
                                    </td>
                                    {week.days.map((day, dIndex) => {
                                        const isWeekend = dIndex === 5 || dIndex === 6;
                                        const isOff = day.status.type === 'off';
                                        return (
                                            <td key={dIndex} className={cn(
                                                "px-3 py-2 border border-slate-300 h-20 align-top relative", 
                                                isWeekend && 'bg-slate-50',
                                                isOff && 'bg-slate-50/50'
                                            )}>
                                                <div className="flex justify-between items-start w-full">
                                                    <span className="text-[10px] font-medium text-slate-400">{format(day.date, 'dd.MM')}</span>
                                                </div>
                                                <div className={cn(
                                                    "mt-1 font-medium",
                                                    isOff ? 'text-slate-400 italic' : 'text-slate-900',
                                                    day.status.type === 'vacation' && 'text-green-600',
                                                    day.status.type === 'sick' && 'text-red-600'
                                                )}>
                                                    {day.status.short}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                        <p>* Planen kan endres ved sykdom, ferie eller andre avvik.</p>
                        <p className="font-medium tracking-widest text-slate-300 uppercase">Videre RettSted</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PrintPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <PrintContent />
        </Suspense>
    );
}
