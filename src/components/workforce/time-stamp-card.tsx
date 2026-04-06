'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Play, Square, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase/database';
import { WorkLog, User, DriverProfile, Organization } from '@/lib/types';
import { format, differenceInSeconds } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/use-geolocation';
import { cn } from '@/lib/utils';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


interface TimeStampCardProps {
    user: User;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

export function TimeStampCard({ user }: TimeStampCardProps) {
    const { toast } = useToast();
    const { coordinates, error: geoError, loading: loadingGeo, getPosition } = useGeolocation();
    const [activeWorkLog, setActiveWorkLog] = useState<WorkLog | null>(null);
    const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmStartOpen, setConfirmStartOpen] = useState(false);
    const [confirmEndOpen, setConfirmEndOpen] = useState(false);
    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
    
    const [distanceToDepot, setDistanceToDepot] = useState<number | null>(null);
    const [isOutOfRange, setIsOutOfRange] = useState(false);

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [logsSnap, profile, org] = await Promise.all([
                getDocs(query(collection(db, 'workLogs'), where('driverId', '==', user.id), where('status', '==', 'active'), limit(1))),
                firebaseDB.getUser(user.id) as Promise<DriverProfile>,
                firebaseDB.getOrganization(user.orgId)
            ]);

            if (!logsSnap.empty) {
                setActiveWorkLog({ id: logsSnap.docs[0].id, ...logsSnap.docs[0].data() } as WorkLog);
            } else {
                setActiveWorkLog(null);
            }
            setDriverProfile(profile);
            setOrganization(org);
        } catch (error) {
            console.error("Failed to load operational data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Geofencing Check Effect
    useEffect(() => {
        if (!coordinates || !driverProfile || (!organization?.mainDepot && !driverProfile.baseLocation)) {
            setIsOutOfRange(false);
            return;
        }

        // 1. Determine target (Profile base override or Org main depot)
        const target = driverProfile.baseLocation || organization?.mainDepot;
        if (!target?.coordinates?.lat || !target?.coordinates?.lng) {
            setIsOutOfRange(false);
            return;
        }

        // 2. Calculate distance
        const dist = calculateDistance(
            coordinates.lat, 
            coordinates.lng, 
            target.coordinates.lat, 
            target.coordinates.lng
        );
        
        setDistanceToDepot(dist);
        
        // 3. Enforce if required
        const isFlexible = driverProfile.timeTrackingMethod === 'flexible_location';
        if (!isFlexible) {
            const allowedRadius = target.radius || 500;
            setIsOutOfRange(dist > allowedRadius);
        } else {
            setIsOutOfRange(false);
        }
    }, [coordinates, driverProfile, organization]);

    // Timer Effect
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

    const handleStartShift = () => setConfirmStartOpen(true);
    const executeStartShift = async () => {
        setConfirmStartOpen(false);
        setIsProcessing(true);
        try {
            const loc = await getPosition();
            
            const newLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'> = {
                orgId: user.orgId,
                driverId: user.id,
                actualPunchIn: new Date().toISOString(),
                entryMethod: driverProfile?.timeTrackingMethod === 'flexible_location' ? 'gps_stamp' : 'geofence',
                punchInLocation: loc ? { lat: loc.lat, lng: loc.lng } : undefined,
                status: 'active',
            };

            const createdLog = await firebaseDB.createWorkLog(newLog);
            setActiveWorkLog(createdLog);
            toast({ title: "Vakt startet", description: "Din arbeidstid logges nå." });
        } catch (error: any) {
            toast({
                title: "Kunne ikke starte vakt",
                description: error.message || "Sjekk posisjonstilgang.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEndShift = () => setConfirmEndOpen(true);
    const executeEndShift = async () => {
        setConfirmEndOpen(false);
        if (!activeWorkLog) return;
        setIsProcessing(true);
        try {
            const loc = await getPosition();
            await firebaseDB.updateWorkLog(activeWorkLog.id, {
                actualPunchOut: new Date().toISOString(),
                punchOutLocation: loc ? { lat: loc.lat, lng: loc.lng } : undefined,
                status: 'pending_review',
            });
            setActiveWorkLog(null);
            setElapsedTime('00:00:00');
            toast({ title: "Vakt avsluttet", description: "Arbeidstid er sendt til godkjenning." });
        } catch (error: any) {
            toast({ title: "Feil", description: error.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <Card className="border-slate-200 shadow-sm"><CardContent className="p-6 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></CardContent></Card>;
    }

    return (
        <>
            <AlertDialog open={confirmStartOpen} onOpenChange={setConfirmStartOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Start Vakt?</AlertDialogTitle>
                        <AlertDialogDescription>Er du sikker på at du vil starte arbeidstiden din nå? Tiden vil begynne å løpe umiddelbart.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction onClick={executeStartShift} className="bg-green-600 hover:bg-green-700">Ja, start vakt</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Avslutt Vakt?</AlertDialogTitle>
                        <AlertDialogDescription>Er du sikker på at du vil avslutte vakten din? Timene vil bli sendt til godkjenning hos en administrator som også kan korrigere tiden hvis det skjedde en feil.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction onClick={executeEndShift} className="bg-destructive hover:bg-destructive/90">Ja, avslutt vakt</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        <Card className={cn("border-slate-200 shadow-md overflow-hidden transition-all duration-300", activeWorkLog ? "ring-2 ring-primary ring-offset-2" : "")}>
            <CardHeader className="pb-2 bg-slate-50/50 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-full", activeWorkLog ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400")}>
                            <Clock className="h-5 w-5" />
                        </div>
                        <div><CardTitle className="text-lg">Arbeidstid</CardTitle><CardDescription>{activeWorkLog ? 'Vakt pågår' : 'Klar til å starte?'}</CardDescription></div>
                    </div>
                    {activeWorkLog && <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 animate-pulse"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs font-bold font-mono tracking-tighter">LIVE</span></div>}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-6">
                    {activeWorkLog ? (
                        <>
                            <div className="text-5xl font-black font-mono tracking-tighter text-slate-900 tabular-nums">{elapsedTime}</div>
                            <Button variant="destructive" size="lg" className="w-full h-14 text-lg font-bold shadow-lg" onClick={handleEndShift} disabled={isProcessing}><Square className="mr-2 h-5 w-5 fill-current" /> Avslutt Vakt</Button>
                        </>
                    ) : (
                        <>
                            <div className="w-full space-y-4">
                                {isOutOfRange && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-800 font-medium">
                                            Du er for langt unna depotet ({Math.round(distanceToDepot || 0)}m). 
                                            Du må være innenfor {driverProfile?.baseLocation?.radius || organization?.mainDepot?.radius || 500}m for å stemple inn.
                                        </div>
                                    </div>
                                )}
                                <Button 
                                    size="lg" 
                                    className="w-full h-14 text-lg font-bold shadow-lg" 
                                    onClick={handleStartShift} 
                                    disabled={isProcessing || isOutOfRange}
                                >
                                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                                    Start Vakt
                                </Button>
                                {!coordinates && !loadingGeo && (
                                    <p className="text-[10px] text-center text-slate-400 italic">Vi trenger tilgang til posisjon for å aktivere stempling.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
        </>
    );
}