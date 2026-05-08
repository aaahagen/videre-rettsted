'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Camera, MapPin, UploadCloud, Loader2, Trash2, Plus, Save, Star, Clock, PhoneCall, Calendar, ChevronDown, ChevronUp, Copy, Leaf, Building2, Ruler, Weight, Search, CheckCircle2, Tag, Hash, LocateFixed } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { firebaseDB } from '@/lib/firebase/database';
import { Place, Organization } from '@/lib/types';
import { firebaseStorage } from '@/lib/firebase/storage';
import { cn } from '@/lib/utils';
import { geocodeAddress } from '@/lib/geocoding';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { deleteField } from 'firebase/firestore';

const openingHoursSchema = z.object({
  isOpen: z.boolean(),
  open: z.string().optional(),
  close: z.string().optional(),
});

// Robust schema for numeric constraint fields
const numericConstraintSchema = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : Number(val);
  return isNaN(num) ? undefined : num;
}, z.number().optional());

const placeSchema = z.object({
  name: z.string().min(3, 'Navnet må være minst 3 tegn.'),
  address: z.string().min(5, 'Adresse er påkrevd.'),
  customerNumber: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  field3: z.string().optional(),
  field4: z.string().optional(),
  doorCode: z.array(z.object({ category: z.string().optional(), name: z.string().optional(), value: z.string().optional() })).optional(),
  contactPersons: z.array(z.object({ name: z.string().optional(), phone: z.string().optional(), email: z.string().optional() })).optional(),
  hashtags: z.string().optional(),
  estimatedDeliveryTime: z.number().optional(),
  isZeroEmissionZone: z.boolean().default(false),
  isCityCenter: z.boolean().default(false),
  maxVehicleHeight: numericConstraintSchema,
  maxVehicleWidth: numericConstraintSchema,
  maxVehicleLength: numericConstraintSchema,
  maxVehicleWeight: numericConstraintSchema,
  hasDeliveryWindow: z.boolean().default(false),
  weeklySchedule: z.object({
    monday: openingHoursSchema,
    tuesday: openingHoursSchema,
    wednesday: openingHoursSchema,
    thursday: openingHoursSchema,
    friday: openingHoursSchema,
    saturday: openingHoursSchema,
    sunday: openingHoursSchema,
  }).optional(),
  mainImageIndex: z.number().default(0),
  images: z.array(z.object({
    file: z.any().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
    preview: z.string().optional(),
  })).min(0, 'Du kan laste opp bilder senere.').max(8, 'Maks 8 bilder tillatt.'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

const DAYS = [
    { key: 'monday', label: 'Mandag' },
    { key: 'tuesday', label: 'Tirsdag' },
    { key: 'wednesday', label: 'Onsdag' },
    { key: 'thursday', label: 'Torsdag' },
    { key: 'friday', label: 'Fredag' },
    { key: 'saturday', label: 'Lørdag' },
    { key: 'sunday', label: 'Søndag' },
] as const;

export function PlaceForm({ place, onSuccess }: { place?: Place, onSuccess?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [authUser] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isConstraintsOpen, setIsConstraintsOpen] = useState(false);

  const [duplicatePlace, setDuplicatePlace] = useState<Place | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<PlaceFormValues | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);

  const initialMainImageIndex = place?.images && place.imageUrl 
    ? place.images.findIndex(img => img.url === place.imageUrl)
    : 0;

  const defaultSchedule = {
      isOpen: true,
      open: '08:00',
      close: '16:00'
  };

  const safeNumberValue = (val: any) => {
    if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) {
      return '';
    }
    return val;
  };

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: place?.name || '',
      address: place?.address || '',
      customerNumber: place?.customerNumber || '',
      description: place?.description || '',
      notes: place?.notes || '',
      field3: place?.field3 || '',
      field4: place?.field4 || '',
      doorCode: Array.isArray(place?.doorCode) ? place.doorCode : [],
      contactPersons: place?.contactPersons || [],
      hashtags: place?.hashtags?.join(', ') || '',
      estimatedDeliveryTime: place?.estimatedDeliveryTime || 0,
      isZeroEmissionZone: place?.isZeroEmissionZone || false,
      isCityCenter: place?.isCityCenter || false,
      maxVehicleHeight: safeNumberValue(place?.maxVehicleHeight),
      maxVehicleWidth: safeNumberValue(place?.maxVehicleWidth),
      maxVehicleLength: safeNumberValue(place?.maxVehicleLength),
      maxVehicleWeight: safeNumberValue(place?.maxVehicleWeight),
      hasDeliveryWindow: !!place?.weeklySchedule,
      weeklySchedule: place?.weeklySchedule || {
          monday: defaultSchedule,
          tuesday: defaultSchedule,
          wednesday: defaultSchedule,
          thursday: defaultSchedule,
          friday: defaultSchedule,
          saturday: { ...defaultSchedule, isOpen: false },
          sunday: { ...defaultSchedule, isOpen: false },
      },
      mainImageIndex: initialMainImageIndex >= 0 ? initialMainImageIndex : 0,
      images: place?.images?.filter(img => img.url !== '/ingen.jpg').map(img => ({
        url: img.url,
        description: img.description || '',
        preview: img.url
      })) || [],
      coordinates: place?.coordinates || { lat: 0, lng: 0 },
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const mainImageIndex = form.watch('mainImageIndex');
  const currentAddress = form.watch('address');
  const currentCoords = form.watch('coordinates');
  const hasValidCoords = currentCoords && (currentCoords.lat !== 0 || currentCoords.lng !== 0);
  const hasDeliveryWindow = form.watch('hasDeliveryWindow');

  useEffect(() => {
    if (!place) {
      const subscription = form.watch((value) => {
        const partialData = {
          name: value.name,
          address: value.address,
          customerNumber: value.customerNumber,
          description: value.description,
          notes: value.notes,
          field3: value.field3,
          field4: value.field4,
          doorCode: value.doorCode,
          contactPersons: value.contactPersons,
          hashtags: value.hashtags,
          estimatedDeliveryTime: value.estimatedDeliveryTime,
          isZeroEmissionZone: value.isZeroEmissionZone,
          isCityCenter: value.isCityCenter,
          maxVehicleHeight: value.maxVehicleHeight,
          maxVehicleWidth: value.maxVehicleWidth,
          maxVehicleLength: value.maxVehicleLength,
          maxVehicleWeight: value.maxVehicleWeight,
          coordinates: value.coordinates,
          weeklySchedule: value.weeklySchedule,
          hasDeliveryWindow: value.hasDeliveryWindow
        };
        localStorage.setItem('placeFormDraft', JSON.stringify(partialData));
      });
      return () => subscription.unsubscribe();
    }
  }, [form.watch, place]);

  useEffect(() => {
    if (!place) {
      const savedDraft = localStorage.getItem('placeFormDraft');
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          Object.keys(parsedDraft).forEach(key => {
              const currentVal = form.getValues()[key as keyof PlaceFormValues];
              if (parsedDraft[key] !== undefined && parsedDraft[key] !== '' && (!currentVal || (typeof currentVal === 'number' && currentVal === 0))) {
                  form.setValue(key as any, parsedDraft[key], { shouldValidate: true, shouldDirty: true });
              }
          });
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [place, form]);


  useEffect(() => {
    const fetchOrg = async () => {
      if (authUser?.uid) {
        const user = await firebaseDB.getUser(authUser.uid);
        if (user?.orgId) {
          const org = await firebaseDB.getOrganization(user.orgId);
          setOrganization(org);
        }
      }
    };
    fetchOrg();
  }, [authUser]);

  const processFile = (file: File, callback: (preview: string, resizedFile: File) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const preview = canvas.toDataURL('image/jpeg', 0.8);
          
          canvas.toBlob((blob) => {
            if (blob) {
                const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
                callback(preview, resizedFile);
            }
          }, 'image/jpeg', 0.8);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file, (preview, resizedFile) => {
        update(index, { ...fields[index], file: resizedFile, preview, url: undefined });
    });
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 8 - fields.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
        processFile(file, (preview, resizedFile) => {
            append({ file: resizedFile, preview, description: '' });
        });
    });

    e.target.value = '';
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Ikke støttet",
        description: "Nettleseren din støtter ikke geolokasjon.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    toast({
      title: "Henter posisjon...",
      description: "Vennligst vent mens vi finner koordinatene dine.",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue('coordinates', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: "Posisjon hentet",
          description: "Koordinater er registrert.",
        });
        setIsGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Feil ved henting av posisjon",
          description: error.message,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      }
    );
  };

  const handleGeocode = async () => {
    if (!currentAddress || currentAddress.length < 5) {
      toast({ title: "Mangler adresse", description: "Vennligst skriv inn en gyldig adresse først.", variant: "destructive" });
      return;
    }

    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(currentAddress);
      if (coords) {
        form.setValue('coordinates', coords, { shouldDirty: true, shouldValidate: true });
        toast({ title: "Adresse funnet", description: `Koordinater satt til ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` });
      } else {
        toast({ title: "Fant ikke adressen", description: "Kunne ikke finne koordinater for denne adressen. Sjekk skrivemåten.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Feil ved søk", description: "Noe gikk galt under adresseoppslag.", variant: "destructive" });
    } finally {
      setIsGeocoding(false);
    }
  };

  const copyMondayToAll = () => {
      const monday = form.getValues('weeklySchedule.monday');
      if (!monday) return;
      
      DAYS.slice(1).forEach(day => {
          form.setValue(`weeklySchedule.${day.key}`, { ...monday }, { shouldDirty: true, shouldValidate: true });
      });
      
      toast({ title: "Kopiert", description: "Mandagens tider er kopiert til alle andre dager." });
  };

  const onSubmit = async (data: PlaceFormValues) => {
    if (!authUser) {
        toast({
            title: 'Feil',
            description: 'Du må være logget inn for å utføre denne handlingen.',
            variant: 'destructive'
        });
        return;
    }

    setIsSubmitting(true);

    // AUTO-GEOCODE if coordinates are missing and address is present
    if ((!data.coordinates || (data.coordinates.lat === 0 && data.coordinates.lng === 0)) && data.address) {
        const coords = await geocodeAddress(data.address);
        if (coords) {
            data.coordinates = coords;
            form.setValue('coordinates', coords);
        }
    }
    
    let userDocForCheck = null;
    try {
         userDocForCheck = await firebaseDB.getUser(authUser.uid);
    } catch(e) {
         console.error("Could not fetch user", e);
    }

    if (!place && userDocForCheck?.orgId && !showDuplicateAlert) {
        try {
            const existingPlaces = await firebaseDB.getPlaces(userDocForCheck.orgId);
            const isDuplicate = existingPlaces.find(p => 
                p.name.toLowerCase() === data.name.toLowerCase() || 
                p.address.toLowerCase() === data.address.toLowerCase()
            );
            
            if (isDuplicate) {
                setDuplicatePlace(isDuplicate);
                setPendingSubmitData(data);
                setShowDuplicateAlert(true);
                setIsSubmitting(false);
                return; 
            }
        } catch (e) {
            console.error("Error checking for duplicates", e);
        }
    }

    submitConfirmed(data);
  };


  const continueSubmit = () => {
    if (pendingSubmitData) {
        setShowDuplicateAlert(false);
        submitConfirmed(pendingSubmitData);
    }
  };

  const submitConfirmed = async (data: PlaceFormValues) => {
    setIsSubmitting(true);
    if (!place) {
        localStorage.removeItem('placeFormDraft');
    }

    try {
        const userDoc = await firebaseDB.getUser(authUser!.uid);
        if (!userDoc?.orgId) {
            throw new Error('Fant ikke organisasjons-ID for brukeren.');
        }

        const finalImages = [];
        for (const item of data.images) {
            if (item.file instanceof File) {
                const fileName = `places/${userDoc.orgId}/${uuidv4()}-${item.file.name}`;
                const url = await firebaseStorage.uploadFile(fileName, item.file);
                finalImages.push({
                    url,
                    description: item.description || '',
                    uploadedAt: new Date()
                });
            } else if (item.url) {
                finalImages.push({
                    url: item.url,
                    description: item.description || '',
                    uploadedAt: new Date()
                });
            }
        }

        if (finalImages.length === 0) {
            finalImages.push({
                url: '/ingen.jpg',
                description: '',
                uploadedAt: new Date()
            });
        }

        const hashtagsArray = data.hashtags 
            ? data.hashtags.split(',').map(tag => tag.trim().replace(/^#/, ''))
            : [];

        const safeMainIndex = Math.min(data.mainImageIndex, finalImages.length - 1);
        const finalMainIndex = safeMainIndex >= 0 ? safeMainIndex : 0;

        // Helper to determine if we should use deleteField() or undefined
        // deleteField() is required for updateDoc, but illegal for addDoc
        const removeField = () => place ? deleteField() : undefined;

        const placeData = {
            name: data.name,
            address: data.address,
            customerNumber: data.customerNumber || '',
            description: data.description || '',
            notes: data.notes || '',
            field3: data.field3 || '',
            field4: data.field4 || '',
            doorCode: (data.doorCode || []).map(dc => ({ category: dc.category || '', name: dc.name || '', value: dc.value || '' })),
            contactPersons: (data.contactPersons || []).map(cp => ({ name: cp.name || '', phone: cp.phone || '', email: cp.email || '' })),
            hashtags: hashtagsArray,
            estimatedDeliveryTime: data.estimatedDeliveryTime || 0,
            isZeroEmissionZone: data.isZeroEmissionZone,
            isCityCenter: data.isCityCenter,
            maxVehicleHeight: typeof data.maxVehicleHeight !== 'number' ? removeField() : data.maxVehicleHeight,
            maxVehicleWidth: typeof data.maxVehicleWidth !== 'number' ? removeField() : data.maxVehicleWidth,
            maxVehicleLength: typeof data.maxVehicleLength !== 'number' ? removeField() : data.maxVehicleLength,
            maxVehicleWeight: typeof data.maxVehicleWeight !== 'number' ? removeField() : data.maxVehicleWeight,
            weeklySchedule: data.hasDeliveryWindow ? data.weeklySchedule : removeField(),
            imageUrl: finalImages[finalMainIndex]?.url || '', 
            imageHint: finalImages[finalMainIndex]?.description || '',
            images: finalImages,
            orgId: userDoc.orgId,
            updatedAt: new Date(),
            coordinates: data.coordinates || { lat: 0, lng: 0 },
            createdBy: place ? place.createdBy : userDoc.id,
            authorName: place ? place.authorName : (userDoc.name || 'Ukjent bruker'),
            updatedBy: userDoc.id,
            updatedByName: userDoc.name || 'Ukjent bruker'
        };

        if (place) {
            await firebaseDB.updatePlace(place.id, placeData as any);
            toast({
              title: 'Sted Oppdatert',
              description: `Vellykket oppdatering av "${data.name}".`,
            });
            if (onSuccess) onSuccess();
            else router.push('/dashboard/places');
        } else {
            const newPlace = await firebaseDB.createPlace({
                ...placeData,
            } as any);
            toast({
              title: 'Sted Opprettet',
              description: `Vellykket opprettelse av "${data.name}".`,
            });
            router.push(`/dashboard/places/${newPlace.id}`);
        }
    } catch (error: any) {
        console.error(error);
        toast({
            title: 'Feil',
            description: error.message || 'Kunne ikke lagre stedet. Vennligst prøv igjen.',
            variant: 'destructive'
        });
    } finally {
        setIsSubmitting(false);
        setPendingSubmitData(null);
    }
  };

  const descEnabled = organization?.fieldSettings?.description?.enabled ?? true;
  const descLabel = organization?.fieldSettings?.description?.label || "Beskrivelse & Instruksjoner 1";
  const descPlaceholder = organization?.fieldSettings?.description?.placeholder || "f.eks. Ring på klokken for levering. Kode til porten er #1234. Pass deg for hunden.";
  
  const notesEnabled = organization?.fieldSettings?.notes?.enabled ?? true;
  const notesLabel = organization?.fieldSettings?.notes?.label || "Beskrivelse & Instruksjoner 2";
  const notesPlaceholder = organization?.fieldSettings?.notes?.placeholder || "f.eks. 'Kunden er ofte ikke hjemme før kl. 16'";

  const field3Enabled = organization?.fieldSettings?.field3?.enabled ?? false;
  const field3Label = organization?.fieldSettings?.field3?.label || "Beskrivelse & Instruksjoner 3";
  const field3Placeholder = organization?.fieldSettings?.field3?.placeholder || "Beskrivelse...";

  const field4Enabled = organization?.fieldSettings?.field4?.enabled ?? false;
  const field4Label = organization?.fieldSettings?.field4?.label || "Beskrivelse & Instruksjoner 4";
  const field4Placeholder = organization?.fieldSettings?.field4?.placeholder || "Beskrivelse...";

  const doorCodeEnabled = organization?.fieldSettings?.doorCode?.enabled ?? false;
  const doorCodeLabel = organization?.fieldSettings?.doorCode?.label || "Dørkode / Nøkkel";
  const doorCodePlaceholder = organization?.fieldSettings?.doorCode?.placeholder || "F.eks. 1234";

  const contactPersonsEnabled = organization?.fieldSettings?.contactPersons?.enabled ?? false;
  const contactPersonsLabel = organization?.fieldSettings?.contactPersons?.label || "Kontaktpersoner";
  const contactPersonsPlaceholder = organization?.fieldSettings?.contactPersons?.placeholder || "Kontaktpersoner...";

  const autoGenEnabled = organization?.placeSettings?.autoGenerateCustomerNumbers ?? false;

  return (
    
      <>
      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potensielt duplikat oppdaget</AlertDialogTitle>
            <AlertDialogDescription>
              Det ser ut til at et sted med samme navn eller adresse allerede eksisterer i deres register.
              <br/><br/>
              <strong>Eksisterende sted:</strong> {duplicatePlace?.name} ({duplicatePlace?.address})
              <br/><br/>
              Vil du fortsatt opprette dette som et nytt sted, eller vil du gå til det eksisterende stedet for å endre det?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <AlertDialogCancel asChild>
              <Link href={`/dashboard/places/${duplicatePlace?.id}`}>
                <Button variant="outline" className="w-full sm:w-auto">
                    Gå til eksisterende sted
                </Button>
              </Link>
            </AlertDialogCancel>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowDuplicateAlert(false)}>
                  Avbryt
                </Button>
                <AlertDialogAction onClick={continueSubmit}>
                  Opprett likevel
                </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2">Grunnleggende informasjon</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Stedsnavn</FormLabel>
                            <FormControl>
                                <Input placeholder="f.eks. Sentrumslager rampe 5" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div>
                        <FormField
                        control={form.control}
                        name="customerNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                                <Hash className="h-3 w-3 text-slate-400" />
                                Kundenr
                            </FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder={autoGenEnabled && !place ? "Auto" : "Valgfritt"} 
                                    {...field} 
                                    
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
                
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex justify-between items-center mb-1">
                        <FormLabel>Full Adresse</FormLabel>
                        {hasValidCoords && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center gap-1 text-[10px] font-bold">
                                <CheckCircle2 className="h-3 w-3" /> KOORDINATER LAGRET
                            </Badge>
                        )}
                    </div>
                    <FormControl>
                        <div className="flex flex-col gap-3">
                            <Input placeholder="Storgata 1, 0101 Oslo" {...field} />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 w-full h-10"
                                    onClick={handleGeocode}
                                    disabled={isGeocoding}
                                >
                                    {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                                    Hent koordinater fra adresse
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full h-10"
                                    onClick={handleGetLocation}
                                    disabled={isGettingLocation}
                                >
                                    {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4 mr-2" />}
                                    Hent min posisjon via GPS
                                </Button>
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="hashtags"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-bold flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-500" />
                        Hashtags
                    </FormLabel>
                    <FormControl>
                        <Input placeholder="lager, prioritert" {...field} />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                        Kommadelt liste med tagger.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {/* ENVIRONMENTAL ZONES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <FormField
                        control={form.control}
                        name="isZeroEmissionZone"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 border rounded-xl bg-green-50/30 border-green-100 min-h-[70px]">
                                <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                                    <FormLabel className="text-sm font-bold flex items-center gap-2">
                                        <Leaf className="h-4 w-4 text-green-600 shrink-0" />
                                        <span>Nullutslippssone</span>
                                    </FormLabel>
                                    <FormDescription className="text-[10px]">Krever El/Gass kjøretøy.</FormDescription>
                                </div>
                                <FormControl className="shrink-0">
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isCityCenter"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 border rounded-xl bg-blue-50/30 border-blue-100 min-h-[70px]">
                                <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                                    <FormLabel className="text-sm font-bold flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                                        <span>Sentrumskjerne</span>
                                    </FormLabel>
                                    <FormDescription className="text-[10px]">Høye bomavgifter for Diesel.</FormDescription>
                                </div>
                                <FormControl className="shrink-0">
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2">Leveringsdetaljer</h3>
                <FormField
                control={form.control}
                name="estimatedDeliveryTime"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        Tidsbruk for levering
                    </FormLabel>
                    <FormControl>
                        <Select 
                        value={field.value?.toString() || "0"} 
                        onValueChange={(val) => field.onChange(Number(val))}
                        >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Velg tid" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">0 min (Kun kjøring)</SelectItem>
                            <SelectItem value="5">5 min</SelectItem>
                            <SelectItem value="10">10 min</SelectItem>
                            <SelectItem value="15">15 min</SelectItem>
                            <SelectItem value="20">20 min</SelectItem>
                            <SelectItem value="25">25 min</SelectItem>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">60 min</SelectItem>
                        </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                {descEnabled && (
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{descLabel}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={descPlaceholder}
                            className="min-h-[120px]"
                            {...field}
                           
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
                
                {notesEnabled && (
                    <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{notesLabel}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={notesPlaceholder}
                            className="min-h-[120px]"
                            {...field}
                           
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                {field3Enabled && (
                    <FormField
                    control={form.control}
                    name="field3"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{field3Label}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={field3Placeholder}
                            className="min-h-[120px]"
                            {...field}
                           
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                {field4Enabled && (
                    <FormField
                    control={form.control}
                    name="field4"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{field4Label}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={field4Placeholder}
                            className="min-h-[120px]"
                            {...field}
                           
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="space-y-4">
              <FormLabel>Bilder (Maks 8)</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {fields.map((field, index) => (
                  <div key={field.id} className={cn(
                      "space-y-2 p-2 border rounded-lg bg-slate-50 relative transition-all",
                      mainImageIndex === index && "ring-2 ring-primary bg-primary/5 border-primary/20"
                  )}>
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <Button 
                          type="button" 
                          variant={mainImageIndex === index ? "default" : "outline"}
                          size="icon" 
                          className={cn(
                              "h-6 w-6 rounded-full",
                              mainImageIndex === index ? "bg-primary text-white" : "bg-white/80 text-slate-400 hover:text-primary"
                          )}
                          onClick={() => form.setValue('mainImageIndex', index)}
                      >
                          <Star className={cn("h-3 w-3", mainImageIndex === index && "fill-current")} />
                      </Button>
                      <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 bg-white/80 rounded-full"
                          onClick={() => {
                              remove(index);
                              if (mainImageIndex === index) form.setValue('mainImageIndex', 0);
                              else if (mainImageIndex > index) form.setValue('mainImageIndex', mainImageIndex - 1);
                          }}
                      >
                          <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="relative aspect-video rounded-md overflow-hidden bg-slate-200">
                      {field.preview ? (
                        <Image
                          src={field.preview}
                          alt={`Bilde ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    
                    <Input
                      placeholder="Beskrivelse..."
                      {...form.register(`images.${index}.description` as const)}
                      className="text-[10px] h-6 text-center"
                    />
                  </div>
                ))}
                
                {fields.length < 8 && (
                  <div className="relative aspect-video">
                      <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full h-full border-dashed border-2 flex flex-col gap-1"
                      >
                          <Plus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-[10px]">Legg til</span>
                      </Button>
                      <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="absolute inset-0 opacity-0 cursor-pointer h-full"
                          onChange={handleAddImages}
                      />
                  </div>
                )}
              </div>
            </div>

            <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  cameraInputRef.current?.click();
                }}
                disabled={fields.length >= 8}
            >
              <Camera className="mr-2 h-4 w-4" />
              Bruk Kamera
            </Button>

            {/* LEVERINGSVINDU COLLAPSIBLE CARD */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Leveringsvindu</h3>
                    </div>
                    <FormField
                        control={form.control}
                        name="hasDeliveryWindow"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormLabel className="text-[10px] font-bold text-slate-500 uppercase">Begrens tid</FormLabel>
                                <FormControl>
                                    <Switch 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {hasDeliveryWindow && (
                    <Collapsible
                        open={isHoursOpen}
                        onOpenChange={setIsHoursOpen}
                        className="w-full"
                    >
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto hover:bg-slate-50 text-slate-500">
                                <span className="text-xs font-bold">{isHoursOpen ? 'Skjul tider' : 'Vis tider'}</span>
                                {isHoursOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="px-6 pb-6 space-y-6 border-t pt-4">
                            <div className="flex justify-end">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={copyMondayToAll}
                                    className="text-[10px] font-black uppercase tracking-tight h-7"
                                >
                                    <Copy className="h-3 w-3 mr-1.5" /> Kopier mandag
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {DAYS.map(({ key, label }) => (
                                    <div key={key} className="flex flex-col gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-slate-700">{label}</span>
                                            <FormField
                                                control={form.control}
                                                name={`weeklySchedule.${key}.isOpen`}
                                                render={({ field }) => (
                                                    <FormControl>
                                                        <Switch 
                                                            checked={field.value} 
                                                            onCheckedChange={field.onChange} 
                                                            className="scale-75"
                                                        />
                                                    </FormControl>
                                                )}
                                            />
                                        </div>

                                        {form.watch(`weeklySchedule.${key}.isOpen`) && (
                                            <div className="flex items-center gap-1">
                                                <FormField
                                                    control={form.control}
                                                    name={`weeklySchedule.${key}.open`}
                                                    render={({ field }) => (
                                                        <Input 
                                                            type="time" 
                                                            {...field} 
                                                            className="h-7 text-[10px] font-bold px-1" 
                                                           
                                                        />
                                                    )}
                                                />
                                                <span className="text-slate-400 font-bold">-</span>
                                                <FormField
                                                    control={form.control}
                                                    name={`weeklySchedule.${key}.close`}
                                                    render={({ field }) => (
                                                        <Input 
                                                            type="time" 
                                                            {...field} 
                                                            className="h-7 text-[10px] font-bold px-1" 
                                                           
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>

            {/* BEGRENSNINGER COLLAPSIBLE CARD */}
            <Collapsible
              open={isConstraintsOpen}
              onOpenChange={setIsConstraintsOpen}
              className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-6 h-auto hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                        <Ruler className="h-5 w-5 text-slate-500" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Begrensninger</h3>
                    </div>
                    {isConstraintsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-6 pb-6 space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="maxVehicleHeight"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase">Maks Høyde (m)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number"
                                step="0.01"
                                {...field} 
                                value={safeNumberValue(field.value)}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="maxVehicleWidth"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase">Maks Bredde (m)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number"
                                step="0.01"
                                {...field} 
                                value={safeNumberValue(field.value)}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                     control={form.control}
                    name="maxVehicleLength"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase">Maks Lengde (m)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number"
                                step="0.01"
                                {...field} 
                                value={safeNumberValue(field.value)}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="maxVehicleWeight"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase flex items-center gap-1.5">
                            <Weight className="h-3 w-3" />
                            Maks Vekt (kg)
                        </FormLabel>
                        <FormControl>
                            <Input 
                                type="number"
                                {...field} 
                                value={safeNumberValue(field.value)}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2">Tilgang & Kontakt</h3>
                {doorCodeEnabled && (
                <div className="space-y-4">
                    <FormLabel>{doorCodeLabel}</FormLabel>
                    {form.watch('doorCode')?.map((_, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-md bg-slate-50">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Kode/Nøkkel {index + 1}</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const current = form.getValues('doorCode') || [];
                                    current.splice(index, 1);
                                    form.setValue('doorCode', current);
                                }}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            <FormField
                            control={form.control}
                            name={`doorCode.${index}.category`}
                            render={({ field }) => (
                                <FormItem>
                                <Select onValueChange={field.onChange} value={field.value ?? 'Nøkkel'}>
                                    <FormControl>
                                    <SelectTrigger className="bg-white h-8 text-xs">
                                        <SelectValue placeholder="Kategori" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Nøkkel">Nøkkel</SelectItem>
                                    <SelectItem value="Kode">Kode</SelectItem>
                                    </SelectContent>
                                </Select>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`doorCode.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input placeholder="Beskrivelse" {...field} className="bg-white h-8 text-xs" />
                                </FormControl>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`doorCode.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input placeholder="Verdi" {...field} className="bg-white h-8 text-xs" />
                                </FormControl>
                                </FormItem>
                            )}
                            />
                        </div>
                    </div>
                    ))}
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                        const current = form.getValues('doorCode') || [];
                        form.setValue('doorCode', [...current, { category: 'Nøkkel', name: '', value: '' }]);
                    }}
                    >
                    <Plus className="h-3 w-3 mr-2" />
                    Legg til kode
                    </Button>
                </div>
                )}

                {contactPersonsEnabled && (
                <div className="space-y-4">
                    <FormLabel>{contactPersonsLabel}</FormLabel>
                    {form.watch('contactPersons')?.map((_, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-md bg-slate-50">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Kontakt {index + 1}</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const current = form.getValues('contactPersons') || [];
                                    current.splice(index, 1);
                                    form.setValue('contactPersons', current);
                                }}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            <FormField
                                control={form.control}
                                name={`contactPersons.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Input placeholder="Navn" {...field} className="bg-white h-8 text-xs" />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`contactPersons.${index}.phone`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Input type="tel" placeholder="Telefon" {...field} className="bg-white h-8 text-xs" />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`contactPersons.${index}.email`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <Input type="email" placeholder="E-post" {...field} className="bg-white h-8 text-xs" />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    ))}
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                        const current = form.getValues('contactPersons') || [];
                        form.setValue('contactPersons', [...current, { name: '', phone: '', email: '' }]);
                    }}
                    >
                    <Plus className="h-3 w-3 mr-2" />
                    Legg til kontakt
                    </Button>
                </div>
                )}
            </div>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              ref={cameraInputRef}
              onChange={handleAddImages}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-8 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => place ? (onSuccess && onSuccess()) : router.back()}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button
            type="submit"
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {place ? 'Lagre Endringer' : 'Lagre Sted'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
    </>
  );
}
