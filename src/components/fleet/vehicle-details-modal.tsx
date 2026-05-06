'use client';

import { useState, useEffect } from 'react';
import { Vehicle, VehicleDamageReport } from '@/lib/types';
import { firebaseDB } from '@/lib/firebase/database';
import { firebaseStorage } from '@/lib/firebase/storage';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Truck, 
    AlertTriangle, 
    Wrench, 
    CheckCircle2, 
    Clock, 
    FileText, 
    Upload, 
    Loader2, 
    History,
    ShieldCheck,
    Eye,
    Hammer,
    MapPin,
    Plus,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { Separator } from '@/components/ui/separator';
import { onSnapshot, collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface VehicleDetailsModalProps {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function VehicleDetailsModal({ vehicle, isOpen, onClose, onUpdate }: VehicleDetailsModalProps) {
    const { dbUser } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [damageReports, setDamageReports] = useState<VehicleDamageReport[]>([]);
    const [isUploading, setIsUploading] = useState<string | null>(null);
    const [showNewReportForm, setShowNewReportForm] = useState(false);
    const [newReportDescription, setNewReportDescription] = useState('');

    useEffect(() => {
        let unsubscribe: () => void;

        if (vehicle && isOpen && dbUser?.orgId) {
            // Use real-time listener for damage reports
            const q = query(
                collection(db, 'vehicleDamages'),
                where('orgId', '==', dbUser.orgId),
                where('vehicleId', '==', vehicle.id)
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const reports = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                        resolvedAt: data.resolvedAt ? (data.resolvedAt as Timestamp).toDate() : undefined,
                    } as VehicleDamageReport;
                });

                // Sort by creation date descending
                setDamageReports(reports.sort((a, b) => {
                    const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                    const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                    return dateB - dateA;
                }));
            }, (error) => {
                console.error("Error listening to damage reports:", error);
                toast({ 
                    title: "Feil", 
                    description: "Kunne ikke hente skadehistorikk i sanntid.", 
                    variant: "destructive" 
                });
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [vehicle, isOpen, dbUser?.orgId, toast]);

    const updateStatuses = async (newStatuses: Vehicle['currentStatuses']) => {
        if (!vehicle) return;
        setIsLoading(true);
        try {
            const uniqueStatuses = Array.from(new Set(newStatuses)) as Vehicle['currentStatuses'];
            await firebaseDB.updateVehicle(vehicle.id, { currentStatuses: uniqueStatuses });
            toast({ title: "Status oppdatert" });
            onUpdate();
        } catch (error) {
            toast({ title: "Feil", description: "Kunne ikke oppdatere status", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = (status: Vehicle['currentStatuses'][number]) => {
        if (!vehicle) return;
        const current = vehicle.currentStatuses || [];
        const functionalStates = ['ready', 'on_tour', 'parked', 'pending_workshop', 'workshop'];
        let next: string[];

        if (functionalStates.includes(status)) {
            if (current.includes(status) && current.length === 1) return;
            next = current.filter(s => !functionalStates.includes(s));
            next.push(status);
        } else {
            if (current.includes(status)) {
                next = current.filter(s => s !== status);
            } else {
                next = [...current, status];
            }
        }
        if (!next.some(s => functionalStates.includes(s))) next.push('parked');
        updateStatuses(next as any);
    };

    const handleCreateManualReport = async () => {
        if (!vehicle || !newReportDescription || !dbUser) return;
        setIsLoading(true);
        try {
            await firebaseDB.createVehicleDamageReport({
                orgId: dbUser.orgId,
                vehicleId: vehicle.id,
                reportedBy: dbUser.id,
                reportedByName: dbUser.name || 'Administrator',
                description: newReportDescription,
                images: [],
                status: 'reported'
            } as any);

            // Auto-set to observation if not already severe
            if (!vehicle.currentStatuses.includes('workshop') && !vehicle.currentStatuses.includes('pending_workshop')) {
                if (!vehicle.currentStatuses.includes('observation')) {
                    await updateStatuses([...vehicle.currentStatuses, 'observation']);
                }
            }

            toast({ title: "Sak registrert" });
            setNewReportDescription('');
            setShowNewReportForm(false);
            // loadDamageReports(); // No longer needed thanks to onSnapshot
        } catch (error) {
            toast({ title: "Feil ved lagring", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (reportId: string, type: 'workshop_order' | 'workshop_receipt', file: File) => {
        if (!vehicle) return;
        setIsUploading(`${reportId}-${type}`);
        try {
            const path = `vehicles/${vehicle.id}/workshop/${uuidv4()}-${file.name}`;
            const url = await firebaseStorage.uploadFile(path, file);
            
            const updateData: any = {};
            const functionalStates = ['ready', 'on_tour', 'parked', 'pending_workshop', 'workshop'];

            if (type === 'workshop_order') {
                updateData.workshopOrderReceiptUrl = url;
                updateData.status = 'in_progress';
                
                if (!vehicle.currentStatuses.includes('workshop')) {
                    const nextStatuses = vehicle.currentStatuses.filter(s => !functionalStates.includes(s));
                    nextStatuses.push('pending_workshop');
                    await updateStatuses(nextStatuses as any);
                }
            } else {
                updateData.workshopRepairReceiptUrl = url;
                updateData.status = 'fixed';
                updateData.resolvedAt = new Date();
                updateData.resolvedBy = dbUser?.id;

                const nextStatuses = vehicle.currentStatuses.filter(s => !functionalStates.includes(s) && s !== 'observation');
                nextStatuses.push('ready');
                await updateStatuses(nextStatuses as any);
            }

            await firebaseDB.updateVehicleDamageReport(reportId, updateData);
            toast({ title: "Dokument lastet opp" });
            // loadDamageReports(); // No longer needed thanks to onSnapshot
        } catch (error) {
            toast({ title: "Feil ved opplasting", variant: "destructive" });
        } finally {
            setIsUploading(null);
        }
    };

    if (!vehicle) return null;

    const currentStatuses = vehicle.currentStatuses || [];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-50/50">
                <DialogHeader className="p-6 bg-white border-b sticky top-0 z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-xl">
                                <Truck className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black">{vehicle.name}</DialogTitle>
                                <DialogDescription className="font-bold text-slate-500">
                                    {vehicle.registrationNumber} • {vehicle.type.toUpperCase()}
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(currentStatuses)).map(s => (
                                <Badge key={s} variant="outline" className="bg-white shadow-sm border-slate-200 capitalize py-1 px-3">
                                    {s.replace('_', ' ')}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-8">
                    {/* QUICK STATUS MANAGER */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Operasjonell Status
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <StatusButton 
                                icon={<CheckCircle2 className="h-4 w-4" />} 
                                label="Klar" 
                                active={currentStatuses.includes('ready')} 
                                onClick={() => toggleStatus('ready')}
                                color="emerald"
                            />
                            <StatusButton 
                                icon={<MapPin className="h-4 w-4" />} 
                                label="På rute" 
                                active={currentStatuses.includes('on_tour')} 
                                onClick={() => toggleStatus('on_tour')}
                                color="blue"
                            />
                            <StatusButton 
                                icon={<Clock className="h-4 w-4" />} 
                                label="Parkert" 
                                active={currentStatuses.includes('parked')} 
                                onClick={() => toggleStatus('parked')}
                                color="slate"
                            />
                            <StatusButton 
                                icon={<Eye className="h-4 w-4" />} 
                                label="Observasjon" 
                                active={currentStatuses.includes('observation')} 
                                onClick={() => toggleStatus('observation')}
                                color="yellow"
                            />
                            <StatusButton 
                                icon={<Wrench className="h-4 w-4" />} 
                                label="Venter verksted" 
                                active={currentStatuses.includes('pending_workshop')} 
                                onClick={() => toggleStatus('pending_workshop')}
                                color="orange"
                            />
                            <StatusButton 
                                icon={<Hammer className="h-4 w-4" />} 
                                label="På verksted" 
                                active={currentStatuses.includes('workshop')} 
                                onClick={() => toggleStatus('workshop')}
                                color="red"
                            />
                        </div>
                    </section>

                    <Separator />

                    {/* DAMAGE & WORKSHOP LOG */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Skadehistorikk & Verksted
                            </h3>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="font-bold h-8 border-dashed border-primary text-primary hover:bg-primary/5"
                                onClick={() => setShowNewReportForm(true)}
                            >
                                <Plus className="h-3 w-3 mr-1.5" /> Ny Sak / Service
                            </Button>
                        </div>

                        {showNewReportForm && (
                            <div className="p-4 bg-white rounded-xl border-2 border-primary/20 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center">
                                    <Label className="font-black text-xs uppercase text-slate-500">Meld ny sak / vedlikehold</Label>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNewReportForm(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Textarea 
                                    placeholder="Beskriv behovet (f.eks. 'Service 100k', 'Ødelagt lykt bak', etc.)"
                                    value={newReportDescription}
                                    onChange={(e) => setNewReportDescription(e.target.value)}
                                    className="min-h-[80px]"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setShowNewReportForm(false)}>Avbryt</Button>
                                    <Button size="sm" className="font-bold" onClick={handleCreateManualReport} disabled={!newReportDescription || isLoading}>
                                        {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                                        Opprett Sak
                                    </Button>
                                </div>
                            </div>
                        )}

                        {damageReports.length === 0 && !showNewReportForm ? (
                            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm">Ingen aktive saker rapportert.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {damageReports.map((report) => (
                                    <Card key={report.id} className="overflow-hidden border-slate-200 shadow-sm">
                                        <div className={cn(
                                            "h-1 w-full",
                                            report.status === 'reported' ? "bg-red-500" :
                                            report.status === 'in_progress' ? "bg-orange-500" : "bg-emerald-500"
                                        )} />
                                        <div className="p-4 bg-white space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={report.status === 'fixed' ? 'outline' : 'default'} className={cn(
                                                            report.status === 'reported' ? "bg-red-100 text-red-700" :
                                                            report.status === 'in_progress' ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                        )}>
                                                            {report.status === 'reported' ? 'Ubehandlet' : report.status === 'in_progress' ? 'I prosess' : 'Utbedret'}
                                                        </Badge>
                                                        <span className="text-xs font-bold text-slate-400">
                                                            {report.createdAt ? format(report.createdAt instanceof Date ? report.createdAt : new Date(report.createdAt as any), 'PPP', { locale: nb }) : 'Ukjent dato'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800">{report.description}</p>
                                                    <p className="text-[10px] text-slate-400">Registrert av: {report.reportedByName}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                {/* Workshop Order */}
                                                <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                                                        <Clock className="h-3 w-3" /> Bestilling / Verkstedtime
                                                    </Label>
                                                    {report.workshopOrderReceiptUrl ? (
                                                        <a href={report.workshopOrderReceiptUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold group hover:bg-emerald-100 transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4" />
                                                                Se bekreftelse
                                                            </div>
                                                            <Upload className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                                        </a>
                                                    ) : (
                                                        <div className="relative">
                                                            <Button variant="outline" size="sm" className="w-full border-dashed bg-white text-[10px] font-bold h-10 border-primary/30 text-primary">
                                                                {isUploading === `${report.id}-workshop_order` ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                                                                Last opp bestilling (PDF/Bilde)
                                                            </Button>
                                                            <input 
                                                                type="file" 
                                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(report.id, 'workshop_order', e.target.files[0])}
                                                                disabled={!!isUploading}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Workshop Receipt */}
                                                <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                                                        <ShieldCheck className="h-3 w-3" /> Faktura / Ferdigstillelse
                                                    </Label>
                                                    {report.workshopRepairReceiptUrl ? (
                                                        <a href={report.workshopRepairReceiptUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold group hover:bg-blue-100 transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className="h-4 w-4" />
                                                                Se kvittering
                                                            </div>
                                                            <Upload className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                                        </a>
                                                    ) : (
                                                        <div className="relative">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="w-full border-dashed bg-white text-[10px] font-bold h-10"
                                                                disabled={!report.workshopOrderReceiptUrl}
                                                            >
                                                                {isUploading === `${report.id}-workshop_receipt` ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                                                                Last opp slutt-dokumentasjon
                                                            </Button>
                                                            <input 
                                                                type="file" 
                                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(report.id, 'workshop_receipt', e.target.files[0])}
                                                                disabled={!!isUploading || !report.workshopOrderReceiptUrl}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
                
                <DialogFooter className="p-6 bg-white border-t">
                    <Button variant="ghost" onClick={onClose} className="font-bold">Lukk</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StatusButton({ icon, label, active, onClick, color }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, color: string }) {
    const colorClasses: Record<string, string> = {
        emerald: active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50",
        blue: active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:bg-blue-50",
        slate: active ? "bg-slate-600 text-white border-slate-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
        yellow: active ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-slate-600 border-slate-200 hover:border-yellow-200 hover:bg-yellow-50",
        orange: active ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:bg-orange-50",
        red: active ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-600 border-slate-200 hover:border-red-200 hover:bg-red-50",
    };

    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-bold text-xs transition-all shadow-sm",
                colorClasses[color]
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}>{children}</div>;
}
