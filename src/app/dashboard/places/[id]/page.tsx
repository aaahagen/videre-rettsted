
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { firebaseDB } from '../../../../lib/firebase/database';
import { auth } from '../../../../lib/firebase/firebase';
import { Button } from '../../../../components/ui/button';
import { AspectRatio } from '../../../../components/ui/aspect-ratio';
import { Badge } from '../../../../components/ui/badge';
import { Map, ArrowLeft, Calendar, User as UserIcon, Tag, Navigation, Edit3, Loader2 } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from 'next/image';
import Link from 'next/link';
import { Place } from '@/lib/types';
import { format, isValid } from 'date-fns';
import { nb } from 'date-fns/locale';
import { PlaceForm } from '@/components/places/place-form';

export default function PlaceDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [place, setPlace] = useState<Place | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const fetchPlace = async () => {
    if (id) {
        const placeData = await firebaseDB.getPlace(id as string);
        if (placeData) {
            setPlace(placeData as Place);
        }
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      fetchPlace();
    }
  }, [user, id]);

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'Ukjent';
    
    let date: Date;
    
    // Handle Firestore Timestamp
    if (dateValue?.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date(dateValue);
    }

    if (!isValid(date)) return 'Ugyldig dato';
    
    return format(date, 'PPP', { locale: nb });
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (error) {
    return <p>Feil: {error.message}</p>;
  }

  if (!user || !place) {
    return null;
  }

  const gmapsUrl = place.coordinates?.lat 
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(place.address)}`;
  
  const fallbackEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(place.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <section className="bg-white p-5 rounded-xl shadow-sm border">
                <h1 className="text-2xl font-bold mb-6">Rediger Leveringssted</h1>
                <PlaceForm 
                    place={place} 
                    onSuccess={() => {
                        setIsEditing(false);
                        fetchPlace();
                    }} 
                />
            </section>
          ) : (
            <>
              <section className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{place.name}</h1>
                
                {/* Image Carousel */}
                <div className="relative group">
                  {place.images && place.images.length > 0 ? (
                    <Carousel className="w-full">
                      <CarouselContent className="-ml-0">
                        {place.images.map((img, index) => (
                          <CarouselItem key={index} className="pl-0">
                            <div className="space-y-4">
                              <div className="relative rounded-2xl overflow-hidden shadow-md border bg-slate-100">
                                <AspectRatio ratio={16 / 9}>
                                  <Image
                                    src={img.url}
                                    alt={img.description || `Bilde ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </AspectRatio>
                              </div>
                              {img.description && (
                                <p className="text-center font-medium text-slate-700 italic">
                                  {img.description}
                                </p>
                              )}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {place.images.length > 1 && (
                        <>
                          <CarouselPrevious className="left-4 bg-white/30 border-none hover:bg-white/50 transition-colors text-slate-900" />
                          <CarouselNext className="right-4 bg-white/30 border-none hover:bg-white/50 transition-colors text-slate-900" />
                        </>
                      )}
                    </Carousel>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border">
                      <AspectRatio ratio={16 / 9}>
                        <Image
                          src={place.imageUrl || '/icon.png'}
                          alt={place.name}
                          fill
                          className="object-cover"
                        />
                      </AspectRatio>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white p-5 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-3">Beskrivelse & Instruksjoner</h2>
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {place.description || 'Ingen beskrivelse tilgjengelig.'}
                </p>
              </section>

              <section className="bg-white p-5 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-3 flex items-center">
                    <Map className="mr-2 h-5 w-5 text-primary" />
                    Lokasjon & Kart
                </h2>
                <p className="text-lg text-slate-700 mb-3 font-medium">{place.address}</p>
                
                {/* Map Preview */}
                <div className="rounded-xl overflow-hidden border bg-slate-100 mb-6 shadow-md h-[350px]">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={apiKey ? embedUrl : fallbackEmbedUrl}
                        allowFullScreen
                        title="Google Maps"
                    ></iframe>
                </div>

                <Button className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                  <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="mr-2 h-5 w-5" />
                    Åpne i Google Maps
                  </a>
                </Button>
              </section>

              <section className="bg-white p-5 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-3 flex items-center">
                    <Tag className="mr-2 h-5 w-5 text-primary" />
                    Hashtags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {place.hashtags && place.hashtags.length > 0 ? (
                    place.hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                        #{tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">Ingen hashtags lagt til.</span>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        <div className="space-y-6">
          <section className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Stedsinfo</h2>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <UserIcon className="mr-3 h-4 w-4 text-primary" />
                <span>Lagt til av: <span className="font-medium text-slate-900">{place.createdBy || 'Ukjent'}</span></span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="mr-3 h-4 w-4 text-primary" />
                <span>Opprettet: <span className="font-medium text-slate-900">{formatDate(place.createdAt)}</span></span>
              </div>
              {place.updatedAt && (
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="mr-3 h-4 w-4 text-primary" />
                  <span>Sist oppdatert: <span className="font-medium text-slate-900">{formatDate(place.updatedAt)}</span></span>
                </div>
              )}
            </div>
          </section>
          
          <section className="bg-slate-100 p-4 rounded-xl border text-center shadow-inner">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Bildeoversikt</p>
            <div className="flex justify-center gap-1">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className={`h-1.5 w-6 rounded-full ${i < (place.images?.length || 0) ? 'bg-primary' : 'bg-slate-300'}`} />
               ))}
            </div>
            <p className="text-sm mt-2 font-medium text-slate-600">{place.images?.length || 0} av 6 bilder brukt</p>
          </section>
        </div>
      </div>

      {/* Action Buttons at the Bottom */}
      <div className="mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button variant="ghost" size="lg" asChild className="w-full sm:w-auto order-2 sm:order-1">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Tilbake til oversikt
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => setIsEditing(!isEditing)} 
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isEditing ? (
            <>
              <Map className="mr-2 h-5 w-5" />
              Vis Sted
            </>
          ) : (
            <>
              <Edit3 className="mr-2 h-5 w-5" />
              Rediger Sted
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
