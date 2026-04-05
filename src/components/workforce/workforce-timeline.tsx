'use client';

import { useState, useMemo } from 'react';
import { DriverProfile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, User as UserIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, startOfMonth, endOfMonth, isSameDay, isToday, addWeeks, subWeeks, addMonths, subMonths, isWeekend } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getDriverStatus } from "@/lib/workforce-utils";
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkforceTimelineProps {
    drivers: DriverProfile[];
    onEditDriver: (driver: DriverProfile) => void;
}

export function WorkforceTimeline({ drivers, onEditDriver }: WorkforceTimelineProps) {
    const [viewType, setViewType] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const days = useMemo(() => {
        const start = viewType === 'week' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : startOfMonth(currentDate);
        const end = viewType === 'week' ? endOfWeek(currentDate, { weekStartsOn: 1 }) : endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate, viewType]);

    const navigate = (direction: 'prev' | 'next') => {
        if (viewType === 'week') {
            setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
        } else {
            setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col w-full min-w-0">
            <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('prev')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium px-2" onClick={() => setCurrentDate(new Date())}>
                                I dag
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('next')}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <h2 className="text-sm font-bold text-slate-900 capitalize">
                            {format(currentDate, viewType === 'week' ? "'Uke' w, yyyy" : 'MMMM yyyy', { locale: nb })}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={viewType} onValueChange={(v: any) => setViewType(v)}>
                            <SelectTrigger className="h-9 w-[120px] bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Ukevis</SelectItem>
                                <SelectItem value="month">Månedsvis</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto w-full min-w-0 flex-1">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="sticky left-0 z-20 bg-slate-50 border-b border-r border-slate-200 p-3 text-left text-[10px] uppercase font-bold text-slate-500 w-[200px] min-w-[200px]">
                                    Sjåfør
                                </th>
                                {days.map(day => (
                                    <th 
                                        key={day.toISOString()} 
                                        className={cn(
                                            "border-b border-slate-200 p-2 text-center min-w-[45px] sm:min-w-[60px]",
                                            isToday(day) && "bg-blue-50/50",
                                            isWeekend(day) && "bg-slate-50/30"
                                        )}
                                    >
                                        <div className="text-[10px] text-slate-400 uppercase font-medium">{format(day, 'EEE', { locale: nb })}</div>
                                        <div className={cn(
                                            "text-sm font-bold mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full",
                                            isToday(day) ? "bg-primary text-white" : "text-slate-700"
                                        )}>
                                            {format(day, 'd')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map(driver => (
                                <tr key={driver.id} className="hover:bg-slate-50/50 group">
                                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-b border-r border-slate-200 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                                                {(driver.images && driver.images.length > 0 && driver.images[0].url) ? (
                                                    <Image
                                                        src={driver.images[0].url}
                                                        alt={driver.name || driver.email}
                                                        fill
                                                        sizes="32px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="h-4 w-4 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-900 truncate" title={driver.name || driver.email}>
                                                    {driver.name || driver.email}
                                                </div>
                                                <button 
                                                    onClick={() => onEditDriver(driver)}
                                                    className="text-[10px] text-primary hover:underline font-medium flex items-center gap-0.5"
                                                >
                                                    <Edit className="h-2.5 w-2.5" />
                                                    Rediger
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    {days.map(day => {
                                        const statusInfo = getDriverStatus(driver, day);
                                        const isWork = statusInfo.type === 'working';
                                        
                                        return (
                                            <td 
                                                key={day.toISOString()} 
                                                className={cn(
                                                    "border-b border-slate-200 p-1 text-center h-16",
                                                    isToday(day) && "bg-blue-50/20",
                                                    isWeekend(day) && "bg-slate-50/10"
                                                )}
                                            >
                                                <div 
                                                    className={cn(
                                                        "w-full h-full rounded-md flex flex-col items-center justify-center transition-all border",
                                                        isWork ? "bg-blue-50 border-blue-100 text-blue-700" : 
                                                        statusInfo.type === 'vacation' ? "bg-green-50 border-green-100 text-green-700" :
                                                        statusInfo.type === 'sick' ? "bg-red-50 border-red-100 text-red-700" :
                                                        "bg-slate-50/50 border-transparent text-slate-400"
                                                    )}
                                                    title={statusInfo.status}
                                                >
                                                    <span className="text-[10px] font-bold uppercase leading-tight">
                                                        {statusInfo.short === 'Fri' ? '' : statusInfo.short}
                                                    </span>
                                                    {isWork && (
                                                        <span className="text-[8px] opacity-70 font-medium">
                                                            {statusInfo.status.includes('Turnus') ? 'Turnus' : 'Plan'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
