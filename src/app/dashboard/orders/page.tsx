'use client';

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
  BarChart3
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

import { firebaseDB } from '@/lib/firebase/database';
import { db, auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/use-search';
import { Order, Place } from '@/lib/types';

export default function OrdersPage() {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [places, setPlaces] = useState<Record<string, Place>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { query: searchQuery, setContext } = useSearch();
  const { setQuery } = useSearch();

  useEffect(() => {
    setQuery("");
  }, [setQuery]);
  const router = useRouter();

  // Set context for global search
  useEffect(() => {
    setContext('Ordrer', '/dashboard/orders/new');
  }, [setContext]);

  useEffect(() => {
    if (user) {
      firebaseDB.getUser(user.uid).then(userDoc => {
        setUserData(userDoc);
        if (userDoc?.orgId) {
          // Listen to orders
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

          // Fetch places to resolve names
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

  if (loading || isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error || !user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 mx-auto w-full px-4 max-w-7xl py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ordrer</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Oversikt over alle aktive og historiske leveringsordre.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/orders/new')} className="hidden sm:flex">
          <Plus className="mr-2 h-4 w-4" /> Ny Ordre
        </Button>
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
            <Button onClick={() => router.push('/dashboard/orders/new')} variant="outline" className="mt-6">
              <Plus className="mr-2 h-4 w-4" /> Opprett Ny Ordre
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded text-slate-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{order.barcode || 'Ingen strekkode'}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{order.details?.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
