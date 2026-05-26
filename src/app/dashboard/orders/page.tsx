'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Loader2, 
  SearchX, 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Trash2,
  Upload,
  Printer,
  CheckSquare,
  Square
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

import { firebaseDB } from '@/lib/firebase/database';
import { db, auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/use-search';
import { Order, Place } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { OrderImport } from '@/components/admin/order-import';
import { BulkBarcodeGenerator } from '@/components/orders/bulk-barcode-generator';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [places, setPlaces] = useState<Record<string, Place>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  const { query: searchQuery, setContext } = useSearch();
  const { setQuery } = useSearch();
  const { toast } = useToast();

  useEffect(() => {
    setQuery("");
  }, [setQuery]);
  const router = useRouter();

  useEffect(() => {
    setContext('Ordrer', '/dashboard/orders/new');
  }, [setContext]);

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(userDoc => {
        setUserData(userDoc);
        if (userDoc?.orgId) {
          const ordersRef = collection(db, 'organizations', userDoc.orgId, 'orders');
          const q = query(ordersRef, orderBy('createdAt', 'desc'));
          
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData: Order[] = [];
            snapshot.forEach((doc) => {
              ordersData.push({ id: doc.id, ...doc.data() } as Order);
            });
            setOrders(ordersData);
            setIsLoading(false);
          });

          firebaseDB.getPlaces(userDoc.orgId).then(placesData => {
            const placesMap: Record<string, Place> = {};
            placesData.forEach(p => {
              placesMap[p.id] = p;
            });
            setPlaces(placesMap);
          });
          
          return () => unsubscribe();
        }
      });
    }
  }, [user]);

  const displayedOrders = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return orders;
    
    const lowerQuery = searchQuery.toLowerCase();
    return orders.filter(order => 
      order.barcode?.toLowerCase().includes(lowerQuery) || 
      order.details?.description?.toLowerCase().includes(lowerQuery) ||
      places[order.placeId]?.name?.toLowerCase().includes(lowerQuery) ||
      places[order.placeId]?.address?.toLowerCase().includes(lowerQuery)
    );
  }, [orders, searchQuery, places]);

  const selectedOrders = useMemo(() => 
    orders.filter(o => selectedOrderIds.includes(o.id)),
    [orders, selectedOrderIds]
  );

  const toggleSelectOrder = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === displayedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(displayedOrders.map(o => o.id));
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Venter</Badge>;
      case 'loaded':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Lastet</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Levert</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Mislyktes</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setOrderToDelete(order);
    setDeleteConfirmation('');
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete || deleteConfirmation.toLowerCase() !== 'slett ordre' || !userData?.orgId) return;
    
    setIsDeleting(true);
    try {
      await firebaseDB.deleteOrder(userData.orgId, orderToDelete.id as string);
      toast({ title: 'Slettet', description: 'Ordren ble slettet.' });
      setOrderToDelete(null);
    } catch (err) {
      console.error('Error deleting order:', err);
      toast({ title: 'Feil', description: 'Kunne ikke slette ordren.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation('');
    }
  };


  if (loading || isLoading) {
    return <SplashScreen />;
  }

  if (error || !user) {
    router.push('/login');
    return null;
  }

  const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 mx-auto w-full px-4 max-w-7xl py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ordrer</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Oversikt over alle aktive og historiske leveringsordre.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && userData?.orgId && (
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" /> Bulk Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk-import av ordrer</DialogTitle>
                  <DialogDescription>
                    Last opp en CSV-fil for å opprette flere ordrer samtidig.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <OrderImport orgId={userData.orgId} />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={() => router.push('/dashboard/orders/new')}>
            <Plus className="mr-2 h-4 w-4" /> Opprett Ny Ordre
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Totalt</p>
                <h3 className="text-2xl font-bold">{orders.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Venter</p>
                <h3 className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Levert</p>
                <h3 className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Lastet</p>
                <h3 className="text-2xl font-bold">{orders.filter(o => o.status === 'loaded').length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Action Bar */}
      {selectedOrderIds.length > 0 && (
          <div className="sticky top-20 z-40 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-4">
                  <Badge className="bg-white text-indigo-600 hover:bg-white">{selectedOrderIds.length} valgt</Badge>
                  <p className="text-xs font-bold uppercase tracking-wider hidden md:block text-indigo-100">Handlinger for markerte ordrer</p>
              </div>
              <div className="flex items-center gap-2">
                  <BulkBarcodeGenerator 
                    orders={selectedOrders} 
                    places={places} 
                    buttonLabel="Skriv ut etiketter" 
                    variant="outline"
                    onComplete={() => setSelectedOrderIds([])} 
                  />
                  <Button variant="ghost" onClick={() => setSelectedOrderIds([])} className="text-white hover:bg-white/10 font-bold">
                      Avbryt
                  </Button>
              </div>
          </div>
      )}

      {displayedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <div className="rounded-full bg-slate-100 p-6 mb-4">
            {searchQuery ? <SearchX className="h-12 w-12 text-slate-300" /> : <Package className="h-12 w-12 text-slate-300" />}
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            {searchQuery 
              ? `Ingen ordrer matchet "${searchQuery}"` 
              : "Ingen ordrer funnet"}
          </h2>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            {searchQuery 
              ? "Prøv å søke etter et annet strekkodenummer eller destinasjon."
              : "Opprett din første ordre for å komme i gang."}
          </p>
          {!searchQuery && (
            <div className="flex items-center gap-2 mt-6">
               {isAdmin && userData?.orgId && (
                <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Bulk Import
                </Button>
              )}
              <Button onClick={() => router.push('/dashboard/orders/new')}>
                <Plus className="mr-2 h-4 w-4" /> Opprett Ny Ordre
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
              <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="text-xs font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">
                  {selectedOrderIds.length === displayedOrders.length ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
                  {selectedOrderIds.length === displayedOrders.length ? 'Velg ingen' : 'Velg alle'}
              </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {displayedOrders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);
              return (
                <Card 
                    key={order.id} 
                    className={cn(
                        "hover:shadow-md transition-all cursor-pointer group border-2",
                        isSelected ? "border-indigo-600 bg-indigo-50/20" : "border-transparent"
                    )} 
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 relative">
                    <div className="flex items-center gap-4">
                        <div 
                            className={cn(
                                "p-2 rounded transition-colors",
                                isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                            )}
                            onClick={(e) => toggleSelectOrder(e, order.id)}
                        >
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{order.barcode || 'Ingen strekkode'}</span>
                            {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1">{order.details?.description}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pr-8 sm:pr-12">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{places[order.placeId]?.name || 'Ukjent sted'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>
                            {(order.createdAt as any)?.toDate 
                            ? (order.createdAt as any).toDate().toLocaleDateString('no-NO') 
                            : new Date(order.createdAt as any).toLocaleDateString('no-NO')}
                        </span>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                onClick={(e) => handleDeleteClick(e, order)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett ordre</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette ordren <strong>{orderToDelete?.barcode || 'uten strekkode'}</strong>? 
              <br/><br/>
              Skriv <span className="font-bold text-slate-900">slett ordre</span> i feltet under for å bekrefte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input 
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Skriv 'slett ordre' her..."
              className="bg-slate-50 border-slate-200"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Avbryt</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteOrder}
              disabled={deleteConfirmation.toLowerCase() !== 'slett ordre' || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Slett permanent'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
