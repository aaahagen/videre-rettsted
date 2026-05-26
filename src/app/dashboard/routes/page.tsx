'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { 
    Plus, 
    Loader2, 
    Trash2, 
    MapPin, 
    Route as RouteIcon, 
    Car, 
    Clock, 
    SearchX, 
    CheckCircle2, 
    Copy, 
    Play, 
    Calendar,
    Target,
    ArrowRight,
    LayoutGrid,
    Target as TargetIcon,
    Sparkles,
    Filter,
    Package,
    ClipboardList,
    Navigation,
    Truck
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { firebaseDB } from '@/lib/firebase/database';
import { db, auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Route, Manifest } from '@/lib/types';
import { useSearch } from '@/hooks/use-search';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

/**
 * RoutesPage viser en oversikt over aktive ruter og rutemaler.
 */
export default function RoutesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState(false);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const { query: searchQuery, setContext } = useSearch();
  const [activeTab, setActiveTab] = useState("active");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setContext('Ruter', '/dashboard/routes/new');
    return () => setContext('Steder', '/dashboard/new');
  }, [setContext]);

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(userDoc => {
        setUserData(userDoc);
        if (userDoc?.orgId) {
          firebaseDB.getUsers(userDoc.orgId).then(setOrganizationUsers);

          // Listen to routes
          const routesRef = collection(db, 'routes');
          const qRoutes = query(routesRef, where('orgId', '==', userDoc.orgId));
          const unsubRoutes = onSnapshot(qRoutes, (snapshot) => {
            const routesData: Route[] = [];
            snapshot.forEach((doc) => {
              routesData.push({ id: doc.id, ...doc.data() } as Route);
            });
            routesData.sort((a, b) => {
                const timeA = a.createdAt ? ('toMillis' in a.createdAt ? (a.createdAt as any).toMillis() : new Date(a.createdAt as any).getTime()) : 0;
                const timeB = b.createdAt ? ('toMillis' in b.createdAt ? (b.createdAt as any).toMillis() : new Date(b.createdAt as any).getTime()) : 0;
                return timeB - timeA;
            });
            setRoutes(routesData);
          });

          // Listen to manifests
          const manifestsRef = collection(db, 'organizations', userDoc.orgId, 'manifests');
          const unsubManifests = onSnapshot(manifestsRef, (snapshot) => {
              const manifestsData: Manifest[] = [];
              snapshot.forEach((doc) => {
                  manifestsData.push({ id: doc.id, ...doc.data() } as Manifest);
              });
              setManifests(manifestsData);
          });
          
          return () => {
              unsubRoutes();
              unsubManifests();
          };
        }
      });
    }
  }, [user]);

  const filteredRoutes = useMemo(() => {
    let filtered = routes;
    if (userData?.role !== 'admin' && userData?.role !== 'owner' && userData?.role !== 'super_admin') {
      filtered = filtered.filter(route => route.driverId === user?.uid);
    }
    if (activeTab === 'active') {
        filtered = filtered.filter(r => r.status !== 'template');
    } else {
        filtered = filtered.filter(r => r.status === 'template');
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(route => 
        route.name.toLowerCase().includes(lowerQuery) || 
        (route.shipmentNumber && route.shipmentNumber.toLowerCase().includes(lowerQuery)) ||
        organizationUsers.find(u => u.id === route.driverId)?.name?.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [routes, userData, user?.uid, searchQuery, organizationUsers, activeTab]);

  const handleDeleteClick = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation();
    setRouteToDelete(route);
    setDeleteConfirmation('');
  };

  const confirmDeleteRoute = async () => {
    if (!routeToDelete || deleteConfirmation.toLowerCase() !== 'slett rute' || !userData?.orgId) return;
    
    setIsDeleting(true);
    try {
      await firebaseDB.deleteRoute(userData.orgId, routeToDelete.id as string);
      setRouteToDelete(null);
      toast({ title: "Rute slettet" });
    } catch (err) {
      console.error('Error deleting route:', err);
      toast({ title: "Feil", description: "Kunne ikke slette ruten.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation('');
    }
  };

  const handleCreateFromTemplate = async (e: React.MouseEvent, template: Route) => {
      e.stopPropagation();
      if (!userData?.orgId) return;

      setIsCreatingFromTemplate(true);
      try {
          const newRoute = await firebaseDB.createRoute({
              name: `Kopi: ${template.name}`,
              orgId: userData.orgId,
              places: template.places,
              startAddress: template.startAddress,
              endAddress: template.endAddress,
              notes: template.notes,
              prepTimeStart: template.prepTimeStart,
              prepTimeEnd: template.prepTimeEnd,
              breakTime: template.breakTime,
              fuelServiceTime: template.fuelServiceTime,
              date: new Date().toISOString().split('T')[0],
              status: 'active'
          });

          toast({ title: "Rute opprettet fra mal" });
          router.push(`/dashboard/routes/${newRoute.id}`);
      } catch (error) {
          console.error(error);
          toast({ title: "Feil", description: "Kunne ikke opprette rute fra mal.", variant: "destructive" });
      } finally {
          setIsCreatingFromTemplate(false);
      }
  };

  if (loading) {
    return <SplashScreen />;
  }
  if (error || !user) {
    router.push('/login');
    return null;
  }

  const isAdmin = userData?.role === 'admin' || userData?.role === 'owner' || userData?.role === 'super_admin';

  const getRouteStatus = (route: Route) => {
      if (route.status === 'completed') return { label: 'FULLFØRT', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      
      const manifest = manifests.find(m => m.routeId === route.id);
      if (!manifest) return { label: 'KLARGJØRES', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock };

      switch (manifest.status) {
          case 'pending':
              return { label: 'VENTER PÅ RAMPEN', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: ClipboardList };
          case 'loading':
          case 'verified':
              return { label: 'LASTES', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Package };
          case 'departed':
              return { label: 'UNDERVEIS', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Truck };
          default:
              return { label: 'KLARGJØRES', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock };
      }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-10 mb-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 flex items-center gap-4">
                <RouteIcon className="h-10 w-10 text-indigo-600 shrink-0" />
                Ruteoversikt
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">
                {isAdmin 
                    ? "Full kontroll over organisasjonens aktive distribusjonsruter." 
                    : "Dine tildelte oppdrag og ruter."}
            </p>
        </div>
        
        {isAdmin && (
            <Button 
                asChild
                size="lg" 
                className="w-full md:w-auto h-14 px-8 text-lg font-black gap-3 shadow-xl bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95"
            >
                <Link href="/dashboard/routes/new">
                    <Plus className="h-6 w-6" /> Ny Rute
                </Link>
            </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <TabsList className="flex w-fit bg-slate-100 p-1 rounded-xl h-12 shadow-inner">
                <TabsTrigger value="active" className="px-6 font-bold uppercase text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                    Aktive Oppdrag
                </TabsTrigger>
                <TabsTrigger value="template" className="px-6 font-bold uppercase text-[10px] sm:text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                    Rutemaler
                </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-4">
                {searchQuery && (
                    <Badge variant="secondary" className="h-8 px-4 font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Filter className="h-3 w-3 mr-2" /> Viser søkeresultater
                    </Badge>
                )}
            </div>
        </div>

        <TabsContent value="active" className="mt-0 focus-visible:outline-none">
            {filteredRoutes.length === 0 ? (
                <div className="h-[40vh] min-h-[300px] flex flex-col items-center justify-center text-center space-y-6 border-4 border-dashed rounded-[2.5rem] bg-slate-50/50 border-slate-100 p-8">
                    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 shrink-0">
                        <RouteIcon className="h-12 w-12 sm:h-16 sm:w-16 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Ingen ruter her</h3>
                        <p className="text-sm sm:text-base text-slate-500 max-w-sm font-medium">
                            {isAdmin 
                                ? "Det er ingen aktive ruter i systemet akkurat nå." 
                                : "Du har ingen tildelte ruter i dag."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRoutes.map(route => {
                        const totalStops = route.places?.length || 0;
                        const completedStopsCount = route.completedStops?.length || 0;
                        const isFinished = totalStops > 0 && completedStopsCount >= totalStops;
                        const progress = totalStops > 0 ? (completedStopsCount / totalStops) * 100 : 0;
                        const createdAtDate = (route.createdAt as any)?.toDate ? (route.createdAt as any).toDate() : new Date(route.createdAt as any);
                        const driver = organizationUsers.find(u => u.id === route.driverId);
                        const status = getRouteStatus(route);

                        return (
                            <Card 
                                key={route.id} 
                                className={cn(
                                    "group cursor-pointer transition-all duration-300 overflow-hidden flex flex-col h-full relative rounded-2xl border-2",
                                    isFinished 
                                        ? "border-emerald-100 bg-emerald-50/5 hover:border-emerald-200" 
                                        : "border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 bg-white"
                                )}
                                onClick={() => router.push(`/dashboard/routes/${route.id}`)}
                            >
                                {/* Indicator Line */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                                    isFinished ? "bg-emerald-500" : "bg-slate-200 group-hover:bg-indigo-500"
                                )} />

                                <CardHeader className="pb-4 pt-6 px-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "p-1.5 rounded-lg shrink-0",
                                                    isFinished ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"
                                                )}>
                                                    <TargetIcon className="h-4 w-4" />
                                                </div>
                                                <CardTitle className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{route.name}</CardTitle>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" /> 
                                                    {isNaN(createdAtDate.getTime()) ? 'Ukjent' : createdAtDate.toLocaleDateString()}
                                                </div>
                                                {route.shipmentNumber && (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-slate-200">•</span>
                                                        <Package className="h-3 w-3" />
                                                        {route.shipmentNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-6 pt-2 px-6 flex-grow flex flex-col">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                <MapPin className="h-3 w-3 text-indigo-500" /> Stopp
                                            </div>
                                            <p className="text-lg font-black text-slate-800">{totalStops}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all">
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                <Clock className="h-3 w-3 text-amber-500" /> Varighet
                                            </div>
                                            <p className="text-lg font-black text-slate-800">{route.duration || '--'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Car className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ansvarlig Sjåfør</span>
                                                <span className="text-sm font-bold text-slate-700 truncate">
                                                    {route.driverId ? (driver?.name || 'Tildelt') : <span className="text-amber-600 italic">Venter på tildeling...</span>}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mt-auto">
                                        <div className="flex items-center justify-between">
                                            <Badge className={cn("font-bold text-[9px] px-2 py-0.5 rounded-md border shadow-none", status.color)}>
                                                <status.icon className="h-3 w-3 mr-1.5" />
                                                {status.label}
                                            </Badge>
                                            <span className="text-[10px] font-black text-slate-900">{completedStopsCount}/{totalStops} stopp</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center px-0.5">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Fremdrift</span>
                                                <span className="text-[8px] font-black text-slate-400">{Math.round(progress)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-1.5 bg-slate-100" indicatorClassName={isFinished ? "bg-emerald-500" : "bg-indigo-600"} />
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto flex flex-col gap-2">
                                    <Button variant="ghost" className="w-full text-indigo-600 font-black uppercase text-[10px] tracking-widest gap-2 group-hover:bg-indigo-50 rounded-xl">
                                        Se detaljer <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                    {isAdmin && (
                                        <Button 
                                            variant="ghost" 
                                            className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50 font-black uppercase text-[9px] tracking-widest gap-2 rounded-xl h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => handleDeleteClick(e, route)}
                                        >
                                            <Trash2 className="h-3 w-3" /> Slett Rute
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </TabsContent>

        <TabsContent value="template" className="mt-0 focus-visible:outline-none">
            {filteredRoutes.length === 0 ? (
                <div className="h-[40vh] min-h-[300px] flex flex-col items-center justify-center text-center space-y-6 border-4 border-dashed rounded-[2.5rem] bg-slate-50/50 border-slate-100 p-8">
                    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 shrink-0">
                        <Copy className="h-12 w-12 sm:h-16 sm:w-16 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Ingen rutemaler</h3>
                        <p className="text-sm sm:text-base text-slate-500 max-w-sm font-medium">
                            Lagre en rute som mal for å enkelt kunne gjenta den senere uten å legge til stopp manuelt.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRoutes.map(template => (
                        <Card key={template.id} className="group overflow-hidden flex flex-col h-full bg-white border-2 border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-200 transition-all rounded-2xl relative">
                             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-400 opacity-20" />
                             
                             <CardHeader className="pb-4 pt-6 px-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                                                <Copy className="h-4 w-4" />
                                            </div>
                                            <CardTitle className="text-xl font-black text-slate-900 truncate">{template.name}</CardTitle>
                                        </div>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Mal-konfigurasjon</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2 px-6 flex-grow">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-indigo-500" />
                                        <span className="text-sm font-bold text-slate-700">{template.places?.length || 0} faste stopp</span>
                                    </div>
                                </div>
                                {template.notes && (
                                    <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed text-xs text-slate-500 italic line-clamp-3">
                                        "{template.notes}"
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 border-t p-6 mt-auto flex flex-col gap-3">
                                <Button 
                                    className="w-full h-12 font-black uppercase text-xs tracking-widest bg-slate-900 hover:bg-indigo-600 shadow-lg transition-all rounded-xl gap-2" 
                                    onClick={(e) => handleCreateFromTemplate(e, template)}
                                    disabled={isCreatingFromTemplate}
                                >
                                    {isCreatingFromTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                    Opprett fra mal
                                </Button>
                                {isAdmin && (
                                    <Button 
                                        variant="outline"
                                        className="w-full h-10 font-black uppercase text-[10px] tracking-widest border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all rounded-xl gap-2" 
                                        onClick={(e) => handleDeleteClick(e, template)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Slett Mal
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </TabsContent>
      </Tabs>
          
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!routeToDelete} onOpenChange={(open) => !open && setRouteToDelete(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Slett rute</DialogTitle>
            <DialogDescription className="font-medium">
              Er du sikker på at du vil slette <span className="text-slate-900 font-bold">"{routeToDelete?.name}"</span>? Denne handlingen kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <Label className="text-xs font-black uppercase text-slate-400 ml-1">Bekreft sletting</Label>
              <Input 
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Skriv 'slett rute'"
                className="h-12 rounded-xl border-2 border-slate-100 font-bold focus:border-red-200"
              />
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setRouteToDelete(null)} disabled={isDeleting} className="rounded-xl h-12 font-bold px-6">Avbryt</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRoute}
              disabled={deleteConfirmation.toLowerCase() !== 'slett rute' || isDeleting}
              className="rounded-xl h-12 font-black uppercase text-xs tracking-widest px-8 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Slett permanent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
