'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Camera, MapPin, UploadCloud, Loader2 } from 'lucide-react';

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

const placeSchema = z.object({
  name: z.string().min(3, 'Navnet må være minst 3 tegn.'),
  address: z.string().min(5, 'Adresse er påkrevd.'),
  description: z.string().optional(),
  hashtags: z.string().optional(),
  image: z.any().refine((file) => file, 'Bilde er påkrevd.'),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

export function PlaceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: '',
      address: '',
      description: '',
      hashtags: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue('image', file);

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
          setImagePreview(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: PlaceFormValues) => {
    setIsSubmitting(true);
    try {
        // In a real application, you would upload the image to Firebase Storage
        // and then save the place data with the image URL to Firestore.
        console.log('Submitting data:', { ...data, image: '...image data...' });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
          title: 'Sted Opprettet',
          description: `Vellykket opprettelse av "${data.name}".`,
        });
        router.push('/dashboard');
    } catch (error) {
        console.error(error);
        toast({
            title: 'Feil',
            description: 'Kunne ikke opprette sted. Vennligst prøv igjen.',
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
                  <FormDescription>
                    Bruk knappen for å hente koordinater fra adresse (ikke implementert).
                  </FormDescription>
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

          <div className="md:col-span-1">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bilde</FormLabel>
                  <FormControl>
                    <div className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card hover:bg-secondary">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={400}
                          height={225}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-48 flex-col items-center justify-center text-center">
                          <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="font-semibold">Klikk for å laste opp eller dra & slipp</p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, eller WEBP (maks 1200px bredde)
                          </p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 h-full w-full opacity-0"
                        onChange={handleImageChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="outline" className="mt-2 w-full">
              <Camera className="mr-2 h-4 w-4" />
              Bruk Kamera
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
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
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              'Lagre Sted'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
