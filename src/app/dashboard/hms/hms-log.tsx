'use client';

import { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Download, 
    Shield, 
    ChevronDown, 
    ChevronUp, 
    Search, 
    CheckCircle2, 
    XCircle,
    User,
    Calendar,
    Hash,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { firebaseDB } from '@/lib/firebase/database';
import { Place, Organization } from '@/lib/types';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { 
    Collapsible, 
    CollapsibleContent, 
    CollapsibleTrigger 
} from "@/components/ui/collapsible";

interface HMSLogProps {
    orgId: string;
    organization: Organization;
    initialSearchQuery?: string;
}

export function HMSLog({ orgId, organization, initialSearchQuery = '' }: HMSLogProps) {
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlaces = async () => {
            setIsLoading(true);
            try {
                const allPlaces = await firebaseDB.getPlaces(orgId);
                // Filter only places that have HMS data
                const hmsPlaces = allPlaces.filter(p => 
                    p.hmsData && (
                        (p.hmsData.answers && Object.keys(p.hmsData.answers).length > 0) || 
                        p.hmsData.comment
                    )
                );
                // Sort by date (newest first)
                hmsPlaces.sort((a, b) => {
                    const dateA = a.hmsData?.completedAt?.toDate?.() || new Date(0);
                    const dateB = b.hmsData?.completedAt?.toDate?.() || new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });
                setPlaces(hmsPlaces);
            } catch (error) {
                console.error("Error fetching HMS log:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaces();
    }, [orgId]);

    const exportToCSV = () => {
        if (places.length === 0) return;

        // Filter out headings for a clean CSV export
        const questions = (organization.hmsSettings?.questions || []).filter(q => q.type !== 'heading');
        
        // Define Headers
        const headers = [
            "Sted",
            "Kundenummer",
            "Adresse",
            "Utfylt av",
            "Dato",
            ...questions.map(q => q.text),
            "Kommentar"
        ];

        // Map Data rows
        const rows = places.map(p => {
            const date = p.hmsData?.completedAt?.toDate?.() 
                ? format(p.hmsData.completedAt.toDate(), 'yyyy-MM-dd HH:mm') 
                : 'Ukjent';
            
            return [
                p.name,
                p.customerNumber || '',
                p.address,
                p.hmsData?.completedByName || 'Ukjent',
                date,
                ...questions.map(q => p.hmsData?.answers?.[q.id] ? "JA" : "NEI"),
                (p.hmsData?.comment || '').replace(/"/g, '""') // Escape quotes for CSV
            ];
        });

        // Create CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `HMS-Logg-${organization.name}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredPlaces = places.filter(p => 
        p.name.toLowerCase().includes(initialSearchQuery.toLowerCase()) ||
        (p.customerNumber || '').toLowerCase().includes(initialSearchQuery.toLowerCase()) ||
        (p.hmsData?.completedByName || '').toLowerCase().includes(initialSearchQuery.toLowerCase()) ||
        (p.hmsData?.comment || '').toLowerCase().includes(initialSearchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <Card className="border-slate-200 shadow-sm mt-6">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        HMS Dokumentasjonslogg
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Oversikt over alle steder med utfylt HMS-sjekkliste
                    </CardDescription>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportToCSV}
                    disabled={places.length === 0}
                    className="font-bold border-slate-300"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Eksporter CSV
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {filteredPlaces.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p>{initialSearchQuery ? `Ingen HMS-data matchet "${initialSearchQuery}"` : "Ingen HMS-data funnet."}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredPlaces.map((place) => (
                            <Collapsible
                                key={place.id}
                                open={expandedPlaceId === place.id}
                                onOpenChange={() => setExpandedPlaceId(expandedPlaceId === place.id ? null : place.id)}
                            >
                                <CollapsibleTrigger asChild>
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <div className="sm:col-span-4 flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg border group-hover:border-red-200 transition-colors">
                                                <Shield className="h-4 w-4 text-red-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{place.name}</p>
                                                {place.customerNumber && (
                                                    <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                                        <Hash className="h-2.5 w-2.5" /> {place.customerNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="sm:col-span-3 text-slate-600 text-sm flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-slate-400" />
                                            {place.hmsData?.completedByName || 'Ukjent'}
                                        </div>
                                        <div className="sm:col-span-3 text-slate-600 text-sm flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            {place.hmsData?.completedAt?.toDate ? format(place.hmsData.completedAt.toDate(), 'do MMM yyyy', { locale: nb }) : 'Ukjent'}
                                        </div>
                                        <div className="sm:col-span-2 flex justify-end">
                                            {expandedPlaceId === place.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                        </div>
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="bg-slate-50/80 border-t border-slate-100 p-6 animate-in slide-in-from-top-1 duration-200">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sjekkpunkter</h4>
                                            <div className="space-y-2">
                                                {organization.hmsSettings?.questions.map((q) => {
                                                    if (q.type === 'heading') {
                                                        return (
                                                            <div key={q.id} className="pt-3 pb-1 border-b border-slate-200">
                                                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{q.text}</span>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <div key={q.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                                                            <span className="text-sm font-medium text-slate-700">{q.text}</span>
                                                            {place.hmsData?.answers?.[q.id] ? (
                                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> JA
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-slate-400 border-slate-200 shadow-none">
                                                                    <XCircle className="h-3 w-3 mr-1" /> NEI
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">HMS Kommentar</h4>
                                            <div className="p-4 bg-white rounded-xl border border-slate-200 min-h-[100px] text-sm text-slate-600 italic">
                                                {place.hmsData?.comment || 'Ingen kommentar lagt inn.'}
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <Button size="sm" variant="ghost" className="text-xs text-primary font-bold" asChild>
                                                    <a href={`/dashboard/places/${place.id}`}>Vis leveringssted</a>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
