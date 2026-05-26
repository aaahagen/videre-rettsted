'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Manifest, Route, Vehicle, Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Truck, CheckCircle2, ChevronLeft, Scan, X, Check, MessageSquare, Plus, Minus, Send, Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { BrowserMultiFormatReader, Result, BarcodeFormat, DecodeHintType } from '@zxing/library';

export default function ManifestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: manifestId } = use(params);
    const { dbUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [manifest, setManifest] = useState<Manifest | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [scanInput, setScanInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const scanInputRef = useRef<HTMLInputElement>(null);

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [newNote, setNewNote] = useState('');

    // Camera Scanner state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const lastScannedText = useRef<string>('');
    const lastScanTime = useRef<number>(0);

    useEffect(() => {
        if (!manifestId || !dbUser?.orgId) return;

        const unsubManifest = onSnapshot(doc(db, `organizations/${dbUser.orgId}/manifests`, manifestId), async (docSnap) => {
            if (docSnap.exists()) {
                const mData = { ...docSnap.data(), id: docSnap.id } as Manifest;
                setManifest(mData);

                if (mData.routeId) {
                    const rData = await firebaseDB.getRoute(mData.routeId);
                    setRoute(rData as Route);
                    
                    if (rData?.vehicleId) {
                        const vData = await firebaseDB.getVehicle(rData.vehicleId);
                        setVehicle(vData as Vehicle);
                    }

                    const allOrders = await firebaseDB.getOrders(dbUser.orgId);
                    setOrders(allOrders.filter(o => o.routeId === mData.routeId));
                }
                setIsLoading(false);
            } else {
                toast({ title: 'Feil', description: 'Fant ikke manifestet.', variant: 'destructive' });
                router.push('/dashboard/manifests');
            }
        });

        return () => unsubManifest();
    }, [manifestId, dbUser?.orgId, router, toast]);

    // Cleanup camera when unmounting
    useEffect(() => {
        return () => {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        };
    }, []);

    const initCameraScanner = async () => {
        setIsCameraActive(true);
        
        if (!codeReaderRef.current) {
            const hints = new Map();
            const formats = [
                BarcodeFormat.QR_CODE,
                BarcodeFormat.CODE_128,
                BarcodeFormat.CODE_39,
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.ITF,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
                BarcodeFormat.DATA_MATRIX
            ];
            hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
            hints.set(DecodeHintType.TRY_HARDER, true);
            codeReaderRef.current = new BrowserMultiFormatReader(hints);
        }

        try {
            const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
            setCameras(videoInputDevices);
            
            // On mobile, labels might be empty initially.
            // Using facingMode is more reliable than deviceId for the first start.
            startScanningWithConstraints('environment');
        } catch (err) {
            console.error(err);
            toast({ title: 'Kamera feil', description: 'Kunne ikke få tilgang til kameraet.', variant: 'destructive' });
            setIsCameraActive(false);
        }
    };

    const startScanningWithConstraints = async (mode: 'user' | 'environment', deviceId?: string) => {
        if (!codeReaderRef.current || !videoRef.current) return;
        
        codeReaderRef.current.reset();
        setFacingMode(mode);
        
        const constraints: MediaStreamConstraints = deviceId 
            ? { video: { deviceId: { exact: deviceId } } }
            : { video: { facingMode: mode } };

        try {
            await codeReaderRef.current.decodeFromConstraints(constraints, videoRef.current, (result: Result, err: any) => {
                if (result && !isProcessing) {
                    const text = result.getText();
                    const now = Date.now();
                    
                    // Prevent duplicate scans within 2 seconds if it's the same text
                    if (text === lastScannedText.current && now - lastScanTime.current < 2000) {
                        return;
                    }

                    lastScannedText.current = text;
                    lastScanTime.current = now;

                    // Haptic feedback
                    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(100);
                    }

                    handleScannedText(text);
                }
            });
        } catch (err) {
            console.error('Scanning error:', err);
            // If environment fails, try default
            if (mode === 'environment' && !deviceId) {
                startScanningWithConstraints('user');
            }
        }
    };

    const stopCameraScanner = () => {
        if (codeReaderRef.current) {
            codeReaderRef.current.reset();
        }
        setIsCameraActive(false);
    };

    const switchCamera = () => {
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        startScanningWithConstraints(nextMode);
    };

    const handleScannedText = async (text: string) => {
        if (!text.trim() || !manifest || !dbUser?.orgId || isProcessing) return;

        setIsProcessing(true);
        try {
            const result = await firebaseDB.processManifestScan(dbUser.orgId, manifest.id, text.trim(), dbUser.id);
            if (result.success) {
                toast({ 
                    title: 'Skannet!', 
                    description: result.message,
                });
            } else {
                toast({ title: 'Feil ved skanning', description: result.message, variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Systemfeil', description: error.message, variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleScannedText(scanInput);
        setScanInput('');
        setTimeout(() => scanInputRef.current?.focus(), 100);
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !manifest || !dbUser?.orgId) return;
        try {
            await firebaseDB.addManifestNote(dbUser.orgId, manifest.id, {
                createdBy: dbUser.id,
                userName: dbUser.name || 'System',
                content: newNote.trim(),
                type: 'note'
            });
            setNewNote('');
            setIsNoteModalOpen(false);
            toast({ title: 'Notat lagt til' });
        } catch (error: any) {
            toast({ title: 'Kunne ikke lagre notat', description: error.message, variant: 'destructive' });
        }
    };

    const handleFinalize = async () => {
        if (!manifest || !dbUser?.orgId) return;
        const missingItems = manifest.orders.filter(i => i.loadedItems < i.totalItems);
        
        if (missingItems.length > 0) {
            if (!confirm(`Det mangler varer i ${missingItems.length} ordrer. Vil du likevel ferdigstille manifestet?`)) return;
        }

        try {
            await firebaseDB.finalizeManifest(dbUser.orgId, manifest.id, dbUser.id);
            toast({ title: 'Manifest ferdigstilt', description: 'Ruten er nå klar for utkjøring.' });
            router.push('/dashboard/manifests');
        } catch (error: any) {
            toast({ title: 'Feil', description: error.message, variant: 'destructive' });
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!manifest) return null;

    const totalItems = manifest.orders.reduce((sum, i) => sum + i.totalItems, 0);
    const loadedItems = manifest.orders.reduce((sum, i) => sum + i.loadedItems, 0);
    const progress = totalItems > 0 ? (loadedItems / totalItems) * 100 : 0;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px] font-bold">
                                Manifest #{manifestId.slice(0, 8)}
                            </Badge>
                            <Badge className={cn(
                                "uppercase text-[10px] font-bold",
                                manifest.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'
                            )}>
                                {manifest.status === 'verified' ? 'Ferdigstilt' : 'Laster...'}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900">{route?.name || 'Laster rute...'}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsNoteModalOpen(true)}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Notat
                    </Button>
                    {manifest.status !== 'verified' && (
                        <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-100" onClick={handleFinalize}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Ferdigstill Manifest
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: PROGRESS & SCANNER */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Truck className="h-5 w-5 text-indigo-400" />
                                Kjøretøy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <Truck className="h-6 w-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{vehicle?.name || 'Ingen bil tildelt'}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase">{vehicle?.registrationNumber || '-'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-indigo-600 text-white">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Total Progresjon</p>
                                    <h3 className="text-4xl font-black">{Math.round(progress)}%</h3>
                                </div>
                                <p className="text-sm font-bold text-indigo-100">{loadedItems} / {totalItems} kolli</p>
                            </div>
                            <div className="h-3 w-full bg-indigo-900/30 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white transition-all duration-500 ease-out" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {manifest.status !== 'verified' && (
                        <Card className="border-2 border-slate-200 bg-white overflow-hidden shadow-lg">
                            <CardHeader className="bg-slate-50 border-b pb-4">
                                <CardTitle className="text-sm font-black uppercase flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Scan className="h-4 w-4 text-indigo-600" />
                                        Hurtigskanning
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isCameraActive ? (
                                    <div className="relative bg-black w-full aspect-square sm:aspect-video lg:aspect-square">
                                        <video 
                                            ref={videoRef} 
                                            className="w-full h-full object-cover"
                                            autoPlay 
                                            playsInline 
                                            muted
                                        />
                                        
                                        {/* Scanner Overlay UI */}
                                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none z-10" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                            <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-indigo-500/50 rounded-xl relative">
                                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg -mt-1 -ml-1"></div>
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg -mt-1 -mr-1"></div>
                                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg -mb-1 -ml-1"></div>
                                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg -mb-1 -mr-1"></div>
                                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                                            </div>
                                        </div>

                                        {isProcessing && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30">
                                                <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                                                <span className="text-white font-bold tracking-widest text-sm uppercase">Behandler...</span>
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-40">
                                            <Button 
                                                variant="secondary" 
                                                size="icon" 
                                                className="rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30"
                                                onClick={switchCamera}
                                                title="Bytt kamera"
                                            >
                                                <RefreshCw className="h-5 w-5" />
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                className="rounded-full px-6 font-bold shadow-xl"
                                                onClick={stopCameraScanner}
                                            >
                                                <CameraOff className="h-4 w-4 mr-2" /> Stopp Kamera
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6">
                                        <Button 
                                            className="w-full h-16 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-dashed border-indigo-200 shadow-none font-bold text-base mb-6 group transition-all"
                                            onClick={initCameraScanner}
                                        >
                                            <Camera className="h-6 w-6 mr-3 text-indigo-400 group-hover:scale-110 transition-transform" /> 
                                            Start Kameraskanner
                                        </Button>

                                        <div className="relative flex items-center py-2 mb-4">
                                            <div className="flex-grow border-t border-slate-200"></div>
                                            <span className="flex-shrink-0 mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ELLER TAST INN</span>
                                            <div className="flex-grow border-t border-slate-200"></div>
                                        </div>

                                        <form onSubmit={handleManualSubmit} className="space-y-4">
                                            <Input
                                                ref={scanInputRef}
                                                placeholder="Strekkode ID..."
                                                value={scanInput}
                                                onChange={(e) => setScanInput(e.target.value)}
                                                disabled={isProcessing}
                                                className="h-12 text-lg font-bold border-2 focus-visible:ring-indigo-500 bg-slate-50"
                                            />
                                            <Button type="submit" className="w-full h-12 bg-slate-900 font-bold" disabled={isProcessing || !scanInput.trim()}>
                                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrer manuelt'}
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT: LOADING LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Lasteliste</h2>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="bg-white">{orders.length} ordrer</Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {manifest.orders.map((item, idx) => {
                            const order = orders.find(o => o.id === item.orderId);
                            const isLoaded = item.loadedItems === item.totalItems;
                            
                            return (
                                <Card key={idx} className={cn(
                                    "overflow-hidden transition-all duration-300",
                                    isLoaded ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white shadow-md"
                                )}>
                                    <CardContent className="p-0">
                                        <div className="flex items-stretch">
                                            <div className={cn(
                                                "w-2 shrink-0",
                                                isLoaded ? "bg-emerald-500" : "bg-slate-200"
                                            )} />
                                            <div className="flex-1 p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className="bg-slate-100 text-slate-600 border-none font-mono text-[10px]">
                                                                #{item.barcode}
                                                            </Badge>
                                                            {isLoaded && (
                                                                <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold">
                                                                    <Check className="h-3 w-3 mr-1" /> LASTET
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h3 className="text-lg font-black text-slate-900">{order?.details?.description || 'Ordre'}</h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Progresjon</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-2xl font-black",
                                                                isLoaded ? "text-emerald-600" : "text-slate-900"
                                                            )}>
                                                                {item.loadedItems} <span className="text-slate-300">/</span> {item.totalItems}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-slate-400" />
                                                        <span className="text-sm font-bold text-slate-600">{item.totalItems} kolli</span>
                                                    </div>
                                                    {order?.details?.weight && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                            <span className="text-sm font-bold text-slate-600">{order.details.weight} kg</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* MANUAL OVERRIDE CONTROLS (Only for admin/loader) */}
                                            {manifest.status !== 'verified' && (
                                                <div className="flex flex-col border-l">
                                                    <Button 
                                                        variant="ghost" 
                                                        className="flex-1 rounded-none px-4 hover:bg-emerald-50 hover:text-emerald-600 border-b"
                                                        onClick={() => firebaseDB.incrementManifestItemLoadedCount(dbUser!.orgId, manifest.id, item.orderId, dbUser!.id)}
                                                        disabled={isLoaded}
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        className="flex-1 rounded-none px-4 hover:bg-red-50 hover:text-red-600"
                                                        onClick={() => firebaseDB.decrementManifestItemLoadedCount(dbUser!.orgId, manifest.id, item.orderId)}
                                                        disabled={item.loadedItems === 0}
                                                    >
                                                        <Minus className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    
                    {/* NOTES SECTION */}
                    {manifest.notes && manifest.notes.length > 0 && (
                        <div className="mt-10 space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Siste Notater</h3>
                            <div className="space-y-3">
                                {manifest.notes.map((note, idx) => (
                                    <div key={idx} className="bg-slate-50 border p-4 rounded-2xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-black text-indigo-600 uppercase">{note.userName}</p>
                                            <p className="text-[10px] font-bold text-slate-400">
                                                {format(note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt as string), 'HH:mm', { locale: nb })}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">{note.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* NOTE DIALOG */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Legg til notat</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setIsNoteModalOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea 
                                placeholder="Skriv melding til sjåfør eller lager..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="min-h-[120px]"
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" onClick={() => setIsNoteModalOpen(false)}>Avbryt</Button>
                                <Button className="bg-indigo-600" onClick={handleAddNote} disabled={!newNote.trim()}>
                                    <Send className="mr-2 h-4 w-4" /> Send notat
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
