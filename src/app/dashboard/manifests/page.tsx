'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { Manifest, Route, Vehicle, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Truck, CheckCircle2, QrCode, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/use-search';

type ManifestWithDetails = Manifest & { route?: Route, vehicle?: Vehicle };

export default function ManifestsPage() {
    const { dbUser } = useAuth();
    const { toast } = useToast();
    const [manifests, setManifests] = useState<ManifestWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { query } = useSearch();

    useEffect(() => {
        if (dbUser?.orgId) {
            loadManifests();
        }
    }, [dbUser]);

    const loadManifests = async () => {
        if (!dbUser?.orgId) return;
        
        try {
            setIsLoading(true);
            const routes = await firebaseDB.getRoutes(dbUser.orgId);
            const vehicles = await firebaseDB.getVehicles(dbUser.orgId);
            
            const manifestPromises = routes.map(async (route) => {
                const manifest = await firebaseDB.getManifestByRoute(dbUser.orgId, route.id);
                if (manifest) {
                    const vehicle = vehicles.find(v => v.id === manifest.vehicleId);
                    const withDetails: ManifestWithDetails = { ...manifest, route, vehicle };
                    return withDetails;
                }
                return null;
            });

            const results = await Promise.all(manifestPromises);
            const validResults = results.filter((m): m is ManifestWithDetails => m !== null);
            setManifests(validResults);
        } catch (error) {
            console.error("Error loading manifests:", error);
            toast({
                title: "Feil",
                description: "Kunne ikke laste inn manifester.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredManifests = manifests.filter(m => 
        m.route?.name.toLowerCase().includes(query.toLowerCase()) ||
        m.vehicle?.registrationNumber?.toLowerCase().includes(query.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lasterampe</h1>
                    <p className="text-muted-foreground">Oversikt over ruter som skal lastes og verifiseres.</p>
                </div>
                <Button onClick={loadManifests} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Oppdater
                </Button>
            </div>

            {filteredManifests.length === 0 ? (
                <Card className="bg-slate-50/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">Ingen aktive lasteplaner funnet.</p>
                        <p className="text-sm text-slate-400">Opprett ruter og tildel kjøretøy for å se dem her.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredManifests.map((manifest) => (
                        <Card key={manifest.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge 
                                        variant="secondary"
                                        className={cn(
                                            "capitalize",
                                            manifest.status === 'verified' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                            manifest.status === 'loading' ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : ""
                                        )}
                                    >
                                        {manifest.status === 'verified' ? 'Verifisert' : 
                                         manifest.status === 'loading' ? 'Laster...' : 'Venter'}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        {manifest.id.slice(0, 8)}
                                    </div>
                                </div>
                                <CardTitle className="text-xl">{manifest.route?.name || 'Navnløs rute'}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Truck className="h-3 w-3" />
                                    {manifest.vehicle?.registrationNumber || 'Uten bil'} • {manifest.vehicle?.type || 'Lastebil'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Fremdrift:</span>
                                        <span className="font-bold">
                                            {manifest.orders.filter(o => o.status === 'loaded').length} / {manifest.orders.length} kolli
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div 
                                            className="bg-primary h-2 rounded-full transition-all duration-500" 
                                            style={{ width: `${(manifest.orders.filter(o => o.status === 'loaded').length / manifest.orders.length) * 100}%` }}
                                        />
                                    </div>
                                    <Button asChild className="w-full mt-2" variant={manifest.status === 'verified' ? 'outline' : 'default'}>
                                        <Link href={`/dashboard/manifests/${manifest.id}`}>
                                            <QrCode className="mr-2 h-4 w-4" />
                                            {manifest.status === 'verified' ? 'Se detaljer' : 'Start skanning'}
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
