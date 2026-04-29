const fs = require('fs');

const file = 'src/app/dashboard/orders/new/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const completeRewrite = \`'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Info,
  Box, Plus, Trash2
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
import { calculateVolumetrics } from '@/lib/volumetrics';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Beskrivelse kreves'),
  quantity: z.number().int().min(1),
  type: z.enum(['keg', 'case', 'box', 'other']).default('box'),
  weightPerItem: z.number().optional().default(0),
  length: z.number().optional().default(0),
  width: z.number().optional().default(0),
  height: z.number().optional().default(0),
});

const orderSchema = z.object({
  barcode: z.string().min(3, 'Strekkode må være minst 3 tegn.'),
  placeId: z.string().min(1, 'Du må velge en destinasjon.'),
  description: z.string().min(3, 'Overordnet beskrivelse er påkrevd.'),
  adr: z.boolean().default(false),
  temperatureControlled: z.boolean().default(false),
  fragile: z.boolean().default(false),
  lineItems: z.array(lineItemSchema).min(1, 'Du må legge til minst én vare.'),
});

export default function NewOrderPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  
  const [userData, setUserData] = useState<any>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  
  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      barcode: '',
      placeId: '',
      description: '',
      adr: false,
      temperatureControlled: false,
      fragile: false,
      lineItems: [{ description: '', quantity: 1, type: 'box', weightPerItem: 0, length: 0, width: 0, height: 0 }]
    },
  });

  const { fields: lineItems, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems"
  });
  
  const currentItems = form.watch("lineItems");
  const volumetrics = calculateVolumetrics(currentItems as any[]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !authUser) {
      router.push('/login');
    } else if (authUser) {
      firebaseDB.getUser(authUser.uid).then((user) => {
        setUserData(user);
        if (user?.orgId) {
          firebaseDB.getPlaces(user.orgId).then((fetchedPlaces) => {
            setPlaces(fetchedPlaces);
            setLoadingPlaces(false);
          });
        }
      });
    }
  }, [authUser, loadingAuth, router]);

  const generateBarcode = () => {
    const prefix = 'VR';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    form.setValue('barcode', \`\${prefix}-\${timestamp}-\${random}\`);
  };

  async function onSubmit(data: z.infer<typeof orderSchema>) {
    setSubmitting(true);
    try {
      if (!userData?.orgId) throw new Error('Ingen organisasjon funnet.');

      const orderData: Omit<Order, 'id'> = {
        orgId: userData.orgId,
        placeId: data.placeId,
        status: 'pending',
        barcode: data.barcode,
        createdAt: new Date(),
        updatedAt: new Date(),
        details: {
          description: data.description,
          numberOfItems: volumetrics.totalItems,
          weight: volumetrics.totalWeight,
          volume: volumetrics.totalVolume,
          specialRequirements: {
            adr: data.adr,
            temperatureControlled: data.temperatureControlled,
            fragile: data.fragile,
          },
        },
        lineItems: data.lineItems.map((item, index) => ({
          id: \`item-\${index}-\${Date.now()}\`,
          ...item
        }))
      };

      await firebaseDB.createOrder(orderData);
      toast({
        title: 'Ordre Opprettet',
        description: \`Ordre med strekkode \${data.barcode} og \${volumetrics.totalItems} varer er nå registrert.\`,
        action: (
          <Button variant="secondary" onClick={() => console.log('Print', data.barcode)}>Skriv ut</Button>
        )
      });
      router.push('/dashboard/orders');
    } catch (error: any) {
      toast({ title: 'Feil', description: error.message || 'Kunne ikke opprette ordre.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingAuth || loadingPlaces) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Ny Ordre
            </h1>
            <p className="text-slate-500 text-sm">Registrer et nytt oppdrag og kalkuler palleplass.</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Ordredetaljer</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strekkode / Ordrenummer</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <div className="relative flex-1">
                            <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="F.eks. ORD-12345" className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <Button type="button" variant="outline" onClick={generateBarcode}>Generer</Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="placeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinasjon</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg leveringssted..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {places.map((place) => (
                            <SelectItem key={place.id} value={place.id!}>{place.name}</SelectItem>
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
                    <FormLabel>Overordnet Beskrivelse</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Generell informasjon om sendingen..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2"><Box className="w-5 h-5" /> Varer & Palletering</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, type: 'box', weightPerItem: 0, length: 0, width: 0, height: 0 })}>
                    <Plus className="w-4 h-4 mr-2" /> Legg til vare
                  </Button>
                </div>

                {lineItems.map((field, index) => (
                  <div key={field.id} className="p-4 bg-slate-50 border rounded-lg relative">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => remove(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                      <FormField
                        control={form.control}
                        name={\`lineItems.\${index}.description\`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beskrivelse</FormLabel>
                            <FormControl><Input placeholder="F.eks. Fat øl, Kasse cider..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={\`lineItems.\${index}.quantity\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Antall</FormLabel>
                              <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={\`lineItems.\${index}.type\`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="keg">Fat</SelectItem>
                                  <SelectItem value="case">Kasse</SelectItem>
                                  <SelectItem value="box">Eske</SelectItem>
                                  <SelectItem value="other">Annet</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={\`lineItems.\${index}.weightPerItem\`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vekt per (kg)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={\`lineItems.\${index}.length\`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lengde (cm)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={\`lineItems.\${index}.width\`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bredde (cm)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={\`lineItems.\${index}.height\`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Høyde (cm)</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">Palleteringsoversikt</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-blue-700 block">Totalt Antall:</span><span className="font-bold">{volumetrics.totalItems} varer</span></div>
                  <div><span className="text-blue-700 block">Total Vekt:</span><span className="font-bold">{volumetrics.totalWeight} kg</span></div>
                  <div><span className="text-blue-700 block">Total Volum:</span><span className="font-bold">{(volumetrics.totalVolume / 1000000).toFixed(2)} m³</span></div>
                  <div><span className="text-blue-700 block">Est. Palleplasser:</span><span className="font-bold text-lg">{volumetrics.estimatedPallets} paller</span></div>
                </div>
                {volumetrics.warnings.map((w, i) => (
                  <p key={i} className="text-red-600 text-xs font-bold mt-2">{w}</p>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-6">
                <FormField
                  control={form.control}
                  name="adr"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-white">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Farlig Gods (ADR)</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temperatureControlled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-white">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Temperaturkontroll</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fragile"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-white">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Forsiktig (Fragile)</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Avbryt</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Opprett Ordre
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
\`;

fs.writeFileSync(file, completeRewrite);
console.log('Clean rewrite complete!');
