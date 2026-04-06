'use client';

import { useState, useEffect } from 'react';
import { firebaseDB } from '@/lib/firebase/database';
import { WorkLog, DriverProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, MapPin, Clock, Loader2, User as UserIcon, Calendar, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TimeApprovalsProps {
    orgId: string;
    drivers: DriverProfile[];
}

export function TimeApprovals({ orgId, drivers }: TimeApprovalsProps) {
    const { toast } = useToast();
    const [pendingLogs, setPendingLogs] = useState<WorkLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadPendingLogs();
    }, [orgId]);

    const loadPendingLogs = async () => {
        try {
            setIsLoading(true);
            // Fetch both pending_review and needs_overtime_approval
            const pending = await firebaseDB.getWorkLogsForOrganization(orgId, 'pending_review');
            const overtime = await firebaseDB.getWorkLogsForOrganization(orgId, 'needs_overtime_approval');
            
            // Combine and sort by punch in time
            const all = [...pending, ...overtime].sort((a, b) => 
                new Date(b.actualPunchIn!).getTime() - new Date(a.actualPunchIn!).getTime()
            );
            
            setPendingLogs(all);
        } catch (error) {
            console.error("Failed to load pending work logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'approved' | 'declined') => {
        setProcessingId(id);
        try {
            await firebaseDB.updateWorkLog(id, { status });
            setPendingLogs(prev => prev.filter(log => log.id !== id));
            toast({
                title: status === 'approved' ? "Vakt godkjent" : "Vakt avvist",
                description: `Tidsloggen ble markert som ${status === 'approved' ? 'godkjent' : 'avvist'}.`,
            });
        } catch (error: any) {
            toast({
                title: "Handling feilet",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
    }

    if (pendingLogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Check className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">Ingen ventende godkjenninger</p>
                <p className="text-slate-400 text-xs mt-1">Alle tidslogger er behandlet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {pendingLogs.map(log => {
                const driver = drivers.find(d => d.id === log.driverId);
                const punchIn = log.actualPunchIn ? new Date(log.actualPunchIn) : null;
                const punchOut = log.actualPunchOut ? new Date(log.actualPunchOut) : null;
                
                const durationMinutes = (punchIn && punchOut) ? differenceInMinutes(punchOut, punchIn) : 0;
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;

                return (
                    <Card key={log.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row">
                            {/* Driver Info */}
                            <div className="p-4 sm:w-1/3 bg-slate-50/50 border-b sm:border-b-0 sm:border-r border-slate-100 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                    <UserIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{driver?.name || 'Ukjent sjåfør'}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {punchIn ? format(punchIn, 'eeee d. MMMM', { locale: nb }) : 'Ingen dato'}
                                    </p>
                                </div>
                            </div>

                            {/* Time Info */}
                            <div className="p-4 flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Inn</p>
                                            <p className="font-mono font-bold text-slate-700">{punchIn ? format(punchIn, 'HH:mm') : '--:--'}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300" />
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Ut</p>
                                            <p className="font-mono font-bold text-slate-700">{punchOut ? format(punchOut, 'HH:mm') : '--:--'}</p>
                                        </div>
                                    </div>
                                    <Separator orientation="vertical" className="h-8" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Varighet</p>
                                        <p className="font-bold text-primary">{hours}t {minutes}m</p>
                                    </div>
                                    {log.status === 'needs_overtime_approval' && (
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 ml-auto">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Overtid?
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {log.punchInLocation && (
                                        <a 
                                            href={`https://www.google.com/maps?q=${log.punchInLocation.lat},${log.punchInLocation.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded"
                                        >
                                            <MapPin className="h-3 w-3" />
                                            Start-posisjon
                                            <ExternalLink className="h-2 w-2" />
                                        </a>
                                    )}
                                    {log.punchOutLocation && (
                                        <a 
                                            href={`https://www.google.com/maps?q=${log.punchOutLocation.lat},${log.punchOutLocation.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded"
                                        >
                                            <MapPin className="h-3 w-3" />
                                            Slutt-posisjon
                                            <ExternalLink className="h-2 w-2" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-slate-50/30 border-t sm:border-t-0 sm:border-l border-slate-100 flex sm:flex-col justify-center gap-2">
                                <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                    onClick={() => handleAction(log.id, 'approved')}
                                    disabled={processingId === log.id}
                                >
                                    {processingId === log.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                                    Godkjenn
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-destructive border-destructive/20 hover:bg-destructive/10 flex-1"
                                    onClick={() => handleAction(log.id, 'declined')}
                                    disabled={processingId === log.id}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Avvis
                                </Button>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

function Separator({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical', className?: string }) {
    return (
        <div className={cn(
            "bg-slate-200",
            orientation === 'horizontal' ? "h-[1px] w-full" : "w-[1px] h-full",
            className
        )} />
    );
}
