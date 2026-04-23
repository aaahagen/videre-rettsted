'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Camera, MapPin, UploadCloud, Loader2, Trash2, Plus, Save, Star, Clock, PhoneCall } from 'lucide-react';
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


const placeSchema = z.object({
  name: z.string().min(3, 'Navnet må være minst 3 tegn.'),
  address: z.string().min(5, 'Adresse er påkrevd.'),
  description: z.string().optional(),
  notes: z.string().optional(),
  field3: z.string().optional(),
  contactPersons: z.array(z.object({ name: z.string().optional(), phone: z.string().optional(), email: z.string().optional() })).optional(),
  hashtags: z.string().optional(),
  estimatedDeliveryTime: z.number().optional(),
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

export function PlaceForm({ place, onSuccess }: { place?: Place, onSuccess?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [authUser] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const [duplicatePlace, setDuplicatePlace] = useState<Place | null>(null);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<PlaceFormValues | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);

  const initialMainImageIndex = place?.images && place.imageUrl 
    ? place.images.findIndex(img => img.url === place.imageUrl)
    : 0;

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: place?.name || '',
      address: place?.address || '',
      description: place?.description || '',
      notes: place?.notes || '',
      field3: place?.field3 || '',
      contactPersons: place?.contactPersons || [{ name: '', phone: '', email: '' }],
      hashtags: place?.hashtags?.join(', ') || '',
      estimatedDeliveryTime: place?.estimatedDeliveryTime || 0,
      mainImageIndex: initialMainImageIndex >= 0 ? initialMainImageIndex : 0,
      // Filter out the placeholder image so the user starts with an empty list if only placeholder exists
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

  useEffect(() => {
    if (!place) { // Only auto-save for new places
      const subscription = form.watch((value, { name, type }) => {
        // We only save text/number fields to localStorage as files/images are too large/complex
        // Also don't save on form submit success (we clear it instead)
        const partialData = {
          name: value.name,
          address: value.address,
          description: value.description,
          notes: value.notes,
          field3: value.field3,
          contactPersons: value.contactPersons,
          hashtags: value.hashtags,
          estimatedDeliveryTime: value.estimatedDeliveryTime,
          coordinates: value.coordinates
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
          // Only override empty fields
          Object.keys(parsedDraft).forEach(key => {
              const currentVal = form.getValues()[key as keyof PlaceFormValues];
              // check if current value is empty so we don't override something already filled
              if (parsedDraft[key] && (!currentVal || (typeof currentVal === 'number' && currentVal === 0))) {
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

    // Reset input
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
      },
      (error) => {
        toast({
          title: "Feil ved henting av posisjon",
          description: error.message,
          variant: "destructive",
        });
      }
    );
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
        // We set showDuplicateAlert to true temporarily so that the check in onSubmit is bypassed
        // Then we call onSubmit, then we revert it back. The state update is async so we bypass by relying on the state that triggered this.
        // Actually the best way is to have a ref or just call the logic directly.
        // Let's use a flag in the parameter or state, but state is async.
        
        // Simpler way: just run the inner save logic.
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

        const placeData = {
            name: data.name,
            address: data.address,
            description: data.description || '',
            notes: data.notes || '',
            field3: data.field3 || '',
            contactPersons: (data.contactPersons || []).map(cp => ({ name: cp.name || '', phone: cp.phone || '', email: cp.email || '' })),
            hashtags: hashtagsArray,
            estimatedDeliveryTime: data.estimatedDeliveryTime || 0,
            imageUrl: finalImages[finalMainIndex]?.url || '', 
            imageHint: finalImages[finalMainIndex]?.description || '',
            images: finalImages,
            orgId: userDoc.orgId,
            updatedAt: new Date(),
            coordinates: data.coordinates || { lat: 0, lng: 0 },
            authorName: userDoc.name || 'Ukjent bruker'
        };

        if (place) {
            await firebaseDB.updatePlace(place.id, placeData);
            toast({
              title: 'Sted Oppdatert',
              description: `Vellykket oppdatering av "${data.name}".`,
            });
            if (onSuccess) onSuccess();
            else router.push('/dashboard/places');
        } else {
            const newPlace = await firebaseDB.createPlace({
                ...placeData,
            });
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
  const field3Label = organization?.fieldSettings?.field3?.label || "Ekstra Informasjon";
  const field3Placeholder = organization?.fieldSettings?.field3?.placeholder || "Skriv inn info her...";

  const contactPersonsEnabled = organization?.fieldSettings?.contactPersons?.enabled ?? false;
  const contactPersonsLabel = organization?.fieldSettings?.contactPersons?.label || "Kontaktpersoner";
  const contactPersonsPlaceholder = organization?.fieldSettings?.contactPersons?.placeholder || "Kontaktpersoner...";

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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem className="md:col-span-1">
                    <FormLabel>Full Adresse</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <Input placeholder="Storgata 1, 0101 Oslo" {...field} />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={handleGetLocation}
                            title="Hent min posisjon"
                        >
                            <MapPin className="h-4 w-4" />
                        </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="estimatedDeliveryTime"
                render={({ field }) => (
                    <FormItem className="md:col-span-1">
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
                    <FormDescription>
                        Beregnet tid brukt på stedet (for ruteplanlegging).
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
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

            {contactPersonsEnabled && (
              <div className="space-y-4">
                <FormLabel>{contactPersonsLabel}</FormLabel>
                {form.watch('contactPersons')?.map((_, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-md">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Kontaktperson {index + 1}</h4>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const current = form.getValues('contactPersons') || [];
                                current.splice(index, 1);
                                form.setValue('contactPersons', current);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`contactPersons.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Navn</FormLabel>
                          <FormControl>
                            <Input placeholder="Navn..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contactPersons.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                                <Input type="tel" placeholder="Telefon..." {...field} />
                                {field.value && (
                                    <Button type="button" variant="outline" asChild>
                                        <a href={`tel:${field.value}`}>
                                            <PhoneCall className="h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contactPersons.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-post</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="E-post..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = form.getValues('contactPersons') || [];
                    form.setValue('contactPersons', [...current, { name: '', phone: '', email: '' }]);
                  }}
                >
                  Legg til kontaktperson
                </Button>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="hashtags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtags</FormLabel>
                  <FormControl>
                    <Input placeholder="lager, prioritert, etter-arbeidstid" {...field} />
                  </FormControl>
                  <FormDescription>
                    Kommadelt liste med tagger for enkel filtrering.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-1 space-y-6">
            <div className="space-y-4">
              <FormLabel>Bilder (Maks 8)</FormLabel>
              <FormDescription className="text-xs">
                Klikk på stjerne-ikonet for å velge hovedbilde til dashbordet.
              </FormDescription>
              {fields.map((field, index) => (
                <div key={field.id} className={cn(
                    "space-y-2 p-4 border rounded-lg bg-slate-50 relative transition-all",
                    mainImageIndex === index && "ring-2 ring-primary bg-primary/5 border-primary/20"
                )}>
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <Button 
                        type="button" 
                        variant={mainImageIndex === index ? "default" : "outline"}
                        size="icon" 
                        className={cn(
                            "h-8 w-8 rounded-full",
                            mainImageIndex === index ? "bg-primary text-white" : "bg-white/80 text-slate-400 hover:text-primary"
                        )}
                        onClick={() => form.setValue('mainImageIndex', index)}
                        title="Sett som hovedbilde"
                    >
                        <Star className={cn("h-4 w-4", mainImageIndex === index && "fill-current")} />
                    </Button>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 bg-white/80 rounded-full"
                        onClick={() => {
                            remove(index);
                            if (mainImageIndex === index) form.setValue('mainImageIndex', 0);
                            else if (mainImageIndex > index) form.setValue('mainImageIndex', mainImageIndex - 1);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="relative aspect-video rounded-md overflow-hidden bg-slate-200 cursor-pointer group">
                    {field.preview ? (
                      <Image
                        src={field.preview}
                        alt={`Bilde ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <UploadCloud className="h-8 w-8 mb-2" />
                        <span className="text-xs">Velg bilde</span>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer h-full"
                      onChange={(e) => handleImageChange(index, e)}
                    />
                  </div>
                  
                  <Input
                    placeholder="Kort beskrivelse av bilde..."
                    {...form.register(`images.${index}.description` as const)}
                    className="text-xs h-8 text-center"
                  />
                  {mainImageIndex === index && (
                      <p className="text-[10px] text-center font-bold text-primary uppercase tracking-wider">Hovedbilde</p>
                  )}
                </div>
              ))}
              
              {fields.length < 8 && (
                <div className="relative">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
                    >
                        <Plus className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm">Legg til bilde</span>
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
              {form.formState.errors.images && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.images.message}
                </p>
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