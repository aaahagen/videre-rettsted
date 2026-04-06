'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { firebaseDB } from '../../../../lib/firebase/database';
import { auth } from '../../../../lib/firebase/firebase';
import { Button } from '../../../../components/ui/button';
import { AspectRatio } from '../../../../components/ui/aspect-ratio';
import { Badge } from '../../../../components/ui/badge';
import { Map, ArrowLeft, Calendar, User as UserIcon, Tag, Navigation, Edit3, Loader2, Maximize2, X, Clipboard, FileText, Printer, Trash2, ImageOff, Info } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Place, Organization, UserProfile } from '@/lib/types'; // Assuming UserProfile exists or similar
import { format, isValid } from 'date-fns';
import { nb } from 'date-fns/locale';
import { PlaceForm } from '@/components/places/place-form';
import { PrintPlace } from '@/components/places/print-place';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function PlaceDetailsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [place, setPlace] = useState<Place | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const { dbUser } = useAuth();

  const requiredDeleteText = "Jeg er ansvarlig og vil slette dette stedet fra databasen. Denne handlingen kan ikke endres";

  const fetchPlace = async () => {
    if (id) {
        const placeData = await firebaseDB.getPlace(id as string);
        if (placeData) {
            setPlace(placeData as Place);
        }
    }
  };

  useEffect(() => {
  useEffect(() => {
    async function fetchAuthorName() {
      if (place?.createdBy && dbUser?.role === 'admin') {
        const author = await firebaseDB.getUser(place.createdBy);
        setAuthorName(author?.name || 'Ukjent bruker');
      }
    }
    fetchAuthorName();
  }, [place?.createdBy]);

    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      fetchPlace();
      
      const fetchUserData = async () => {
        const userDoc = await firebaseDB.getUser(user.uid);
        setUserProfile(userDoc);
        if (userDoc?.orgId) {
          const org = await firebaseDB.getOrganization(userDoc.orgId);
          setOrganization(org);
        }
      };
      fetchUserData();
    }
  }, [user, id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDeletePlace = async () => {
    if (deleteConfirmation !== requiredDeleteText) {
      toast({
        title: "Feil bekreftelse",
        description: "Vennligst skriv setningen nøyaktig som vist.",
        variant: "destructive"
      });
      return;
    }

    if (!place) return;

    setIsDeleting(true);
    try {
      await firebaseDB.deletePlace(place.id);
      toast({
        title: "Sted slettet",
        description: "Stedet er permanent fjernet.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Delete place error:", error);
      toast({
        title: "Sletting feilet",
        description: error.message || "Kunne ikke slette stedet.",
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };

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

  // Get labels from organization settings or default
  const descEnabled = organization?.fieldSettings?.description?.enabled ?? true;
  const descLabel = organization?.fieldSettings?.description?.label || "Beskrivelse & Instruksjoner 1";

  const notesEnabled = organization?.fieldSettings?.notes?.enabled ?? true;
  const notesLabel = organization?.fieldSettings?.notes?.label || "Beskrivelse & Instruksjoner 2";

  const field3Enabled = organization?.fieldSettings?.field3?.enabled ?? false;
  const field3Label = organization?.fieldSettings?.field3?.label || "Ekstra Informasjon";

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl print:hidden">
        
        {/* Top Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            asChild 
            className="pl-0 hover:bg-transparent hover:text-primary"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Tilbake til oversikt
            </Link>
          </Button>
        </div>

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
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div className="relative rounded-2xl overflow-hidden shadow-md border bg-slate-100 cursor-zoom-in group/img">
                                      <AspectRatio ratio={16 / 9}>
                                        <Image
                                          src={img.url}
                                          alt={img.description || `Bilde ${index + 1}`}
                                          fill
                                          className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                                          priority={index === 0}
                                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
                                        />
                                      </AspectRatio>
                                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                                        <Maximize2 className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md" />
                                      </div>
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center" aria-describedby={undefined}>
                                    <DialogTitle className="sr-only">
                                      Bildevisning for {place.name} - Bilde {index + 1}
                                    </DialogTitle>
                                    <div className="relative w-full h-[90vh] flex items-center justify-center">
                                      <TransformWrapper
                                        initialScale={1}
                                        minScale={1}
                                        maxScale={8}
                                        centerOnInit={true}
                                        wheel={{ step: 0.1 }}
                                      >
                                        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                                          <>
                                            <div className="absolute top-4 left-4 z-50 flex gap-2">
                                              <Button variant="secondary" size="icon" onClick={() => zoomIn()} className="rounded-full shadow-lg h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zoom-in h-5 w-5"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
                                              </Button>
                                              <Button variant="secondary" size="icon" onClick={() => zoomOut()} className="rounded-full shadow-lg h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zoom-out h-5 w-5"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
                                              </Button>
                                              <Button variant="secondary" size="icon" onClick={() => resetTransform()} className="rounded-full shadow-lg h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm" title="Tilbakestill zoom">
                                                 <Maximize2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                              <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
                                                <Image
                                                  src={img.url}
                                                  alt={img.description || `Bilde ${index + 1}`}
                                                  fill
                                                  className="object-contain cursor-grab active:cursor-grabbing"
                                                  priority
                                                />
                                              </div>
                                            </TransformComponent>
                                          </>
                                        )}
                                      </TransformWrapper>
                                      <DialogClose asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-10 w-10 z-50 shadow-lg backdrop-blur-sm"
                                        >
                                          <X className="h-6 w-6" />
                                        </Button>
                                      </DialogClose>
                                    </div>
                                    {img.description && (
                                      <div className="absolute bottom-4 left-0 right-0 text-center">
                                        <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                                          {img.description}
                                        </span>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
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
                      <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center aspect-video text-slate-400">
                        <ImageOff className="h-12 w-12 mb-2" />
                        <span className="text-lg font-medium">Ingen bilder foreløpig</span>
                      </div>
                    )}
                  </div>
                </section>

                {descEnabled && (place.description || !place.notes) && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-semibold mb-3 flex items-center">
                        <Clipboard className="mr-2 h-5 w-5 text-primary" />
                        {descLabel}
                    </h2>
                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {place.description || 'Ingen innhold tilgjengelig.'}
                    </p>
                  </section>
                )}

                {notesEnabled && place.notes && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                          {notesLabel}
                      </h2>
                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {place.notes}
                      </p>
                  </section>
                )}

                {field3Enabled && place.field3 && (
                  <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Info className="mr-2 h-5 w-5 text-primary" />
                          {field3Label}
                      </h2>
                      <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {place.field3}
                      </p>
                  </section>
                )}

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
                {dbUser?.role === 'admin' && authorName && (
                <div className="flex items-center text-sm text-slate-600">
                  <UserIcon className="mr-3 h-4 w-4 text-primary" />
                  <span>Lagt til av: <span className="font-medium text-slate-900">{authorName || 'Laster...'}</span></span>
                </div>
                )}
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
                 {[...Array(8)].map((_, i) => (
                   <div key={i} className={`h-1.5 w-6 rounded-full ${i < (place.images?.length || 0) ? 'bg-primary' : 'bg-slate-300'}`} />
                 ))}
              </div>
              <p className="text-sm mt-2 font-medium text-slate-600">{place.images?.length || 0} av 8 bilder brukt</p>
            </section>

            {/* Action Buttons in Sidebar for Desktop, Bottom for Mobile */}
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setIsEditing(!isEditing)} 
                className="w-full h-12 text-lg font-semibold"
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
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handlePrint}
                className="w-full h-12 text-lg font-semibold"
              >
                <Printer className="mr-2 h-5 w-5" />
                Skriv ut PDF
              </Button>
              <Button 
                size="lg" 
                asChild 
                className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Tilbake til oversikt
                </Link>
              </Button>

              {userProfile?.role === 'admin' && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="lg" 
                      className="w-full h-12 text-lg font-semibold mt-4"
                    >
                      <Trash2 className="mr-2 h-5 w-5" />
                      Slett Sted
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Er du sikker?</DialogTitle>
                      <DialogDescription>
                        Dette vil permanent slette "{place.name}" og alle tilhørende data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Label className="text-destructive font-bold">
                        Skriv nøyaktig følgende setning for å bekrefte:
                      </Label>
                      <div className="p-3 bg-slate-100 rounded text-sm font-mono select-all">
                        {requiredDeleteText}
                      </div>
                      <Input 
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Skriv setningen her..."
                        className="border-destructive/30 focus-visible:ring-destructive"
                        onPaste={(e) => {
                            e.preventDefault();
                            toast({
                                title: "Ingen klipp og lim",
                                description: "Du må skrive setningen manuelt.",
                                variant: "destructive"
                            });
                        }}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Avbryt</Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeletePlace}
                        disabled={deleteConfirmation !== requiredDeleteText || isDeleting}
                      >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sletter...
                            </>
                        ) : (
                            "Slett Sted"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
      <PrintPlace place={place} organization={organization} />
    </>
  );
}
