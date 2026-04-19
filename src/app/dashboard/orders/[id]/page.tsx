'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
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

export default function OrderDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (user && orderId) {
        try {
          const userDoc = await firebaseDB.getUser(user.uid);
          const orgId = userDoc?.orgId;

          if (!orgId) {
            throw new Error('Organization ID not found for the current user.');
          }

          const fetchedOrder = await firebaseDB.getOrder(orgId, orderId);
          setOrder(fetchedOrder);

          if (fetchedOrder?.placeId) {
            const fetchedPlace = await firebaseDB.getPlace(fetchedOrder.placeId);
            setPlace(fetchedPlace);
          }
        } catch (err) {
          console.error('Error fetching order details:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrderDetails();
  }, [user, orderId]);

  if (loading || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Feil: {error.message}</p>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ordre ikke funnet</h2>
        <p className="text-muted-foreground mb-6">Det kan hende at ordren er slettet eller ID-en er feil.</p>
        <Button onClick={() => router.push('/dashboard/orders')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake til Ordrer
        </Button>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/orders')} className="pl-0 hover:bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake til Ordrer
        </Button>
        <BarcodeGenerator order={order} place={place} />
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Package className="h-6 w-6 text-primary" />
            Ordre: {order.barcode || order.id}
          </CardTitle>
          <CardDescription>Detaljer for denne leveringsordren.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              {getStatusBadge(order.status)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Beskrivelse</p>
              <p className="font-medium">{order.details?.description || 'Ingen beskrivelse'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Antall kolli</p>
              <p className="font-medium">{order.details?.numberOfItems || 1} stk</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vekt</p>
              <p className="font-medium">{order.details?.weight ? `${order.details.weight} kg` : 'Ikke spesifisert'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volum</p>
              <p className="font-medium">{order.details?.volume ? `${order.details.volume} m³` : 'Ikke spesifisert'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Opprettet</p>
              <p className="font-medium">
                {(order.createdAt as any)?.toDate 
                  ? format((order.createdAt as any).toDate(), 'PPP HH:mm', { locale: nb }) 
                  : 'Ukjent dato'}
              </p>
            </div>
            {order.updatedAt && (
                <div>
                    <p className="text-sm text-muted-foreground">Sist oppdatert</p>
                    <p className="font-medium">
                        {(order.updatedAt as any)?.toDate 
                        ? format((order.updatedAt as any).toDate(), 'PPP HH:mm', { locale: nb }) 
                        : 'Ukjent dato'}
                    </p>
                </div>
            )}
          </div>

          <div className="border-t pt-6 mt-6 space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-secondary" /> Destinasjon
            </h3>
            {place ? (
              <div className="space-y-1">
                <p className="font-medium">{place.name}</p>
                <p className="text-muted-foreground">{place.address}</p>
                {place.description && <p className="text-sm text-muted-foreground">{place.description}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Destinasjonssted ikke funnet.</p>
            )}
          </div>

          {order.routeId && (
            <div className="border-t pt-6 mt-6 space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <ArrowLeft className="h-5 w-5 text-secondary" /> Rute
              </h3>
              <p className="font-medium">Denne ordren er tildelt rute ID: {order.routeId}</p>
              {/* Future: Link to route details page */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
