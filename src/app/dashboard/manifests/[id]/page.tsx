'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Manifest, Route, Vehicle, Order, ManifestNote } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Truck, CheckCircle2, ChevronLeft, Search, Scan, X, Check, AlertCircle, Info, Plus, Minus, MessageSquare, AlertTriangle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

export default function ManifestDetailPage() {
    const { id } = useParams();
    const { dbUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [manualBarcode, setManualBarcode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    const [noteContent, setNoteContent] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [noteType, setNoteType] = useState<'note' | 'issue'>('note');

    const barcodeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
    }, [isScanning]);

    useEffect(() => {
        if (!id || !dbUser?.orgId) return;

        const manifestId = id as string;

        const manifestRef = doc(db, 'organizations', dbUser.orgId, 'manifests', manifestId);
        const unsubscribeManifest = onSnapshot(manifestRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as Manifest;
                setManifest(data);
                
                if (!route || route.id !== data.routeId) {
                    firebaseDB.getRoute(data.routeId).then(setRoute);
                }
                if (!vehicle || vehicle.id !== data.vehicleId) {
                    if (data.vehicleId) {
                        firebaseDB.getVehicle(data.vehicleId).then(setVehicle);
                    } else {
                        setVehicle(null);
                    }
                }

                const ordersRef = collection(db, 'organizations', dbUser.orgId, 'orders');
                const q = query(ordersRef, where('routeId', '==', data.routeId));
                const unsubscribeOrders = onSnapshot(q, (snapshot) => {
                    const fetchedOrders: Order[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                    setOrders(fetchedOrders);
                });
                return () => unsubscribeOrders();

            } else {
                setManifest(null);
                toast({ title: "Feil", description: "Fant ikke manifestet.", variant: "destructive" });
                router.push('/dashboard/manifests');
            }
            setIsLoading(false);
        });

        return () => {
            unsubscribeManifest();
        };
    }, [id, dbUser, route, vehicle, toast, router]);

        const handleScan = async (barcode: string) => {
        if (!manifest || !dbUser) return;

        const cleanBarcode = barcode.trim();
        if (!cleanBarcode) return;

        try {
            const result = await firebaseDB.processManifestScan(dbUser.orgId, manifest.id, cleanBarcode, dbUser.id);
            if (result.success) {
                toast({
                    title: "Scannet Suksess",
                    description: result.message,
                });
                setManualBarcode('');
            } else {
                toast({
                    title: "Feil",
                    description: result.message,
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            console.error("Error processing scan:", error);
            toast({
                title: "Feil ved scanning",
                description: error.message || "Noe gikk galt.",
                variant: "destructive"
            });
        }
    };

    const handleManualIncrement = async (orderId: string) => {
        if (!manifest || !dbUser) return;
        try {
            await firebaseDB.incrementManifestItemLoadedCount(dbUser.orgId, manifest.id, orderId, dbUser.id);
            toast({
                title: "Vare lastet manuelt",
                description: "Antall lastede varer er økt.",
            });
        } catch (error: any) {
            console.error("Error manually incrementing item:", error);
            toast({
                title: "Feil",
                description: error.message || "Kunne ikke øke antall lastede varer manuelt.",
                variant: "destructive"
            });
        }
    };

    const handleManualDecrement = async (orderId: string) => {
        if (!manifest || !dbUser) return;
        try {
            await firebaseDB.decrementManifestItemLoadedCount(dbUser.orgId, manifest.id, orderId);
            toast({
                title: "Vare avlastet manuelt",
                description: "Antall lastede varer er redusert.",
            });
        } catch (error: any) {
            console.error("Error manually decrementing item:", error);
            toast({
                title: "Feil",
                description: error.message || "Kunne redusere antall lastede varer manuelt.",
                variant: "destructive"
            });
        }
    };

    const handleSubmitNote = async () => {
        if (!noteContent.trim() || !manifest || !dbUser) return;
        
        setIsSubmittingNote(true);
        try {
            await firebaseDB.addManifestNote(dbUser.orgId, manifest.id, {
                content: noteContent,
                createdBy: dbUser.id,
                userName: dbUser.name,
                type: noteType
            });
            setNoteContent('');
            toast({
                title: noteType === 'issue' ? "Avvik meldt" : "Notat lagt til",
                description: "Informasjonen er lagret på manifestet.",
            });
        } catch (error) {
            console.error("Error adding note:", error);
            toast({
                title: "Feil",
                description: "Kunne ikke lagre notatet.",
                variant: "destructive"
            });
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const handleFinalize = async () => {
        if (!manifest || !dbUser) return;
        
        const allItemsLoaded = manifest.orders.every(item => item.loadedItems === item.totalItems);

        if (!allItemsLoaded) {
            if (!confirm(`Ikke alle varer er registrert som lastet. Er du sikker på at du vil fullføre lasteplanen?`)) {
                return;
            }
        }

        try {
            setIsVerifying(true);
            await firebaseDB.finalizeManifest(dbUser.orgId, manifest.id, dbUser.id);
            toast({
                title: "Vellykket",
                description: "Lasteplanen er verifisert og fullført.",
            });
            router.push('/dashboard/manifests');
        } catch (error) {
            console.error("Error finalizing manifest:", error);
            toast({
                title: "Feil",
                description: "Kunne ikke fullføre lasteplanen.",
                variant: "destructive"
            });
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!manifest) return null;

    const combinedOrderDetails = manifest.orders.map(manifestItem => {
        const fullOrder = orders.find(o => o.id === manifestItem.orderId);
        return {
            ...manifestItem,
            details: fullOrder?.details,
            totalItems: manifestItem.totalItems,
            loadedItems: manifestItem.loadedItems
        };
    });

    const overallLoadedCount = combinedOrderDetails.reduce((sum, item) => sum + item.loadedItems, 0);
    const overallTotalCount = combinedOrderDetails.reduce((sum, item) => sum + item.totalItems, 0);
    const overallProgress = overallTotalCount > 0 ? (overallLoadedCount / overallTotalCount) * 100 : 0;
    const isFullyLoaded = overallLoadedCount === overallTotalCount;

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full pb-24">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/manifests')}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{route?.name || 'Lasteplan'}</h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        {vehicle?.registrationNumber || 'Ingen bil'} • {vehicle?.type || 'Ukjent'}
                    </p>
                </div>
            </div>

            <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                            <span className="text-sm opacity-80 uppercase tracking-wider font-bold">Lastefremdrift</span>
                            <div className="text-4xl font-black">{Math.round(overallProgress)}%</div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm opacity-80 uppercase tracking-wider font-bold font-mono">
                                {overallLoadedCount} / {overallTotalCount} KOLli
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                            className="bg-white h-3 rounded-full transition-all duration-700" 
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Scan className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            ref={barcodeInputRef}
                            placeholder="Skann strekkode eller QR-kode..." 
                            className="pl-10"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleScan(manualBarcode);
                                    setManualBarcode('');
                                }
                            }}
                        />
                    </div>
                    <Button onClick={() => handleScan(manualBarcode)} disabled={!manualBarcode.trim()}>
                        <Check className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Pakkeliste</h2>
                    {combinedOrderDetails.length === 0 && !isLoading ? (
                        <Card className="bg-slate-50/50 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                <Info className="h-10 w-10 text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">Ingen ordre på denne lasteplanen.</p>
                                <p className="text-sm text-slate-400">Tildel ordre til ruten for å legge dem til her.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        combinedOrderDetails.map((item) => (
                            <div 
                                key={item.orderId}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                    item.loadedItems === item.totalItems
                                        ? "bg-green-50 border-green-200 text-green-900" 
                                        : "bg-white border-slate-100 shadow-sm"
                                )}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                        item.loadedItems === item.totalItems ? "bg-green-200" : "bg-slate-100"
                                    )}>
                                        {item.loadedItems === item.totalItems ? <Check className="h-5 w-5" /> : <Package className="h-5 w-5 text-slate-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-mono font-bold text-sm tracking-tighter">{item.barcode}</div>
                                        <div className="text-sm text-slate-500 line-clamp-1">{item.details?.description || 'Ingen beskrivelse'}</div>
                                        <div className="text-[10px] uppercase font-bold opacity-60 mt-1">
                                            Status: {item.loadedItems === item.totalItems ? 'Lastet' : `Laster (${item.loadedItems}/${item.totalItems})`}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-4">
                                    <Button 
                                        size="icon" 
                                        variant="outline" 
                                        className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                        onClick={() => handleManualDecrement(item.orderId)}
                                        disabled={item.loadedItems === 0}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="outline" 
                                        className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                                        onClick={() => handleManualIncrement(item.orderId)}
                                        disabled={item.loadedItems === item.totalItems}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-6 space-y-4">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Logg & Meldinger</h2>
                    
                    <Card className="bg-white border shadow-sm">
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Notater fra Lasterampe
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[200px] overflow-y-auto p-4 space-y-3">
                                {manifest.notes && manifest.notes.length > 0 ? (
                                    manifest.notes.slice().reverse().map((note, idx) => (
                                        <div key={idx} className={cn(
                                            "p-3 rounded-lg text-sm",
                                            note.type === 'issue' ? "bg-red-50 border border-red-100 text-red-900" : "bg-slate-100 text-slate-900"
                                        )}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-[10px] uppercase flex items-center gap-1">
                                                    {note.type === 'issue' ? <AlertTriangle className="h-3 w-3" /> : <Info className="h-3 w-3" />}
                                                    {note.userName}
                                                </span>
                                                <span className="text-[10px] opacity-50">
                                                    {format(new Date(note.createdAt as string), 'HH:mm', { locale: nb })}
                                                </span>
                                            </div>
                                            <p className="leading-relaxed">{note.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 py-4 text-sm italic">Ingen notater lagt til ennå.</p>
                                )}
                            </div>

                            <div className="p-4 border-t bg-slate-50/30">
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Button 
                                            variant={noteType === 'note' ? 'default' : 'outline'} 
                                            size="sm" 
                                            className="flex-1 h-8 text-[10px] uppercase font-bold"
                                            onClick={() => setNoteType('note')}
                                        >
                                            Notat
                                        </Button>
                                        <Button 
                                            variant={noteType === 'issue' ? 'destructive' : 'outline'} 
                                            size="sm" 
                                            className="flex-1 h-8 text-[10px] uppercase font-bold"
                                            onClick={() => setNoteType('issue')}
                                        >
                                            Meld Avvik
                                        </Button>
                                    </div>
                                    <div className="relative">
                                        <Textarea 
                                            placeholder={noteType === 'issue' ? "Beskriv avviket her..." : "Skriv et notat..."} 
                                            className="min-h-[80px] resize-none pr-12"
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                        />
                                        <Button 
                                            size="icon" 
                                            className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                                            disabled={!noteContent.trim() || isSubmittingNote}
                                            onClick={handleSubmitNote}
                                        >
                                            {isSubmittingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:relative sm:bg-transparent sm:border-none sm:p-0">
                <Button 
                    className="w-full h-12 text-lg font-bold rounded-xl shadow-lg" 
                    size="lg"
                    disabled={isVerifying}
                    onClick={handleFinalize}
                >
                    {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                    {isFullyLoaded ? 'Verifiser & Fullfør' : 'Fullfør lasting'}
                </Button>
            </div>
        </div>
    );
}
