'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Package, 
  Loader2, 
  Save, 
  MapPin, 
  Barcode, 
  Search, 
  Check, 
  ChevronLeft,
  Info
} from 'lucide-react';

import { firebaseDB } from '@/lib/firebase/database';
import { auth } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Place, Order } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const orderSchema = z.object({
  barcode: z.string().min(3, 'Strekkode må være minst 3 tegn.'),
  placeId: z.string().min(1, 'Du må velge en destinasjon.'),
  description: z.string().min(3, 'Beskrivelse er påkrevd.'),
  weight: z.number().optional(),
  volume: z.number().optional(),
  form: z.enum(['pallet', 'package', 'liquid', 'other']),
  numberOfItems: z.number().int().min(1, 'Antall varer må være minst 1.').default(1), // Added validation for number of items
  adr: z.boolean().default(false),
  temperatureControlled: z.boolean().default(false),
  fragile: z.boolean().default(false),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function NewOrderPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      barcode: '',
      placeId: '',
      description: '',
      weight: 0,
      volume: 0,
      form: 'package',
      numberOfItems: 1, // Default value
      adr: false,
      temperatureControlled: false,
      fragile: false,
    },
  });

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
    }
  }, [user, loadingAuth, router]);

  useEffect(() => {
    async function fetchPlaces() {
      if (user) {
        try {
          const userDoc = await firebaseDB.getUser(user.uid);
          if (userDoc?.orgId) {
            const placesData = await firebaseDB.getPlaces(userDoc.orgId);
            setPlaces(placesData);
          }
        } catch (error) {
          console.error('Error fetching places:', error);
        } finally {
          setIsLoadingPlaces(false);
        }
      }
    }
    fetchPlaces();
  }, [user]);

  const onSubmit = async (data: OrderFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userDoc = await firebaseDB.getUser(user.uid);
      if (!userDoc?.orgId) throw new Error('Ingen organisasjons-ID funnet.');

      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orgId: userDoc.orgId,
        barcode: data.barcode,
        placeId: data.placeId,
        status: 'pending',
        details: {
          description: data.description,
          weight: data.weight,
          volume: data.volume,
          form: data.form,
          numberOfItems: data.numberOfItems, // Save the number of items
          specialRequirements: {
            adr: data.adr,
            temperatureControlled: data.temperatureControlled,
            fragile: data.fragile,
          },
        },
      };

      await firebaseDB.createOrder(orderData);
      toast({
        title: 'Ordre Opprettet',
        description: `Ordre med strekkode ${data.barcode} og ${data.numberOfItems} varer er nå registrert.`,
        action: (
          <Button 
            variant="secondary"
            onClick={() => {
              // TODO: Implement actual barcode/QR code generation and printing here
              console.log(`Printing barcode for order: ${data.barcode}, items: ${data.numberOfItems}`);
              toast({
                title: "Printfunksjon",
                description: "Denne funksjonen er under utvikling."
              });
            }}
          >
            Print Strekkode/QR
          </Button>
        )
      });
      router.push('/dashboard/orders');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Feil',
        description: error.message || 'Kunne ikke opprette ordren.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth || isLoadingPlaces) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Opprett Ny Ordre</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5 text-primary" />
                Grunnleggende Informasjon
              </CardTitle>
              <CardDescription>
                Identifiser forsendelsen med en unik strekkode og destinasjon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strekkode / Sporingsnummer</FormLabel>
                      <FormControl>
                        <Input placeholder="F.eks. SHIP-123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="placeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinasjon (Sted)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg leveringssted" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {places.map((place) => (
                            <SelectItem key={place.id} value={place.id}>
                              {place.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Innholdsbeskrivelse</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="F.eks. 3 esker med kontorutstyr" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Fysiske Detaljer & Krav
              </CardTitle>
              <CardDescription>
                Spesifiser varetype, vekt og spesielle håndteringskrav.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="form"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="package">Pakke</SelectItem>
                          <SelectItem value="pallet">Pall</SelectItem>
                          <SelectItem value="liquid">Væske</SelectItem>
                          <SelectItem value="other">Annet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField // New field for numberOfItems
                  control={form.control}
                  name="numberOfItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antall Kolli/Paller</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          min={1}
                        />
                      </FormControl>
                      <FormDescription>
                        Antall individuelle pakker eller paller i denne ordren.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vekt (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volum (m³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          step="0.1"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <FormLabel>Spesielle Krav</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="adr"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>ADR</FormLabel>
                          <FormDescription className="text-[10px]">
                            Farlig gods
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temperatureControlled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Kjøl/Frys</FormLabel>
                          <FormDescription className="text-[10px]">
                            Temp. kontroll
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fragile"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Skjør</FormLabel>
                          <FormDescription className="text-[10px]">
                            Forsiktig behandling
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oppretter...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Opprett Ordre
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
