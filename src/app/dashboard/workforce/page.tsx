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
import { Users, Loader2, Search, Printer, User as UserIcon, FileText, Edit, CalendarDays, UserCheck, Activity, Palmtree, Coffee, Briefcase , ChevronDown, ChevronUp, MapPin, Phone, AlertCircle, Heart, Baby, CalendarClock, StickyNote, Hash, Building2, UserCircle2, ShieldCheck, LayoutGrid, List, ClipboardCheck, Download, Shield, Landmark, Banknote, BookOpenCheck } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DriverProfileForm } from '@/components/workforce/driver-profile-form';
import { useToast } from '@/hooks/use-toast';
import { useSearch } from '@/hooks/use-search';
import { WorkforceTimeline } from "@/components/workforce/workforce-timeline";
import { TimeApprovals } from "@/components/workforce/time-approvals";
import { getDriverStatus } from "@/lib/workforce-utils";
import { saveAs } from 'file-saver';
import { logEvent } from '@/lib/db/logs';

/**
 * WorkforcePage er den sentrale modulen for HR og personellhåndtering.
 * 
 * Siden tillater administratorer å:
 * - Få oversikt over ansattes status (På jobb, Sykemeldt, Ferie, etc.) for en gitt dato.
 * - Administrere ansattprofiler (Kontrakter, kompetanse, personopplysninger).
 * - Overvåke samsvar (Compliance) for sjåførkort-nedlastinger.
 * - Godkjenne timelister og overtid (TimeApprovals).
 * - Se visuell tidslinje over vakter (WorkforceTimeline).
 * - Eksportere GDPR-sensitive personopplysninger til CSV (Audit-logget).
 * 
 * Sikkerhet:
 * - All tilgang til utvidede ansattkort logges automatisk i audit-trail.
 * - Eksport av data logges med hendelsestype 'export_hr_data'.
 */
