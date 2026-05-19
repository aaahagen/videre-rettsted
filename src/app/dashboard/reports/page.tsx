'use client';

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState, useMemo } from "react";
import { Organization, DangerReport } from "@/lib/types";
import { firebaseDB } from "@/lib/firebase/database";
import { db } from "@/lib/firebase/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, MapPin, Clock, User as UserIcon, Loader2, ArrowRight, Lock } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/reports/image-uploader";
import { useSearch } from "@/hooks/use-search";

// Formatting helper
const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPP HH:mm', { locale: nb });
};

export default function ReportsPage() {
    const { dbUser, loading } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [reports, setReports] = useState<DangerReport[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const { query: searchQuery, setContext } = useSearch();

    const { toast } = useToast();
    
    // Resolution state
    const [resolvingReport, setResolvingReport] = useState<DangerReport | null>(null);
    const [resolutionNote, setResolutionNote] = useState('');
    const [resolutionImages, setResolutionImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setContext('Avviksrapporter', '');
    }, [setContext]);

    useEffect(() => {
        if (dbUser?.orgId) {
            firebaseDB.getOrganization(dbUser.orgId).then(setOrganization);
            
            // Real-time listener for reports
            const q = query(
                collection(db, 'reports'),
                where('orgId', '==', dbUser.orgId),
                orderBy('createdAt', 'desc')
            );
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedReports = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as DangerReport));
                setReports(fetchedReports);
                setIsLoadingReports(false);
            }, (error) => {
                console.error("Error fetching reports:", error);
                setIsLoadingReports(false);
            });

            return () => unsubscribe();
        }
    }, [dbUser]);

    const handleResolve = async () => {
        if (!resolvingReport || !dbUser) return;
        if (!resolutionNote.trim()) {
            toast({ title: "Mangler tekst", description: "Vennligst beskriv hvordan avviket ble løst.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            await firebaseDB.resolveReport(resolvingReport.id, resolutionNote, resolutionImages, dbUser.id);
            toast({ title: "Avvik løst", description: "Rapporten er markert som løst." });
            setResolvingReport(null);
            setResolutionNote('');
            setResolutionImages([]);
        } catch (error: any) {
            console.error(error);
            toast({ title: "Feil", description: "Kunne ikke lagre endringen.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayedReports = useMemo(() => {
        let result = [...reports];
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase().trim();
            result = result.filter(report => {
                const searchString = `
                    ${report.placeName} 
                    ${report.description} 
                    ${report.reportedByName} 
                    ${report.resolutionNote || ''}
                    ${formatDate(report.createdAt)}
                    ${report.resolvedAt ? formatDate(report.resolvedAt) : ''}
                `.toLowerCase();
                return searchString.includes(lowerQuery);
            });
        }
        return result;
    }, [reports, searchQuery]);

    if (loading || !organization) {
        return (
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48 mb-6" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    // Module Gating: If danger_reports module is disabled, show "Module Locked" state
    if (organization.modules?.danger_reports !== true) {
        return (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <Lock className="h-12 w-12 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Modulen er utilgjengelig</h2>
                <p className="max-w-md mx-auto">Avviksmodulen er ikke aktivert for din organisasjon. Ta kontakt med administrator for å oppgradere din plan.</p>
            </div>
        );
    }

    const openReports = displayedReports.filter(r => r.status === 'open');
    const resolvedReports = displayedReports.filter(r => r.status === 'resolved');

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden w-full">
            <div className="space-y-6 sm:space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline px-1">Avviksrapporter</h1>
                    <p className="text-muted-foreground px-1 mt-1 text-sm">Håndtering av rapporterte farer og avvik på leveringssteder.</p>
                </div>

                {isLoadingReports ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    </div>
                ) : displayedReports.length === 0 && searchQuery ? (
                     <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed">
                        <div className="rounded-full bg-slate-100 p-6 mb-4">
                            <AlertTriangle className="h-12 w-12 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Ingen rapporter matchet "{searchQuery}"
                        </h2>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* OPEN REPORTS */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Åpne Avvik ({openReports.length})
                            </h2>
                            {openReports.length === 0 ? (
                                <div className="p-8 text-center border border-dashed rounded-xl bg-slate-50 text-slate-500">
                                    {searchQuery ? "Ingen åpne avvik matchet søket." : "Ingen åpne avvik. Alt ser bra ut!"}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {openReports.map(report => (
                                        <Card key={report.id} className="border-2 border-orange-500/50 shadow-md shadow-orange-500/10 flex flex-col overflow-hidden">
                                            <CardHeader className="bg-orange-50/50 pb-4">
                                                <div className="flex justify-between items-start gap-2">
                                                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Åpent Avvik</Badge>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {formatDate(report.createdAt)}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-lg mt-2 font-bold text-slate-800">
                                                    <Link href={`/dashboard/places/${report.placeId}`} className="hover:underline flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4 text-slate-400" />
                                                        {report.placeName}
                                                    </Link>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4 flex-1 space-y-4">
                                                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    {report.description}
                                                </div>
                                                {report.images && report.images.length > 0 && (
                                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                                        {report.images.map((img, i) => (
                                                            <a href={img} target="_blank" rel="noreferrer" key={i} className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity">
                                                                <Image src={img} alt="Avviksbilde" fill className="object-cover" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                                    <UserIcon className="h-3 w-3" /> Meldt av: {report.reportedByName}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-0 pb-4 px-4">
                                                {(dbUser?.role === 'admin' || dbUser?.role === 'super_admin' || dbUser?.role === 'owner' || dbUser?.role === 'hms_responsible') ? (
                                                <Button 
                                                    className="w-full bg-orange-600 hover:bg-orange-700" 
                                                    onClick={() => setResolvingReport(report)}
                                                >
                                                    Løs Saken
                                                </Button>
                                                ) : (
                                                <Button 
                                                    variant="outline"
                                                    className="w-full" 
                                                    disabled
                                                >
                                                    Venter på utbedring fra Admin
                                                </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* RESOLVED REPORTS */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Løste Avvik ({resolvedReports.length})
                            </h2>
                            {resolvedReports.length === 0 ? (
                                <div className="p-8 text-center border border-dashed rounded-xl bg-slate-50 text-slate-500">
                                    {searchQuery ? "Ingen løste avvik matchet søket." : "Ingen historikk enda."}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {resolvedReports.map(report => (
                                        <Card key={report.id} className="border border-slate-200 flex flex-col overflow-hidden bg-slate-50/50">
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start gap-2">
                                                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Løst</Badge>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {formatDate(report.resolvedAt)}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-base mt-2 font-bold text-slate-800">
                                                    <Link href={`/dashboard/places/${report.placeId}`} className="hover:underline flex items-center gap-1.5">
                                                        <MapPin className="h-4 w-4 text-slate-400" />
                                                        {report.placeName}
                                                    </Link>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0 flex-1 space-y-4 text-sm">
                                                <div>
                                                    <p className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-1">Opprinnelig problem</p>
                                                    <p className="text-slate-600 line-clamp-2">{report.description}</p>
                                                </div>
                                                <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                                                    <p className="font-bold text-xs text-green-700 uppercase tracking-wider mb-1">Løsning</p>
                                                    <p className="text-slate-700">{report.resolutionNote}</p>
                                                    {report.resolutionImages && report.resolutionImages.length > 0 && (
                                                        <div className="flex gap-2 mt-2">
                                                            {report.resolutionImages.map((img, i) => (
                                                                <a href={img} target="_blank" rel="noreferrer" key={i} className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity">
                                                                    <Image src={img} alt="Løsningsbilde" fill className="object-cover" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            {/* RESOLUTION MODAL */}
            <Dialog open={!!resolvingReport} onOpenChange={(open) => !open && setResolvingReport(null)}>
                <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            Marker som løst
                        </DialogTitle>
                        <DialogDescription>
                            Hvordan ble avviket på <strong>{resolvingReport?.placeName}</strong> utbedret?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="bg-slate-50 p-3 rounded-lg border text-sm text-slate-600 mb-4">
                            <strong>Opprinnelig melding:</strong><br/>
                            {resolvingReport?.description}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold">Løsningsbeskrivelse</label>
                            <Textarea
                                placeholder="F.eks. Strødd salt på rampen, fjernet paller..."
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold">Bildebevis (Valgfritt)</label>
                            {dbUser?.orgId && (
                                <ImageUploader 
                                    orgId={dbUser.orgId} 
                                    onImagesChange={setResolutionImages} 
                                    maxImages={2} 
                                />
                            )}
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-end gap-2">
                        <Button variant="outline" onClick={() => setResolvingReport(null)} disabled={isSubmitting}>
                            Avbryt
                        </Button>
                        <Button onClick={handleResolve} disabled={isSubmitting || !resolutionNote.trim()} className="bg-green-600 hover:bg-green-700 text-white">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Lagre som løst
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}