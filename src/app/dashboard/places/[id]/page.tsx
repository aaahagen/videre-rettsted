'use client';
import { useAuth } from '@/components/auth-provider';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { firebaseDB } from '../../../../lib/firebase/database';
import { auth, db } from '../../../../lib/firebase/firebase';
import { Button } from '../../../../components/ui/button';
import { AspectRatio } from '../../../../components/ui/aspect-ratio';
import { Badge } from '../../../../components/ui/badge';
import { Map, ArrowLeft, Calendar, User as UserIcon, Tag, Navigation, Edit3, Loader2, Maximize2, X, Clipboard, FileText, Printer, Trash2, ImageOff, Info, PhoneCall, Mail, Clock, ChevronDown, ChevronUp, Ruler, Weight, Save, Hash } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Place, Organization, UserProfile } from '@/lib/types';
import { format, isValid } from 'date-fns';
import { nb } from 'date-fns/locale';
import { PlaceForm } from '@/components/places/place-form';
import { PrintPlace } from '@/components/places/print-place';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { cn } from '@/lib/utils';
import { doc, onSnapshot } from 'firebase/firestore';

const DAYS = [
    { key: 'monday', label: 'Mandag' },
    { key: 'tuesday', label: 'Tirsdag' },
    { key: 'wednesday', label: 'Onsdag' },
    { key: 'thursday', label: 'Torsdag' },
    { key: 'friday', label: 'Fredag' },
    { key: 'saturday', label: 'Lørdag' },
    { key: 'sunday', label: 'Søndag' },
] as const;

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
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isConstraintsOpen, setIsConstraintsOpen] = useState(false);
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
    async function fetchAuthorName() {
      if (place?.createdBy && dbUser?.role === 'admin') {
        const author = await firebaseDB.getUser(place.createdBy);
        setAuthorName(author?.name || 'Ukjent bruker');
      }
    }
    fetchAuthorName();
  }, [place?.createdBy, dbUser?.role]);

  useEffect(() => {
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
      router.push('/dashboard/places');
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
    
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (dateValue?.seconds) {
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
  
  const descEnabled = organization?.fieldSettings?.description?.enabled ?? true;
  const descLabel = organization?.fieldSettings?.description?.label || "Beskrivelse & Instruksjoner 1";

  const notesEnabled = organization?.fieldSettings?.notes?.enabled ?? true;
  const notesLabel = organization?.fieldSettings?.notes?.label || "Beskrivelse & Instruksjoner 2";

  const field3Enabled = organization?.fieldSettings?.field3?.enabled ?? false;
  const field3Label = organization?.fieldSettings?.field3?.label || "Beskrivelse & Instruksjoner 3";

  const field4Enabled = organization?.fieldSettings?.field4?.enabled ?? false;
  const field4Label = organization?.fieldSettings?.field4?.label || "Beskrivelse & Instruksjoner 4";

  const doorCodeEnabled = organization?.fieldSettings?.doorCode?.enabled ?? false;
  const doorCodeLabel = organization?.fieldSettings?.doorCode?.label || "Dørkoder / Tilgang";

  const contactPersonsEnabled = organization?.fieldSettings?.contactPersons?.enabled ?? false;
  const contactPersonsLabel = organization?.fieldSettings?.contactPersons?.label || "Kontaktpersoner";

  return (
    <>
      <div className={cn(
          "container mx-auto px-4 py-8 print:hidden",
          isEditing ? "max-w-7xl" : "max-w-5xl"
      )}>
        
        <div className="mb-4">
          <Button 
            variant="secondary"
            size="sm" 
            asChild 
            className="text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 shadow-none border"
          >
            <Link href={`/dashboard/places#place-${place.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake til oversikt
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* MAIN CONTENT COLUMN */}
              <div className={cn(
                  "space-y-6",
                  isEditing && "lg:col-span-2"
              )}>
                {isEditing ? (
                  <section className="bg-white p-6 rounded-xl shadow-sm border">
                      <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="p-2 bg-primary/5 text-primary rounded-lg">
                            <Edit3 className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold">Rediger Leveringssted</h1>
                      </div>
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{place.name}</h1>
                          {place.customerNumber && (
                              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 self-start sm:self-center font-mono py-1.5 px-3">
                                  <Hash className="h-3.5 w-3.5 mr-1" />
                                  Kundenr: {place.customerNumber}
                              </Badge>
                          )}
                      </div>
                      
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
                                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 600px"
                                            />
                                          </AspectRatio>
                                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                                            <Maximize2 className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md" />
                                          </div>
                                        </div>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center" aria-describedby={undefined}>
                                        <div className="relative w-full h-[90vh] flex items-center justify-center">
                                          <TransformWrapper
                                            initialScale={1}
                                            minScale={1}
                                            maxScale={8}
                                            centerOnInit={true}
                                          >
                                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                              <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
                                                <Image
                                                  src={img.url}
                                                  alt={img.description || `Bilde ${index + 1}`}
                                                  fill
                                                  className="object-contain"
                                                  priority
                                                  sizes="95vw"
                                                />
                                              </div>
                                            </TransformComponent>
                                          </TransformWrapper>
                                          <DialogClose asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-black rounded-full h-10 w-10 z-50 shadow-lg backdrop-blur-sm"
                                            >
                                              <X className="h-6 w-6" />
                                            </Button>
                                          </DialogClose>
                                        </div>
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

                    {descEnabled && place.description && (
                      <section className="bg-white p-5 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-semibold mb-3 flex items-center">
                            <Clipboard className="mr-2 h-5 w-5 text-primary" />
                            {descLabel}
                        </h2>
                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {place.description}
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
                              <FileText className="mr-2 h-5 w-5 text-primary" />
                              {field3Label}
                          </h2>
                          <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                              {place.field3}
                          </p>
                      </section>
                    )}

                    {field4Enabled && place.field4 && (
                      <section className="bg-white p-5 rounded-xl shadow-sm border">
                          <h2 className="text-xl font-semibold mb-3 flex items-center">
                              <FileText className="mr-2 h-5 w-5 text-primary" />
                              {field4Label}
                          </h2>
                          <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                              {place.field4}
                          </p>
                      </section>
                    )}

                    <section className="bg-white p-5 rounded-xl shadow-sm border">
                      <h2 className="text-xl font-semibold mb-3 flex items-center">
                          <Map className="mr-2 h-5 w-5 text-primary" />
                          Lokasjon & Kart
                      </h2>
                      <p className="text-lg text-slate-700 mb-3 font-medium">{place.address}</p>
                      
                      <div className="w-full h-[350px] rounded-xl overflow-hidden border bg-slate-100 mb-6 shadow-md">
                          {apiKey ? (
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={embedUrl}
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Maps"
                            ></iframe>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                <Map className="h-10 w-10 text-slate-400 mb-2" />
                                <p className="text-slate-500 font-medium">Forhåndsvisning av kart er ikke tilgjengelig</p>
                            </div>
                          )}
                      </div>

                      <Button className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                        <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                          <Navigation className="mr-2 h-5 w-5" />
                          Åpne i Google Maps
                        </a>
                      </Button>
                    </section>
                  </>
                )}
              </div>

              {/* SIDEBAR CONTENT COLUMN (ONLY VISIBLE IF NOT EDITING) */}
              {!isEditing && (
                <div className="space-y-6">
                  {doorCodeEnabled && place.doorCode && place.doorCode.filter(dc => dc.category || dc.name || dc.value).length > 0 && (
                    <section className="bg-white p-5 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-semibold mb-3 flex items-center">
                            <Info className="mr-2 h-5 w-5 text-primary" />
                            {doorCodeLabel}
                        </h2>
                        <div className="grid gap-2">
                            {place.doorCode.filter(dc => dc.category || dc.name || dc.value).map((dc, idx) => (
                                <div key={idx} className="bg-white border px-3 py-2 rounded text-sm flex justify-between items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase">{dc.category}</span>
                                        <span className="font-medium text-slate-700">{dc.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-primary">{dc.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                  )}

                  {contactPersonsEnabled && place.contactPersons && place.contactPersons.filter(c => c.name || c.phone || c.email).length > 0 && (
                    <section className="bg-white p-5 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-semibold mb-3 flex items-center">
                            <UserIcon className="mr-2 h-5 w-5 text-primary" />
                            {contactPersonsLabel}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                          {place.contactPersons.filter(c => c.name || c.phone || c.email).map((contact, index) => (
                              <div key={index} className="p-4 border rounded-md bg-slate-50 flex flex-col gap-2">
                                  {contact.name && <div className="font-semibold">{contact.name}</div>}
                                  {contact.phone && (
                                      <div className="flex items-center gap-2">
                                          <PhoneCall className="w-4 h-4 text-slate-500" />
                                          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>
                                      </div>
                                  )}
                                  {contact.email && (
                                      <div className="flex items-center gap-2">
                                          <Mail className="w-4 h-4 text-slate-500" />
                                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                                      </div>
                                  )}
                              </div>
                          ))}
                        </div>
                    </section>
                  )}

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

                  {/* OPENING HOURS COLLAPSIBLE */}
                  {place.weeklySchedule && (
                    <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <Collapsible open={isHoursOpen} onOpenChange={setIsHoursOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full flex items-center justify-between p-5 h-auto hover:bg-slate-50">
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-5 w-5 text-indigo-500" />
                                        <h2 className="text-lg font-semibold">Leveringsvindu</h2>
                                    </div>
                                    {isHoursOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-5 pb-5 space-y-2 border-t pt-4">
                                {DAYS.map(({ key, label }) => {
                                    const dayHours = place.weeklySchedule?.[key];
                                    const isOpen = dayHours?.isOpen;
                                    
                                    return (
                                        <div key={key} className={cn(
                                            "flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0",
                                            !isOpen && "opacity-40"
                                        )}>
                                            <span className="text-sm font-medium text-slate-600">{label}</span>
                                            {isOpen ? (
                                                <span className="text-sm font-bold text-slate-800">
                                                    {dayHours.open} - {dayHours.close}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 uppercase">Stengt</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </CollapsibleContent>
                        </Collapsible>
                    </section>
                  )}

                  {/* CONSTRAINTS COLLAPSIBLE */}
                  {(place.maxVehicleHeight || place.maxVehicleWidth || place.maxVehicleLength || place.maxVehicleWeight) && (
                    <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <Collapsible open={isConstraintsOpen} onOpenChange={setIsConstraintsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full flex items-center justify-between p-5 h-auto hover:bg-slate-50">
                                    <div className="flex items-center">
                                        <Ruler className="mr-2 h-5 w-5 text-slate-500" />
                                        <h2 className="text-lg font-semibold">Begrensninger</h2>
                                    </div>
                                    {isConstraintsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                            </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-5 pb-5 space-y-3 border-t pt-4">
                                {place.maxVehicleHeight && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Maks Høyde</span>
                                        <span className="font-bold">{place.maxVehicleHeight} m</span>
                                    </div>
                                )}
                                {place.maxVehicleWidth && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Maks Bredde</span>
                                        <span className="font-bold">{place.maxVehicleWidth} m</span>
                                    </div>
                                )}
                                {place.maxVehicleLength && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Maks Lengde</span>
                                        <span className="font-bold">{place.maxVehicleLength} m</span>
                                    </div>
                                )}
                                {place.maxVehicleWeight && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Maks Vekt</span>
                                        <span className="font-bold flex items-center gap-1">
                                          <Weight className="h-3 w-3" />
                                          {place.maxVehicleWeight} kg
                                        </span>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    </section>
                  )}

                  <section className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Logg</h2>
                    <div className="space-y-3">
                      {dbUser?.role === 'admin' && authorName && (
                      <div className="flex items-center text-sm text-slate-600">
                        <UserIcon className="mr-3 h-4 w-4 text-primary" />
                        <span>Lagt til av: <span className="font-medium text-slate-900">{authorName}</span></span>
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
                </div>
              )}
            </div>

            {/* ACTION BUTTONS (ALWAYS AT THE BOTTOM OF THE PAGE) */}
            <div className="pt-8 border-t flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-xl border shadow-sm mt-8">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="h-12 text-lg font-semibold px-8"
                >
                  {isEditing ? (
                    <>
                      <Map className="mr-2 h-5 w-5" />
                      Avbryt redigering
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-2 h-5 w-5" />
                      Rediger Sted
                    </>
                  )}
                </Button>
                
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handlePrint}
                    className="h-12 text-lg font-semibold px-8"
                  >
                    <Printer className="mr-2 h-5 w-5" />
                    Skriv ut PDF
                  </Button>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <Button 
                  size="lg" 
                  asChild 
                  className="h-12 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md px-8"
                >
                  <Link href={`/dashboard/places#place-${place.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tilbake til oversikt
                  </Link>
                </Button>

                {userProfile?.role === 'admin' && !isEditing && (
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="lg" 
                        className="h-12 text-lg font-semibold"
                      >
                        <Trash2 className="mr-2 h-5 w-5" />
                        Slett Sted
                      </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined}>
                      <DialogHeader>
                        <DialogTitle>Er du sikker?</DialogTitle>
                        <DialogHeader>
                          <DialogDescription>
                            Dette vil permanent slette "{place.name}" og alle tilhørende data.
                          </DialogDescription>
                        </DialogHeader>
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
