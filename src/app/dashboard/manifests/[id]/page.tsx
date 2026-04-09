'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Manifest, Route, Vehicle, Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Truck, CheckCircle2, ChevronLeft, Search, Scan, X, Check, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

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
    const [scanBuffer, setScanBuffer] = useState('');
    const [manualBarcode, setManualBarcode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!id || !dbUser?.orgId) return;

        // Real-time listener for manifest
        const manifestRef = doc(db, 'organizations', dbUser.orgId, 'manifests', id as string);
        const unsubscribeManifest = onSnapshot(manifestRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as Manifest;
                setManifest(data);
                
                // Fetch associated data if not already fetched
                if (!route) {
                    firebaseDB.getRoute(data.routeId).then(setRoute);
                }
                if (!vehicle) {
                    firebaseDB.getVehicle(data.vehicleId).then(setVehicle);
                }
            } else {
                setManifest(null);
                toast({ title: "Feil", description: "Fant ikke manifestet.", variant: "destructive" });
                router.push('/dashboard/manifests');
            }
            setIsLoading(false);
        });

        // Real-time listener for orders on this route
        const ordersRef = collection(db, 'organizations', dbUser.orgId, 'orders');
        const q = query(ordersRef, where('routeId', '==', id)); // In reality manifestId might be used
        const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
            const results: Order[] = [];
            snapshot.forEach(doc => {
                const order = { id: doc.id, ...doc.data() } as Order;
                // Filtering client-side for now as we might need complex mapping
                if (order.routeId === manifest?.routeId || order.id === manifest?.orders.find(o => o.orderId === order.id)?.orderId) {
                    results.push(order);
                }
            });
            setOrders(results);
        });

        return () => {
            unsubscribeManifest();
            unsubscribeOrders();
        };
    }, [id, dbUser]);

    const handleScan = async (barcode: string) => {
        if (!manifest || !dbUser) return;

        const cleanBarcode = barcode.trim();
        if (!cleanBarcode) return;

        const manifestItem = manifest.orders.find(o => o.barcode === cleanBarcode);
        
        if (!manifestItem) {
            toast({
                title: "Ukjent strekkode",
                description: `Pakken med kode ${cleanBarcode} tilhører ikke denne ruten.`,
                variant: "destructive"
            });
            return;
        }

        if (manifestItem.status === 'loaded') {
            toast({
                title: "Allerede lastet",
                description: `Pakken ${cleanBarcode} er allerede registrert som lastet.`,
            });
            return;
        }

        try {
            await firebaseDB.verifyManifestItem(dbUser.orgId, manifest.id, manifestItem.orderId, dbUser.id);
            toast({
                title: "Pakke lastet",
                description: `Registrerte ${cleanBarcode} på bilen.`,
            });
        } catch (error) {
            console.error("Error verifying item:", error);
            toast({
                title: "Feil",
                description: "Kunne ikke registrere pakken.",
                variant: "destructive"
            });
        }
    };

    const handleFinalize = async () => {
        if (!manifest || !dbUser) return;
        
        const remaining = manifest.orders.filter(o => o.status === 'pending').length;
        if (remaining > 0) {
            if (!confirm(`${remaining} pakker mangler fortsatt. Er du sikker på at du vil fullføre lastingen?`)) {
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

    const loadedCount = manifest.orders.filter(o => o.status === 'loaded').length;
    const totalCount = manifest.orders.length;
    const isFullyLoaded = loadedCount === totalCount;

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
                        {vehicle?.registrationNumber} • {vehicle?.type}
                    </p>
                </div>
            </div>

            <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                            <span className="text-sm opacity-80 uppercase tracking-wider font-bold">Lastefremdrift</span>
                            <div className="text-4xl font-black">{Math.round((loadedCount / totalCount) * 100)}%</div>
                        </div>
                        <div className="text-right">
                            <span className="text-sm opacity-80 uppercase tracking-wider font-bold font-mono">
                                {loadedCount} / {totalCount} KOLli
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                            className="bg-white h-3 rounded-full transition-all duration-700" 
                            style={{ width: `${(loadedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Manuell strekkode..." 
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
                    <Button onClick={() => handleScan(manualBarcode)}>
                        <Check className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Pakkeliste</h2>
                    {manifest.orders.map((item) => (
                        <div 
                            key={item.orderId}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                                item.status === 'loaded' 
                                    ? "bg-green-50 border-green-200 text-green-900" 
                                    : "bg-white border-slate-100 shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                    item.status === 'loaded' ? "bg-green-200" : "bg-slate-100"
                                )}>
                                    {item.status === 'loaded' ? <Check className="h-5 w-5" /> : <Package className="h-5 w-5 text-slate-400" />}
                                </div>
                                <div>
                                    <div className="font-mono font-bold text-sm tracking-tighter">{item.barcode}</div>
                                    <div className="text-[10px] uppercase font-bold opacity-60">Status: {item.status === 'loaded' ? 'Lastet' : 'Venter'}</div>
                                </div>
                            </div>
                            {item.status === 'pending' && (
                                <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleScan(item.barcode)}>
                                    Marker lastet
                                </Button>
                            )}
                        </div>
                    ))}
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
