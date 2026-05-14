'use client';

import { useEffect, useState, use } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Order, Place } from '@/lib/types';
import { Loader2, ArrowLeft, Package, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { BarcodeGenerator } from '@/components/orders/barcode-generator';
import Link from 'next/link';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const [user, loading, error] = useAuthState(auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchOrder() {
      if (orderId) {
        try {
          const orderData = await firebaseDB.getOrder(orderId);
          if (orderData) {
            setOrder(orderData as Order);
            if (orderData.placeId) {
              const placeData = await firebaseDB.getPlace(orderData.placeId);
              setPlace(placeData as Place);
            }
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Ordre ikke funnet</h2>
        <Button asChild className="mt-4">
            <Link href="/dashboard/orders">Tilbake til oversikt</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="-ml-2">
            <Link href="/dashboard/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake til ordrer
            </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                      Ordrenr: {order.orderNumber}
                    </Badge>
                    <Badge className={
                      order.status === 'delivered' ? 'bg-emerald-500' :
                      order.status === 'in_transit' ? 'bg-amber-500' :
                      'bg-slate-500'
                    }>
                      {order.status === 'pending' ? 'Venter' : 
                       order.status === 'assigned' ? 'Tildelt rute' :
                       order.status === 'in_transit' ? 'På vei' :
                       order.status === 'delivered' ? 'Levert' : 'Kansellert'}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black">{place?.name || 'Laster...'}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {place?.address}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vekt</span>
                    <p className="font-bold text-slate-700">{order.totalWeight || 0} kg</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Volum</span>
                    <p className="font-bold text-slate-700">{order.totalVolume || 0} m³</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Paller</span>
                    <p className="font-bold text-slate-700">{order.palletCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Kolli</span>
                    <p className="font-bold text-slate-700">{order.collieCount || 0}</p>
                  </div>
               </div>

               {order.items && order.items.length > 0 && (
                 <div className="mt-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Varelinjer</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left font-bold text-slate-500">Vare</th>
                            <th className="px-4 py-2 text-right font-bold text-slate-500">Antall</th>
                            <th className="px-4 py-2 text-left font-bold text-slate-500">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 font-medium">{item.description}</td>
                              <td className="px-4 py-3 text-right font-bold">{item.quantity}</td>
                              <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-tight">Historikk & Logg</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Ordre opprettet</p>
                      <p className="text-xs text-slate-400">{format(order.createdAt instanceof Date ? order.createdAt : (order.createdAt as any).toDate(), 'PPP HH:mm', { locale: nb })}</p>
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="bg-white border-2 border-slate-900 shadow-xl">
              <CardHeader className="p-6 pb-2 text-center">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Hovedkolli Strekkode</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex flex-col items-center">
                 <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4">
                    <BarcodeGenerator value={order.id} width={2} height={80} />
                 </div>
                 <p className="text-[10px] font-mono font-bold text-slate-400 mb-4">{order.id}</p>
                 <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => window.print()}>
                    Skriv ut etikett
                 </Button>
              </CardContent>
           </Card>

           {order.routeId && (
             <Card>
               <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-tight">Ruteinformasjon</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Package className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                          <p className="text-sm font-bold text-slate-700 capitalize">{order.status}</p>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                       <Link href={`/dashboard/routes/${order.routeId}`}>Se ruteplan</Link>
                    </Button>
                  </div>
               </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
