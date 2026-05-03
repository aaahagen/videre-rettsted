'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Trash2, MapPin, Route as RouteIcon, Car, Clock, SearchX, CheckCircle2, Copy, Play, Calendar } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { firebaseDB } from '@/lib/firebase/database';
import { db, auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Route } from '@/lib/types';
import { useSearch } from '@/hooks/use-search';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function RoutesPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState(false);
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const { query: searchQuery, setContext } = useSearch();
  const [activeTab, setActiveTab] = useState("active");
  const router = useRouter();
  const { toast } = useToast();

  // Set context for global search
  useEffect(() => {
    setContext('Ruter', '/dashboard/routes/new');
    return () => setContext('Steder', '/dashboard/new'); // Reset context on unmount
  }, [setContext]);

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(userDoc => {
        setUserData(userDoc);
        if (userDoc?.orgId) {
          firebaseDB.getUsers(userDoc.orgId).then(setOrganizationUsers);

          const routesRef = collection(db, 'routes');
          const q = query(routesRef, where('orgId', '==', userDoc.orgId));
          
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const routesData: Route[] = [];
            snapshot.forEach((doc) => {
              routesData.push({ id: doc.id, ...doc.data() } as Route);
            });
            // Sort by created/updated
            routesData.sort((a, b) => {
                const timeA = a.createdAt ? ('toMillis' in a.createdAt ? (a.createdAt as any).toMillis() : new Date(a.createdAt as any).getTime()) : 0;
                const timeB = b.createdAt ? ('toMillis' in b.createdAt ? (b.createdAt as any).toMillis() : new Date(b.createdAt as any).getTime()) : 0;
                return timeB - timeA;
            });
            setRoutes(routesData);
          });
          
          return () => unsubscribe();
        }
      });
    }
  }, [user]);

  const filteredRoutes = useMemo(() => {
    let filtered = routes;
    
    // Admin sees all, drivers see only their own
    if (userData?.role !== 'admin') {
      filtered = filtered.filter(route => route.driverId === user?.uid);
    }
    
    // Filter by tab
    if (activeTab === 'active') {
        filtered = filtered.filter(r => r.status !== 'template');
    } else {
        filtered = filtered.filter(r => r.status === 'template');
    }

    // Apply search filter
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
    e.stopPropagation(); // Prevent card click
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

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Ruteplanlegging</h1>
          <p className="text-slate-500 mt-1 font-medium">
             {userData?.role === 'admin' 
               ? "Administrer aktive ruter og lagre faste ruter som maler." 
               : "Oversikt over dine tildelte ruter."}
          </p>
        </div>
        
        {userData?.role === 'admin' && (
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">
                <Link href="/dashboard/routes/new">
                    <Plus className="mr-2 h-5 w-5" /> Ny Rute
                </Link>
            </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <TabsList className="bg-slate-100 p-1">
                <TabsTrigger value="active" className="font-bold px-6 data-[state=active]:bg-white data-[state=active]:text-indigo-600">Aktive Ruter</TabsTrigger>
                <TabsTrigger value="template" className="font-bold px-6 data-[state=active]:bg-white data-[state=active]:text-indigo-600">Maler</TabsTrigger>
            </TabsList>
            
            {activeTab === 'template' && userData?.role === 'admin' && (
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">
                    Tips: Lagre en eksisterende rute som mal fra rutedetaljene.
                </p>
            )}
        </div>

        <TabsContent value="active" className="mt-0">
            {filteredRoutes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
                    <div className="rounded-full bg-white shadow-sm p-6 mb-4">
                        <RouteIcon className="h-10 w-10 text-slate-200" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Ingen aktive ruter</h2>
                    <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm font-medium">
                        {userData?.role === 'admin' ? "Du har ingen aktive ruter for øyeblikket." : "Du har ingen ruter tildelt deg ennå."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoutes.map(route => {
                        const totalStops = route.places?.length || 0;
                        const completedStopsCount = route.completedStops?.length || 0;
                        const isFinished = totalStops > 0 && completedStopsCount >= totalStops;
                        const createdAtDate = (route.createdAt as any)?.toDate ? (route.createdAt as any).toDate() : new Date(route.createdAt as any);

                        return (
                            <Card 
                                key={route.id} 
                                className={`group cursor-pointer transition-all duration-300 overflow-hidden flex flex-col h-full bg-white hover:border-indigo-200 ${isFinished ? 'border-green-200 bg-green-50/10' : 'border-slate-200 shadow-sm hover:shadow-md'}`}
                                onClick={() => router.push(`/dashboard/routes/${route.id}`)}
                            >
                                <div className={`h-1.5 w-full ${isFinished ? 'bg-green-500' : 'bg-slate-200 group-hover:bg-indigo-400 transition-colors'}`} />
                                <CardHeader className="pb-2 pt-5">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{route.name}</CardTitle>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                <Calendar className="h-3 w-3" /> {isNaN(createdAtDate.getTime()) ? 'Ukjent' : createdAtDate.toLocaleDateString()}
                                                {route.shipmentNumber && <span>• {route.shipmentNumber}</span>}
                                            </div>
                                        </div>
                                        {userData?.role === 'admin' && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={(e) => handleDeleteClick(e, route)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-4 pt-4 flex-grow flex flex-col">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-indigo-500" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Stopp</span>
                                                <span className="text-sm font-bold text-slate-700">{totalStops}</span>
                                            </div>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-amber-500" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Tid</span>
                                                <span className="text-sm font-bold text-slate-700">{route.duration || '--'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                        <Car className="h-4 w-4 text-emerald-500" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Sjåfør</span>
                                            <span className="text-sm font-bold text-slate-700 truncate">
                                                {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name || 'Tildelt') : <span className="text-amber-600">Venter på tildeling</span>}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-auto">
                                        {isFinished ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-bold border-green-200">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> FULLFØRT
                                            </Badge>
                                        ) : route.driverId ? (
                                            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 font-bold border-indigo-100">
                                                AKTIV
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400 font-bold border-slate-200">
                                                KLARGJØRES
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </TabsContent>

        <TabsContent value="template" className="mt-0">
            {filteredRoutes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
                    <div className="rounded-full bg-white shadow-sm p-6 mb-4">
                        <Copy className="h-10 w-10 text-slate-200" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Ingen maler lagret</h2>
                    <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm font-medium">
                        Lagre en rute som mal for å enkelt kunne gjenta den senere uten å legge til stopp manuelt.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoutes.map(template => (
                        <Card key={template.id} className="group overflow-hidden flex flex-col h-full bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                             <CardHeader className="pb-2 pt-5">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-black text-slate-900">{template.name}</CardTitle>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Rutemal</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={(e) => handleDeleteClick(e, template)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4 flex-grow">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-indigo-500" />
                                        <span className="text-sm font-bold text-slate-700">{template.places?.length || 0} faste stopp</span>
                                    </div>
                                </div>
                                {template.notes && (
                                    <p className="text-xs text-slate-500 line-clamp-2 italic">"{template.notes}"</p>
                                )}
                            </CardContent>
                            <CardFooter className="bg-slate-50 border-t p-4 mt-auto">
                                <Button 
                                    className="w-full font-bold bg-indigo-600 hover:bg-indigo-700" 
                                    onClick={(e) => handleCreateFromTemplate(e, template)}
                                    disabled={isCreatingFromTemplate}
                                >
                                    {isCreatingFromTemplate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                    Opprett Aktiv Rute
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </TabsContent>
      </Tabs>
          
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!routeToDelete} onOpenChange={(open) => !open && setRouteToDelete(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Slett rute</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette <strong>{routeToDelete?.name}</strong>? Denne handlingen kan ikke angres.
              For å bekrefte, skriv <strong>slett rute</strong> i feltet under.
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Skriv 'slett rute'"
            className="mt-4"
          />
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setRouteToDelete(null)} disabled={isDeleting}>Avbryt</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRoute}
              disabled={deleteConfirmation.toLowerCase() !== 'slett rute' || isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Slett permanent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