export default function WorkforcePage() {
    const { dbUser } = useAuth();
    const { toast } = useToast();
    const { query: searchQuery, setContext } = useSearch();
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [searchDateStr, setSearchDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [viewMode, setViewMode] = useState<'cards' | 'timeline' | 'approvals'>('cards');
    
    const [editingDriverProfile, setEditingDriverProfile] = useState<DriverProfile | null>(null);
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    
    useEffect(() => {
        setContext('Personell', '/dashboard/admin'); 
        return () => setContext('Steder', '/dashboard/new');
    }, [setContext]);

    useEffect(() => {
        if (dbUser?.orgId) {
            loadDrivers();
        }
    }, [dbUser]);

    /**
     * Henter alle brukere i organisasjonen og filtrerer ut operasjonelt personell.
     */
    const loadDrivers = async () => {
        try {
            setIsLoading(true);
            const users = await firebaseDB.getUsers(dbUser!.orgId);
            setDrivers(users.filter(u => u.role === 'driver' || u.role === 'contractor') as DriverProfile[]);
        } catch (error) {
            console.error("Failed to load drivers", error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Lagrer endringer i en ansattprofil.
     * 
     * @param data - De oppdaterte profilfeltene.
     */
    const handleUpdateDriverProfile = async (data: Partial<DriverProfile>) => {
        if (!editingDriverProfile) return;
        try {
            await firebaseDB.updateUser(editingDriverProfile.id, data);
            toast({
                title: "Profil oppdatert",
                description: "Profilen ble lagret.",
            });
            setEditingDriverProfile(null);
            loadDrivers(); 
            setTimeout(() => { document.body.style.pointerEvents = ''; }, 300);
        } catch (error: any) {
            toast({
                title: "Feil ved oppdatering",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    /**
     * Registrerer at en fysisk nedlasting av sjåførkort har funnet sted i dag.
     * 
     * @param driver - Den ansatte det gjelder.
     */
    const handleRegisterDownload = async (driver: DriverProfile) => {
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            await firebaseDB.updateUser(driver.id, { lastTachoDownloadDate: today });
            
            if (dbUser) {
                await logEvent(dbUser.orgId, dbUser.id, 'admin_view_worklog', {
                    action: 'register_tacho_download',
                    targetUserId: driver.id,
                    targetUserName: driver.name
                });
            }

            toast({ title: "Nedlasting registrert", description: "Sjåførkort-nedlasting er oppdatert til i dag." });
            loadDrivers();
        } catch (error) {
            toast({ title: "Feil", description: "Kunne ikke registrere nedlasting.", variant: "destructive" });
        }
    };

    /**
     * Håndterer utvidelse av personellkort og logger innsyn i sensitive data.
     * 
     * @param driver - Den ansatte som vises.
     */
    const handleToggleCard = async (driver: DriverProfile) => {
        const isExpanding = !expandedCards[driver.id];
        setExpandedCards(prev => ({ ...prev, [driver.id]: isExpanding }));
        
        // GDPR LOGGING: Logg innsyn i sensitive personopplysninger
        if (isExpanding && dbUser && (dbUser.role === 'admin' || dbUser.role === 'owner' || dbUser.role === 'super_admin')) {
            await logEvent(dbUser.orgId, dbUser.id, 'view_sensitive_personnel_data', {
                targetUserId: driver.id,
                targetUserName: driver.name
            });
        }
    };

    /**
     * Eksporterer hele personell-listen til CSV-format.
     * Handlingen loggføres som en kritisk GDPR-hendelse.
     */
    const handleExportCSV = async () => {
        if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'owner' && dbUser.role !== 'super_admin')) return;
        
        setIsExporting(true);
        try {
            await logEvent(dbUser.orgId, dbUser.id, 'export_hr_data');

            const headers = [
                "Navn", "E-post", "Telefon", "Rolle", "Ansatt Type", "Status",
                "Ansattnummer", "Stilling", "Avdeling", "Nærmeste Leder", "Ansatt Siden",
                "Fødselsdato", "Personnummer", "Timelønn", "Bankkonto", "Skattekort",
                "Adresse", "Nødkontakt", "Pårørende", "Kompetanse", "Sist nedlasting sjåførkort"
            ];

            const escapeField = (field: string | number | undefined | null) => {
                if (field === null || field === undefined) return '';
                const str = String(field);
                return `"${str.replace(/"/g, '""')}"`;
            };

            const csvContent = [
                headers.join(";"),
                ...drivers.map(d => [
                    escapeField(d.name),
                    escapeField(d.email),
                    escapeField(d.phone),
                    escapeField(d.role === 'contractor' ? 'Innleid' : 'Fast'),
                    escapeField(d.employmentStatus === 'full-time' ? 'Heltid' : d.employmentStatus === 'part-time' ? 'Deltid' : d.employmentStatus === 'temporary' ? 'Midlertidig' : d.employmentStatus),
                    escapeField(d.disabled ? 'Deaktivert' : (d.status === 'paused' ? 'Pauset' : 'Aktiv')),
                    escapeField(d.employeeId),
                    escapeField(d.jobTitle),
                    escapeField(d.department),
                    escapeField(d.supervisor),
                    escapeField(d.seniorityDate ? format(new Date(d.seniorityDate), 'dd.MM.yyyy') : ''),
                    escapeField(d.dateOfBirth ? format(new Date(d.dateOfBirth), 'dd.MM.yyyy') : ''),
                    escapeField(d.socialSecurityNumber),
                    escapeField(d.hourlyRate),
                    escapeField(d.bankAccountNumber),
                    escapeField(d.taxCode),
                    escapeField(d.address),
                    escapeField(d.emergencyContact),
                    escapeField(d.nextOfKin),
                    escapeField([...(d.certifications || []), ...(d.skills || [])].join(', ')),
                    escapeField(d.lastTachoDownloadDate || 'Aldri')
                ].join(";"))
            ].join("\n");

            const BOM = "\uFEFF";
            const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, `personell-eksport-${format(new Date(), 'yyyy-MM-dd')}.csv`);

            toast({
                title: "Eksport fullført",
                description: "Personell-listen er lastet ned som CSV-fil. Handlingen er loggført.",
            });
        } catch (error: any) {
            console.error("Export error:", error);
            toast({
                title: "Eksport feilet",
                description: "Kunne ikke generere eksportfil.",
                variant: "destructive"
            });
        } finally {
            setIsExporting(false);
        }
    };

    
    const safeQuery = (searchQuery || '').toLowerCase();
    const filteredDrivers = drivers.filter(d => {
        const matchesName = d.name?.toLowerCase().includes(safeQuery) || false;
        const matchesEmail = d.email?.toLowerCase().includes(safeQuery) || false;
        const matchesPhone = d.phone?.toLowerCase().includes(safeQuery) || false;
        const matchesCert = d.certifications?.some(c => c.toLowerCase().includes(safeQuery)) || false;
        const matchesSkill = d.skills?.some(s => s.toLowerCase().includes(safeQuery)) || false;

        return matchesName || matchesEmail || matchesPhone || matchesCert || matchesSkill;
    });

    let searchDate = new Date();
    if (searchDateStr) {
        const [year, month, day] = searchDateStr.split('-');
        if (year && month && day) {
            searchDate = new Date(Number(year), Number(month) - 1, Number(day));
        }
    }

    /**
     * Beregner aggregerte personell-statistikker for dashbordet.
     */
    const stats = useMemo(() => {
        let working = 0;
        let sick = 0;
        let vacation = 0;
        let off = 0;
        let contractors = 0;
        let other = 0;

        drivers.forEach(driver => {
            if (driver.role === 'contractor' || driver.employmentType === 'external') {
                contractors++;
            }
            
            const statusInfo = getDriverStatus(driver, searchDate);
            if (statusInfo.type === 'working') working++;
            else if (statusInfo.type === 'sick') sick++;
            else if (statusInfo.type === 'vacation') vacation++;
            else if (statusInfo.type === 'off') off++;
            else if (statusInfo.type === 'other') other++;
        });

        return { working, sick, vacation, off, contractors, other, total: drivers.length };
    }, [drivers, searchDate]);

    /**
     * Hjelpefunksjon for å bestemme visuell status for sjåførkort-nedlasting.
     */
    const getCardDownloadStatus = (dateStr?: string) => {
        if (!dateStr) return 'missing';
        try {
            const date = parseISO(dateStr);
            const today = new Date();
            const daysSince = differenceInDays(today, date);
            
            if (daysSince > 28) return 'expired';
            if (daysSince > 21) return 'warning';
            return 'ok';
        } catch (e) {
            return 'missing';
        }
    };

    if (isLoading && drivers.length === 0) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <>
            <div className="print:hidden mx-auto w-full max-w-7xl px-4 py-8 space-y-6">
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

                    <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button variant={viewMode === "cards" ? "default" : "ghost"} size="sm" onClick={() => setViewMode('cards')} className={cn("h-8 px-3 text-xs font-medium", viewMode === 'cards' && "shadow-sm")}>
                            <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />Kort
                        </Button>
                        <Button variant={viewMode === "timeline" ? "default" : "ghost"} size="sm" onClick={() => setViewMode('timeline')} className={cn("h-8 px-3 text-xs font-medium", viewMode === 'timeline' && "shadow-sm")}>
                            <List className="h-3.5 w-3.5 mr-1.5" />Tidslinje
                        </Button>
                        {dbUser?.role === 'admin' && (
                            <>
                                <Button variant={viewMode === "approvals" ? "default" : "ghost"} size="sm" onClick={() => setViewMode('approvals')} className={cn("h-8 px-3 text-xs font-medium", viewMode === 'approvals' && "shadow-sm")}>
                                    <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />Godkjenninger
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting || drivers.length === 0} className="h-8 px-3 text-xs font-medium ml-2 bg-white">
                                    {isExporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}Eksport (CSV)
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
                    <StatusStatCard icon={<UserCheck className="h-5 w-5 text-blue-600"/>} value={stats.working} label="På jobb" color="blue" />
                    <StatusStatCard icon={<Activity className="h-5 w-5 text-red-600"/>} value={stats.sick} label="Syk" color="red" />
                    <StatusStatCard icon={<Palmtree className="h-5 w-5 text-green-600"/>} value={stats.vacation} label="Ferie" color="green" />
                    <StatusStatCard icon={<Coffee className="h-5 w-5 text-slate-500"/>} value={stats.off} label="Fridag" color="slate" />
                    <StatusStatCard icon={<Shield className="h-5 w-5 text-purple-600"/>} value={stats.other} label="Annet" color="purple" />
                    <StatusStatCard icon={<Briefcase className="h-5 w-5 text-amber-600"/>} value={stats.contractors} label="Innleid" color="amber" />
                </div>


                {viewMode === 'approvals' ? (
                    <TimeApprovals orgId={dbUser!.orgId} drivers={drivers} />
                ) : viewMode === 'cards' ? (
                    <>
                        <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="space-y-2 w-full sm:w-auto max-w-full">
                                <Label className="text-sm font-semibold text-slate-700">Velg dato for oversikt</Label>
                                <Input type="date" value={searchDateStr} onChange={(e) => setSearchDateStr(e.target.value)} className="w-full sm:w-[240px] bg-slate-50 border-slate-300" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDrivers.map(driver => {
                                const statusInfo = getDriverStatus(driver, searchDate);
                                const cardStatus = getCardDownloadStatus(driver.lastTachoDownloadDate);
                                const isExpanded = !!expandedCards[driver.id];

                                return (
                                    <Card key={driver.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className={`h-1.5 w-full ${statusInfo.type === 'working' ? 'bg-blue-500' : statusInfo.type === 'sick' ? 'bg-red-500' : statusInfo.type === 'vacation' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        
                                        <CardHeader className="pb-3 flex flex-row items-start gap-4">
                                            <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                                                {(driver.images && driver.images.length > 0) ? (
                                                    <Image src={driver.images[0].url} alt={driver.name} fill sizes="56px" className="object-cover" />
                                                ) : <UserIcon className="h-6 w-6 text-slate-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg font-bold truncate">{driver.name}</CardTitle>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className={driver.employmentType === 'external' ? "bg-amber-50" : "bg-slate-50"}>{driver.role === 'contractor' ? 'Innleid' : 'Fast'}</Badge>
                                                    {cardStatus !== 'ok' && <Badge variant="destructive" className="text-[8px] uppercase">Sjåførkort</Badge>}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0 flex-grow">
                                            <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-2.5 rounded-lg border flex flex-col items-center justify-center text-center cursor-pointer relative" onClick={() => handleToggleCard(driver)}>
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Status {format(searchDate, 'dd.MM')}</span>
                                                <Badge variant="outline" className={cn("text-sm py-1 font-medium mt-1", statusInfo.color)}>{statusInfo.status}</Badge>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                                                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                                                    {/* Compliance Section */}
                                                    <div className="p-3 rounded-lg border-2 border-indigo-50 bg-indigo-50/20 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Sjåførkort</p>
                                                            <p className={cn("text-xs font-black", cardStatus === 'expired' ? "text-red-600" : "text-slate-700")}>
                                                                {driver.lastTachoDownloadDate ? format(parseISO(driver.lastTachoDownloadDate), 'dd. MMM yy', { locale: nb }) : 'Aldri'}
                                                            </p>
                                                        </div>
                                                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold bg-white" onClick={() => handleRegisterDownload(driver)}>
                                                            <Download className="h-3 w-3 mr-1" />Registrer
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2">
                                                        {driver.phone && <div className="flex items-center gap-2 text-xs"><Phone className="h-3 w-3 text-slate-400" />{driver.phone}</div>}
                                                        {driver.employeeId && <div className="flex items-center gap-2 text-xs"><Hash className="h-3 w-3 text-slate-400" />ID: {driver.employeeId}</div>}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <WorkforceTimeline drivers={filteredDrivers} onEditDriver={setEditingDriverProfile} />
                )}

                <Dialog open={!!editingDriverProfile} onOpenChange={(open) => !open && setEditingDriverProfile(null)}>
                <DialogContent className="max-w-6xl w-[95vw] rounded-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Rediger profil</DialogTitle>
                        <DialogDescription>Oppdater arbeidstid og personalia.</DialogDescription>
                    </DialogHeader>
                    {editingDriverProfile && <DriverProfileForm user={editingDriverProfile} onSubmit={handleUpdateDriverProfile} onCancel={() => setEditingDriverProfile(null)} />}
                </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

function StatusStatCard({ icon, value, label, color }: { icon: any, value: number, label: string, color: string }) {
    const bgClasses: any = { blue: "bg-blue-50", red: "bg-red-50", green: "bg-green-50", slate: "bg-slate-50", purple: "bg-purple-50", amber: "bg-amber-50" };
    return (
        <Card className={cn("shadow-sm border-none", bgClasses[color])}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                {icon}
                <p className="text-2xl font-black mt-1">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{label}</p>
            </CardContent>
        </Card>
    );
}
