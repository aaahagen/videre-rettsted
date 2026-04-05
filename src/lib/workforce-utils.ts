import { DriverProfile } from '@/lib/types';
import { format, differenceInWeeks, isValid } from 'date-fns';

export const getDriverStatus = (driver: DriverProfile, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // 1. Check for single-day overrides first (highest priority)
    if (driver.scheduleOverrides && driver.scheduleOverrides[dateStr]) {
        const override = driver.scheduleOverrides[dateStr];
        switch (override.type) {
            case 'off': return { status: 'Fridag', short: 'Fri', type: 'off', color: 'bg-slate-100 text-slate-700' };
            case 'vacation': return { status: 'Ferie', short: 'Ferie', type: 'vacation', color: 'bg-green-100 text-green-800 border-green-200' };
            case 'sick': return { status: 'Syk', short: 'Syk', type: 'sick', color: 'bg-red-100 text-red-800 border-red-200' };
            case 'custom': return { status: `Jobber ${override.start} - ${override.end}`, short: `${override.start}-${override.end}`, type: 'working', color: 'bg-blue-100 text-blue-800 border-blue-200', start: override.start, end: override.end };
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
                return { status: `Jobber ${dayPlan.start} - ${dayPlan.end} (Turnus)`, short: `${dayPlan.start}-${dayPlan.end}`, type: 'working', color: 'bg-blue-50 text-blue-700 border-blue-200', start: dayPlan.start, end: dayPlan.end };
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
        return { status: `Jobber ${driver.workingHours.start} - ${driver.workingHours.end} (Standard)`, short: `${driver.workingHours.start}-${driver.workingHours.end}`, type: 'working', color: 'bg-blue-50 text-blue-700 border-blue-200', start: driver.workingHours.start, end: driver.workingHours.end };
    }

    // 4. Check if they have an active contract (new logic)
    if (driver.contracts && driver.contracts.length > 0) {
        const sortedContracts = [...driver.contracts].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        const activeContract = sortedContracts.find(c => {
            const start = new Date(c.startDate);
            const end = c.endDate ? new Date(c.endDate) : new Date(2100, 0, 1);
            return date >= start && date <= end;
        });

        if (activeContract) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { 
                return { status: 'Helg', short: 'Helg', type: 'off', color: 'bg-slate-100 text-slate-500 border-slate-200' };
            }
            return { status: `${activeContract.contractedHours} timer/uke (${activeContract.role})`, short: `${activeContract.contractedHours}t`, type: 'working', color: 'bg-blue-50 text-blue-700 border-blue-200' };
        }
    }

    // 4. Default if nothing is set
    return { status: 'Bruker Turnusplan', short: 'Turnus', type: 'unknown', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
};