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
     */
    const handleUpdateDriverProfile = async (data: Partial<DriverProfile>) => {
        if (!editingDriverProfile) return;
        try {
            await firebaseDB.updateUser(editingDriverProfile.id, data);
            toast({ title: "Profil oppdatert" });
            setEditingDriverProfile(null);
            loadDrivers(); 
        } catch (error: any) {
            toast({ title: "Feil", description: error.message, variant: "destructive" });
        }
    };

    /**
     * Registrerer at en fysisk nedlasting av sjåførkort har funnet sted i dag.
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
            toast({ title: "Nedlasting registrert" });
            loadDrivers();
        } catch (error) {
            toast({ title: "Feil", variant: "destructive" });
        }
    };

    /**
     * Håndterer utvidelse av personellkort og logger innsyn i sensitive data.
     */
    const handleToggleCard = async (driver: DriverProfile) => {
        const isExpanding = !expandedCards[driver.id];
        setExpandedCards(prev => ({ ...prev, [driver.id]: isExpanding }));
        
        if (isExpanding && dbUser && (dbUser.role === 'admin' || dbUser.role === 'owner' || dbUser.role === 'super_admin')) {
            await logEvent(dbUser.orgId, dbUser.id, 'view_sensitive_personnel_data', {
                targetUserId: driver.id,
                targetUserName: driver.name
            });
        }
    };

    /**
     * Eksporterer hele personell-listen til CSV-format (GDPR logget).
     */
    const handleExportCSV = async () => {
        if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'owner' && dbUser.role !== 'super_admin')) return;
        setIsExporting(true);
        try {
            await logEvent(dbUser.orgId, dbUser.id, 'export_hr_data');
            const headers = ["Navn", "E-post", "Telefon", "Rolle", "Status", "Ansattnummer", "Stilling", "Avdeling", "Sist nedlasting"];
            const escape = (f: any) => f ? `"${String(f).replace(/"/g, '""')}"` : '""';
            const csv = [headers.join(";"), ...drivers.map(d => [escape(d.name), escape(d.email), escape(d.phone), escape(d.role), escape(d.status), escape(d.employeeId), escape(d.jobTitle), escape(d.department), escape(d.lastTachoDownloadDate)].join(";"))].join("\n");
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, `personell-${format(new Date(), 'yyyy-MM-dd')}.csv`);
            toast({ title: "Eksport fullført" });
        } catch (e) {
            toast({ title: "Feil", variant: "destructive" });
        } finally { setIsExporting(false); }
    };

    const safeQuery = (searchQuery || '').toLowerCase();
    const filteredDrivers = drivers.filter(d => (d.name?.toLowerCase().includes(safeQuery) || d.email.toLowerCase().includes(safeQuery)));
    
    let searchDate = new Date();
    if (searchDateStr) {
        const [year, month, day] = searchDateStr.split('-');
        searchDate = new Date(Number(year), Number(month) - 1, Number(day));
    }

    const stats = useMemo(() => {
        let working = 0, sick = 0, vacation = 0, off = 0, contractors = 0, other = 0;
        drivers.forEach(d => {
            if (d.role === 'contractor') contractors++;
            const si = getDriverStatus(d, searchDate);
            if (si.type === 'working') working++;
            else if (si.type === 'sick') sick++;
            else if (si.type === 'vacation') vacation++;
            else if (si.type === 'off') off++;
            else other++;
        });
        return { working, sick, vacation, off, contractors, other, total: drivers.length };
    }, [drivers, searchDate]);

    const getCardDownloadStatus = (dateStr?: string) => {
        if (!dateStr) return 'missing';
        const days = differenceInDays(new Date(), parseISO(dateStr));
        if (days > 28) return 'expired';
        if (days > 21) return 'warning';
        return 'ok';
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><Users className="h-8 w-8 text-primary" />Personelloversikt</h1>
                    <p className="text-muted-foreground mt-2">Søk etter personell og se tilgjengelighet.</p>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border">
                    <Button variant={viewMode === "cards" ? "default" : "ghost"} size="sm" onClick={() => setViewMode('cards')} className="h-8 text-xs font-medium"><LayoutGrid className="h-3.5 w-3.5 mr-1.5" />Kort</Button>
                    <Button variant={viewMode === "timeline" ? "default" : "ghost"} size="sm" onClick={() => setViewMode('timeline')} className="h-8 text-xs font-medium"><List className="h-3.5 w-3.5 mr-1.5" />Tidslinje</Button>
                    {dbUser?.role === 'admin' && <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting} className="h-8 text-xs font-medium bg-white"><Download className="h-3.5 w-3.5 mr-1.5" />Eksport</Button>}
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
                <StatusStat icon={<UserCheck className="h-5 w-5 text-blue-600"/>} value={stats.working} label="På jobb" color="blue" />
                <StatusStat icon={<Activity className="h-5 w-5 text-red-600"/>} value={stats.sick} label="Syk" color="red" />
                <StatusStat icon={<Palmtree className="h-5 w-5 text-green-600"/>} value={stats.vacation} label="Ferie" color="green" />
                <StatusStat icon={<Coffee className="h-5 w-5 text-slate-500"/>} value={stats.off} label="Fridag" color="slate" />
                <StatusStat icon={<Shield className="h-5 w-5 text-purple-600"/>} value={stats.other} label="Annet" color="purple" />
                <StatusStat icon={<Briefcase className="h-5 w-5 text-amber-600"/>} value={stats.contractors} label="Innleid" color="amber" />
            </div>

            {viewMode === 'cards' && (
                <>
                    <div className="p-4 bg-white rounded-xl border shadow-sm max-w-xs">
                        <Label className="text-sm font-semibold mb-2 block">Dato for status</Label>
                        <Input type="date" value={searchDateStr} onChange={e => setSearchDateStr(e.target.value)} className="bg-slate-50 h-9" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDrivers.map(driver => {
                            const si = getDriverStatus(driver, searchDate);
                            const cs = getCardDownloadStatus(driver.lastTachoDownloadDate);
                            const expanded = !!expandedCards[driver.id];

                            return (
                                <Card key={driver.id} className="flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className={cn("h-1.5 w-full", si.type === 'working' ? 'bg-blue-500' : si.type === 'sick' ? 'bg-red-500' : si.type === 'vacation' ? 'bg-green-500' : 'bg-slate-300')} />
                                    <CardHeader className="pb-3 flex flex-row items-start gap-4 relative">
                                        <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center">
                                            {driver.images?.[0] ? <Image src={driver.images[0].url} alt={driver.name} fill sizes="56px" className="object-cover" /> : <UserIcon className="h-6 w-6 text-slate-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <CardTitle className="text-lg font-bold truncate">{driver.name}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className={driver.employmentType === 'external' ? "bg-amber-50" : "bg-slate-50"}>{driver.role === 'contractor' ? 'Innleid' : 'Fast'}</Badge>
                                                {cs !== 'ok' && <Badge variant="destructive" className="text-[8px] uppercase">Sjåførkort</Badge>}
                                            </div>
                                        </div>
                                        {dbUser?.role === 'admin' && <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-slate-400 opacity-0 group-hover:opacity-100" onClick={() => setEditingDriverProfile(driver)}><Edit className="h-4 w-4" /></Button>}
                                    </CardHeader>

                                    <CardContent className="pt-0 flex-grow space-y-4">
                                        <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-3 rounded-xl border flex flex-col items-center justify-center cursor-pointer relative" onClick={() => handleToggleCard(driver)}>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Status {format(searchDate, 'dd.MM')}</span>
                                            <Badge variant="outline" className={cn("mt-1", si.color)}>{si.status}</Badge>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">{expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</div>
                                        </div>

                                        {expanded && (
                                            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 pb-4">
                                                {/* COMPLIANCE */}
                                                <div className="p-3 rounded-lg border-2 border-indigo-50 bg-indigo-50/20 flex items-center justify-between">
                                                    <div><p className="text-[10px] font-bold text-slate-500 uppercase">Sjåførkort</p><p className={cn("text-xs font-black", cs === 'expired' ? "text-red-600" : "text-slate-700")}>{driver.lastTachoDownloadDate ? format(parseISO(driver.lastTachoDownloadDate), 'dd. MMM yy', { locale: nb }) : 'Aldri'}</p></div>
                                                    <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold bg-white" onClick={() => handleRegisterDownload(driver)}><Download className="h-3 w-3 mr-1" />Registrer</Button>
                                                </div>

                                                {/* CONTACT INFO */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Kontaktinformasjon</h4>
                                                    <div className="grid gap-2">
                                                        {driver.phone && <div className="flex items-center gap-2 text-xs font-medium"><Phone className="h-3 w-3 text-slate-400" />{driver.phone}</div>}
                                                        {driver.address && <div className="flex items-center gap-2 text-xs font-medium"><MapPin className="h-3 w-3 text-slate-400" />{driver.address}</div>}
                                                    </div>
                                                </div>

                                                {/* EMPLOYMENT */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Ansettelsesforhold</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <InfoBit label="ID" value={driver.employeeId} icon={<Hash className="h-3 w-3"/>} />
                                                        <InfoBit label="Stilling" value={driver.jobTitle} icon={<Briefcase className="h-3 w-3"/>} />
                                                        <InfoBit label="Avdeling" value={driver.department} icon={<Building2 className="h-3 w-3"/>} />
                                                        <InfoBit label="Leder" value={driver.supervisor} icon={<UserCircle2 className="h-3 w-3"/>} />
                                                    </div>
                                                </div>

                                                {/* PAYROLL (GDPR Logged) */}
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Lønn & Personalia</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <InfoBit label="Født" value={driver.dateOfBirth} icon={<Baby className="h-3 w-3"/>} />
                                                        <InfoBit label="Personnr" value={driver.socialSecurityNumber} icon={<ShieldCheck className="h-3 w-3"/>} />
                                                        <InfoBit label="Timelønn" value={driver.hourlyRate ? `${driver.hourlyRate} kr` : null} icon={<Banknote className="h-3 w-3"/>} />
                                                        <InfoBit label="Bankkonto" value={driver.bankAccountNumber} icon={<Landmark className="h-3 w-3"/>} />
                                                    </div>
                                                </div>

                                                {/* ADMIN NOTES */}
                                                {driver.adminNotes && (
                                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Admin Notat</p>
                                                        <p className="text-xs text-amber-900 leading-snug">{driver.adminNotes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            {viewMode === 'timeline' && <WorkforceTimeline drivers={filteredDrivers} onEditDriver={setEditingDriverProfile} />}
            {viewMode === 'approvals' && <TimeApprovals orgId={dbUser!.orgId} drivers={drivers} />}

            <Dialog open={!!editingDriverProfile} onOpenChange={o => !o && setEditingDriverProfile(null)}>
                <DialogContent className="max-w-6xl w-[95vw] rounded-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Rediger profil</DialogTitle></DialogHeader>
                    {editingDriverProfile && <DriverProfileForm user={editingDriverProfile} onSubmit={handleUpdateDriverProfile} onCancel={() => setEditingDriverProfile(null)} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatusStat({ icon, value, label, color }: any) {
    const bgs: any = { blue: "bg-blue-50", red: "bg-red-50", green: "bg-green-50", slate: "bg-slate-50", purple: "bg-purple-50", amber: "bg-amber-50" };
    return (
        <Card className={cn("shadow-sm border-none", bgs[color])}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">{icon}<p className="text-2xl font-black mt-1">{value}</p><p className="text-[10px] font-bold uppercase tracking-tighter opacity-70">{label}</p></CardContent>
        </Card>
    );
}

function InfoBit({ label, value, icon }: { label: string, value?: string | null, icon: any }) {
    if (!value) return null;
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">{icon}{label}</p>
            <p className="text-xs font-black text-slate-800 leading-tight">{value}</p>
        </div>
    );
}
