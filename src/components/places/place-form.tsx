'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Camera, MapPin, UploadCloud, Loader2, Trash2, Plus, Save, Star } from 'lucide-react';
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
import { firebaseStorage } from '@/lib/firebase/storage';
import { Place } from '@/lib/types';
import { cn } from '@/lib/utils';

const placeSchema = z.object({
  name: z.string().min(3, 'Navnet må være minst 3 tegn.'),
  address: z.string().min(5, 'Adresse er påkrevd.'),
  description: z.string().optional(),
  hashtags: z.string().optional(),
  mainImageIndex: z.number().default(0),
  images: z.array(z.object({
    file: z.any().optional(),
    url: z.string().optional(),
    description: z.string().optional(),
    preview: z.string().optional(),
  })).min(1, 'Minst ett bilde er påkrevd.').max(6, 'Maks 6 bilder tillatt.'),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

export function PlaceForm({ place, onSuccess }: { place?: Place, onSuccess?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [authUser] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialMainImageIndex = place?.images && place.imageUrl 
    ? place.images.findIndex(img => img.url === place.imageUrl)
    : 0;

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: place?.name || '',
      address: place?.address || '',
      description: place?.description || '',
      hashtags: place?.hashtags?.join(', ') || '',
      mainImageIndex: initialMainImageIndex >= 0 ? initialMainImageIndex : 0,
      images: place?.images?.map(img => ({
        url: img.url,
        description: img.description || '',
        preview: img.url
      })) || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const mainImageIndex = form.watch('mainImageIndex');

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const preview = canvas.toDataURL('image/jpeg', 0.8);
          update(index, { ...fields[index], file, preview, url: undefined });
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
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
    try {
        const userDoc = await firebaseDB.getUser(authUser.uid);
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

        const hashtagsArray = data.hashtags 
            ? data.hashtags.split(',').map(tag => tag.trim().replace(/^#/, ''))
            : [];

        // Ensure mainImageIndex is within bounds
        const safeMainIndex = Math.min(data.mainImageIndex, finalImages.length - 1);
        const finalMainIndex = safeMainIndex >= 0 ? safeMainIndex : 0;

        const placeData = {
            name: data.name,
            address: data.address,
            description: data.description || '',
            hashtags: hashtagsArray,
            imageUrl: finalImages[finalMainIndex]?.url || '', 
            images: finalImages,
            orgId: userDoc.orgId,
            updatedAt: new Date(),
        };

        if (place) {
            await firebaseDB.updatePlace(place.id, placeData);
            toast({
              title: 'Sted Oppdatert',
              description: `Vellykket oppdatering av "${data.name}".`,
            });
            if (onSuccess) onSuccess();
        } else {
            await firebaseDB.createPlace({
                ...placeData,
                createdBy: authUser.uid,
                createdAt: new Date(),
                coordinates: { lat: 0, lng: 0 }
            });
            toast({
              title: 'Sted Opprettet',
              description: `Vellykket opprettelse av "${data.name}".`,
            });
            router.push('/dashboard');
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
    }
  };

  return (
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
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Adresse</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Storgata 1, 0101 Oslo" {...field} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse & Instruksjoner</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="f.eks. Ring på klokken for levering. Kode til porten er #1234. Pass deg for hunden."
                      className="min-h-[120px]"
                      {...field}
                    />
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
              <FormLabel>Bilder (Maks 6)</FormLabel>
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
              
              {fields.length < 6 && (
                <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
                    onClick={() => append({ description: '', preview: '' })}
                >
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm">Legg til bilde</span>
                </Button>
              )}
              {form.formState.errors.images && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.images.message}
                </p>
              )}
            </div>
            
            <Button type="button" variant="outline" className="w-full">
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
  );
}
