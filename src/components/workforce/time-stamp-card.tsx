'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Play, Square, Loader2, CheckCircle2 } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase/database';
import { WorkLog, User } from '@/lib/types';
import { format, differenceInSeconds } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/use-geolocation';
import { cn } from '@/lib/utils';

interface TimeStampCardProps {
    user: User;
}

export function TimeStampCard({ user }: TimeStampCardProps) {
    const { toast } = useToast();
    const { coordinates, error: geoError, loading: loadingGeo, getPosition } = useGeolocation();
    const [activeWorkLog, setActiveWorkLog] = useState<WorkLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

    useEffect(() => {
        loadActiveWorkLog();
    }, [user.id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeWorkLog && activeWorkLog.actualPunchIn) {
            const startTime = new Date(activeWorkLog.actualPunchIn);
            interval = setInterval(() => {
                const now = new Date();
                const diff = differenceInSeconds(now, startTime);
                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = diff % 60;
                setElapsedTime(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeWorkLog]);

    const loadActiveWorkLog = async () => {
        try {
            setIsLoading(true);
            const logs = await firebaseDB.getWorkLogsForDriver(user.id);
            const active = logs.find(log => log.status === 'active');
            setActiveWorkLog(active || null);
        } catch (error) {
            console.error("Failed to load active work log", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartShift = async () => {
        setIsProcessing(true);
        try {
            // Request fresh location
            const loc = await getPosition();
            
            const newLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'> = {
                orgId: user.orgId,
                driverId: user.id,
                actualPunchIn: new Date().toISOString(),
                entryMethod: 'gps_stamp',
                punchInLocation: loc ? { lat: loc.lat, lng: loc.lng } : undefined,
                status: 'active',
            };

            const createdLog = await firebaseDB.createWorkLog(newLog);
            setActiveWorkLog(createdLog);
            toast({
                title: "Vakt startet",
                description: "Din arbeidstid logges nå.",
            });
        } catch (error: any) {
            toast({
                title: "Kunne ikke starte vakt",
                description: error.message || "Sjekk at du har gitt tilgang til posisjon.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEndShift = async () => {
        if (!activeWorkLog) return;
        setIsProcessing(true);
        try {
            const loc = await getPosition();
            const now = new Date().toISOString();
            
            await firebaseDB.updateWorkLog(activeWorkLog.id, {
                actualPunchOut: now,
                punchOutLocation: loc ? { lat: loc.lat, lng: loc.lng } : undefined,
                status: 'pending_review',
            });

            setActiveWorkLog(null);
            setElapsedTime('00:00:00');
            toast({
                title: "Vakt avsluttet",
                description: "Din arbeidstid er sendt til godkjenning.",
            });
        } catch (error: any) {
            toast({
                title: "Kunne ikke avslutte vakt",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "border-slate-200 shadow-md overflow-hidden transition-all duration-300",
            activeWorkLog ? "ring-2 ring-primary ring-offset-2" : ""
        )}>
            <CardHeader className="pb-2 bg-slate-50/50 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "p-2 rounded-full",
                            activeWorkLog ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                        )}>
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Arbeidstid</CardTitle>
                            <CardDescription>
                                {activeWorkLog ? 'Vakt pågår' : 'Ingen aktiv vakt'}
                            </CardDescription>
                        </div>
                    </div>
                    {activeWorkLog && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs font-bold font-mono tracking-tighter">LIVE</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-6">
                    {activeWorkLog ? (
                        <>
                            <div className="text-5xl font-black font-mono tracking-tighter text-slate-900 tabular-nums">
                                {elapsedTime}
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Startet</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {format(new Date(activeWorkLog.actualPunchIn!), 'HH:mm', { locale: nb })}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lokasjon</p>
                                    <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                                        <MapPin className="h-3 w-3 text-primary" />
                                        <span>Logget</span>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                variant="destructive" 
                                size="lg" 
                                className="w-full h-14 text-lg font-bold shadow-lg"
                                onClick={handleEndShift}
                                disabled={isProcessing}
                            >
                                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Square className="mr-2 h-5 w-5 fill-current" />}
                                Avslutt Vakt
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="text-center space-y-2">
                                <p className="text-slate-500 text-sm font-medium">Klar for å starte dagen?</p>
                                <p className="text-xs text-slate-400 max-w-[200px]">Din posisjon og tidspunkt logges når du starter vakten.</p>
                            </div>
                            <Button 
                                size="lg" 
                                className="w-full h-14 text-lg font-bold shadow-lg"
                                onClick={handleStartShift}
                                disabled={isProcessing}
                            >
                                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                                Start Vakt
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
