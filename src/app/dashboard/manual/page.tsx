'use client';

import { useState } from 'react';
import { 
    BookOpen, 
    Users, 
    MapPin, 
    ShieldAlert, 
    Route, 
    Info,
    ChevronRight,
    Leaf,
    Building2,
    Shield,
    Settings,
    Edit,
    AlertTriangle,
    Map,
    PlusCircle,
    Camera,
    Search,
    LocateFixed,
    Package,
    TrendingUp,
    Clock,
    Sparkles,
    Calendar,
    Scale,
    Ruler,
    Weight,
    Key,
    PhoneCall
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';

type Chapter = 'intro' | 'roller' | 'steder' | 'avvik' | 'ruter';

interface ChapterDef {
    id: Chapter;
    title: string;
    icon: React.ElementType;
    adminOnly?: boolean;
}

export default function ManualPage() {
    const [activeChapter, setActiveChapter] = useState<Chapter>('intro');
    const { dbUser } = useAuth();
    const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'owner' || dbUser?.role === 'super_admin';

    const chapters: ChapterDef[] = [
        { id: 'intro', title: 'Introduksjon', icon: BookOpen },
        { id: 'roller', title: 'Roller & Tilganger', icon: Users },
        { id: 'steder', title: 'Leveringssteder', icon: MapPin },
        { id: 'avvik', title: 'Sikkerhet & Avvik', icon: ShieldAlert },
        { id: 'ruter', title: 'Ruteplanlegging', icon: Route, adminOnly: true },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 w-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl shadow-sm border border-indigo-200">
                    <BookOpen className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tight">Brukermanual</h1>
                    <p className="text-slate-500 font-medium">Offisiell dokumentasjon for VIDERE RettSted</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                {/* Navigation Sidebar */}
                <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 space-y-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-3">Kapitler</h3>
                    <div className="space-y-1.5">
                        {chapters.filter(c => !c.adminOnly || isAdmin).map(chapter => (
                            <button
                                key={chapter.id}
                                onClick={() => setActiveChapter(chapter.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
                                    activeChapter === chapter.id 
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <chapter.icon className={cn(
                                        "h-4 w-4 transition-transform group-hover:scale-110",
                                        activeChapter === chapter.id ? "text-indigo-200" : "text-slate-400"
                                    )} />
                                    {chapter.title}
                                </div>
                                <ChevronRight className={cn(
                                    "h-4 w-4 transition-transform",
                                    activeChapter === chapter.id ? "opacity-100 translate-x-1" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400"
                                )} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-10 w-full min-h-[600px]">
                    
                    {/* CHAPTER 1: INTRO */}
                    {activeChapter === 'intro' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><BookOpen className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Velkommen til VIDERE RettSted</h2>
                            </div>
                            
                            <div className="prose prose-slate max-w-none space-y-6">
                                <p className="text-slate-700 leading-relaxed text-lg font-medium">
                                    RettSted er den ultimate løsningen for hele verdikjeden — <strong className="text-indigo-700">fra ordre til levert vare</strong>. 
                                    Vi løser ikke bare "den siste meteren" med visuelle beskrivelser av rampen, men vi tar også hensyn til det store bildet i ruteplanleggingen.
                                </p>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    For å beregne den perfekte ruten analyserer RettSted et enormt antall variabler samtidig. Dette sikrer at riktig bil, med riktig sjåfør, ankommer til riktig tid, med riktig last. 
                                </p>
                            </div>

                            <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                                <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2 tracking-tight">
                                    <Sparkles className="h-5 w-5 text-indigo-500" />
                                    Vår planleggingsmotor tar hensyn til:
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <MapPin className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700">Lokasjon & Kart</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <Clock className="h-5 w-5 text-blue-500 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700">Åpningstider</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <Calendar className="h-5 w-5 text-purple-500 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700">Leveringsvindu</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <Users className="h-5 w-5 text-orange-500 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700">Sjåførens arbeidstid</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <Leaf className="h-5 w-5 text-green-500 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700">Drivstoff & Utslipp</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <Building2 className="h-5 w-5 text-slate-500 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700">Sentrumskjerne / Bom</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow lg:col-span-3">
                                        <Scale className="h-5 w-5 text-amber-500 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700">Fysiske begrensninger: Maksvekt og Dimensjoner (Lengde, Høyde, Bredde)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 mt-6 border-l-4 border-l-indigo-500 bg-indigo-50/50 rounded-r-2xl">
                                <h3 className="font-black text-indigo-900 text-lg mb-2 flex items-center gap-2">
                                    <Route className="h-5 w-5 text-indigo-500" />
                                    Fleksibel Omruting
                                </h3>
                                <p className="text-indigo-800/80 font-medium leading-relaxed">
                                    Hverdagen i logistikkbransjen er uforutsigbar. Med RettSted er det enkelt å dra-og-slippe ordre (Drag-and-drop) 
                                    hvis noe endrer seg i løpet av dagen. Systemet vil umiddelbart kalkulere ruten på nytt, sjekke at alle regler fortsatt 
                                    er overholdt, og gi deg beskjed hvis en endring fører til at du bryter et tidsvindu eller overstiger bilens maksimale lastekapasitet.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER 2: ROLES */}
                    {activeChapter === 'roller' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><Users className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Roller og Tilganger</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Systemet tilpasser seg hvem du er. Her er en oversikt over de ulike rollene og hva de har tilgang til:
                            </p>

                            <div className="space-y-4 mt-6">
                                <div className="p-5 border rounded-xl border-l-4 border-l-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-slate-800 tracking-tight">
                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md"><Users className="h-4 w-4" /></div> 
                                        Sjåfør & Innleid
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Har tilgang til å se leveringssteder, kjøre ruter, og rapportere avvik. De kan ikke redigere steder permanent, 
                                        men kan legge til bilder og kommentarer fra veien.
                                    </p>
                                </div>

                                <div className="p-5 border rounded-xl border-l-4 border-l-purple-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-slate-800 tracking-tight">
                                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md"><Route className="h-4 w-4" /></div> 
                                        Ruteplanlegger
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Kan opprette og tildele ruter. Har full tilgang til kart og bilflåte for å optimalisere logistikken på tvers av bedriften.
                                    </p>
                                </div>
                                
                                <div className="p-5 border rounded-xl border-l-4 border-l-emerald-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-slate-800 tracking-tight">
                                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md"><Package className="h-4 w-4" /></div> 
                                        Laster (Lager)
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Beregnet for terminal- og lageransatte. Har tilgang til Lasterampen (Manifest) for å skanne varer og bekrefte opplasting av biler, men har ikke tilgang til ruteplanlegging.
                                    </p>
                                </div>

                                <div className="p-5 border rounded-xl border-l-4 border-l-amber-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-slate-800 tracking-tight">
                                        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md"><TrendingUp className="h-4 w-4" /></div> 
                                        Selger
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Har tilgang til å opprette og redigere leveringssteder (for å sikre gode kundedata) samt legge til "Midlertidige Salgsmeldinger". Har ikke tilgang til selve logistikkdriften.
                                    </p>
                                </div>

                                <div className="p-5 border rounded-xl border-l-4 border-l-orange-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-slate-800 tracking-tight">
                                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md"><Shield className="h-4 w-4" /></div> 
                                        HMS Ansvarlig
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Fokuserer på sikkerhet. Behandler avviksrapporter og godkjenner HMS-sjekklister på leveringssteder for å sikre et trygt arbeidsmiljø. Kan ikke redigere adresser eller andre opplysninger på steder.
                                    </p>
                                </div>

                                <div className="p-5 border rounded-xl border-l-4 border-l-red-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-slate-800 tracking-tight">
                                        <div className="p-1.5 bg-red-100 text-red-600 rounded-md"><Settings className="h-4 w-4" /></div> 
                                        Administrator & Eier
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Full kontroll. Kan invitere brukere, slette steder, endre systeminnstillinger, tilpasse skjemaer og eksportere data. Eier har i tillegg juridisk kontroll.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER 3: PLACES */}
                    {activeChapter === 'steder' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><MapPin className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Forstå Leveringssteder</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Sentralt i RettSted er selve "Leveringsstedskortet". Hvert sted du besøker har et slikt kort med all informasjon du trenger for å levere raskt og trygt.
                            </p>

                            <div className="space-y-6">
                                <h3 className="font-black text-slate-800 text-xl tracking-tight">Hva betyr ikonene?</h3>
                                <p className="text-slate-600 font-medium">
                                    Øverst på kortet finner du flere små symboler (badges). Disse gir deg viktig informasjon ved første øyekast.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center justify-center font-bold text-[10px] w-10 h-10 p-0 rounded-lg shrink-0">
                                            <MapPin className="h-5 w-5" />
                                        </Badge>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">GPS Registrert</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Klar for ruteplanlegging.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                        <Badge className="bg-red-50 text-red-600 border-red-100 flex items-center justify-center font-bold text-[10px] w-10 h-10 p-0 rounded-lg shrink-0">
                                            <Shield className="h-5 w-5 fill-red-50" />
                                        </Badge>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">HMS Utfylt</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Risikovurdering er gjennomført.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                        <Badge className="bg-green-50 text-green-600 border-green-100 flex items-center justify-center font-bold text-[10px] w-10 h-10 p-0 rounded-lg shrink-0">
                                            <Leaf className="h-5 w-5" />
                                        </Badge>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">Nullutslippssone</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Krever elektrisk/gass.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                        <Badge className="bg-blue-50 text-blue-600 border-blue-100 flex items-center justify-center font-bold text-[10px] w-10 h-10 p-0 rounded-lg shrink-0">
                                            <Building2 className="h-5 w-5" />
                                        </Badge>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">Sentrumskjerne</p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">Varsler om høye bomavgifter.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <h3 className="font-black text-slate-800 text-xl tracking-tight">Salgsmeldinger</h3>
                                <Alert className="bg-amber-50 border-amber-200 border-l-4 border-l-amber-500 rounded-xl">
                                    <AlertTitle className="text-amber-800 font-black flex items-center gap-2 text-lg">
                                        <Info className="h-5 w-5" /> Midlertidige Salgsmeldinger
                                    </AlertTitle>
                                    <AlertDescription className="text-amber-700 mt-2 font-medium leading-relaxed">
                                        Administratorer og selgere kan legge inn gule "Salgsmeldinger" på et sted med en utløpsdato. Dette vises prominent øverst på kortet og brukes for å gi sjåføren en viktig, tidsbegrenset beskjed – for eksempel: <br/><br/>
                                        <em className="font-bold bg-amber-100 px-2 py-1 rounded">"Husk å overrekke kunden jubileumsgaven som ligger bak i bilen!"</em>
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <h3 className="font-black text-slate-800 text-xl tracking-tight">Knapper og Handlinger</h3>
                                <p className="text-slate-600 font-medium mb-4">
                                    Nederst på hvert leveringsstedskort finner du knapper for å utføre handlinger. Hvilke knapper du ser avhenger av situasjonen og bedriftens innstillinger.
                                </p>

                                <div className="grid gap-4">
                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border rounded-xl bg-white shadow-sm">
                                        <Button variant="outline" size="sm" className="w-full sm:w-48 shrink-0 bg-accent text-accent-foreground border-accent-foreground/20 pointer-events-none">
                                            <Map className="mr-2 h-4 w-4" />
                                            Naviger
                                        </Button>
                                        <div className="text-center sm:text-left">
                                            <p className="font-black text-sm text-slate-800">Start Navigasjon</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Åpner Google Maps på telefonen din og starter navigering direkte til de lagrede koordinatene.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border rounded-xl bg-white shadow-sm">
                                        <Button variant="outline" size="sm" className="w-full sm:w-48 shrink-0 pointer-events-none">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Se mer
                                        </Button>
                                        <div className="text-center sm:text-left">
                                            <p className="font-black text-sm text-slate-800">Se Detaljer & Rediger</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Åpner den fulle oversikten. Her ser du store bilder med zoom, åpningstider, dørkoder og detaljerte instruksjoner.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border rounded-xl bg-red-50/30 border-red-100 shadow-sm">
                                        <Button variant="outline" size="sm" className="w-full sm:w-48 shrink-0 bg-red-50 text-red-600 border-red-200 pointer-events-none">
                                            <ShieldAlert className="mr-2 h-4 w-4" />
                                            Fyll ut HMS
                                        </Button>
                                        <div className="text-center sm:text-left">
                                            <p className="font-black text-sm text-slate-800">HMS Sjekkliste</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Dersom bedriften din krever en HMS-sjekkliste og den ikke er fylt ut ennå, vil denne knappen lyse rødt og be deg gjennomføre sjekken.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border rounded-xl bg-orange-50/30 border-orange-100 shadow-sm">
                                        <Button variant="outline" size="sm" className="w-full sm:w-48 shrink-0 bg-orange-50 text-orange-600 border-orange-200 pointer-events-none">
                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                            Meld Avvik
                                        </Button>
                                        <div className="text-center sm:text-left">
                                            <p className="font-black text-sm text-slate-800">Meld ifra om fare</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Bruk denne knappen hvis noe er galt på stedet (f.eks is, hund, dårlig rampe). Du kan laste opp bilde og advare neste sjåfør umiddelbart.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <h3 className="font-black text-slate-800 text-xl tracking-tight flex items-center gap-2">
                                    <PlusCircle className="h-6 w-6 text-indigo-500" />
                                    Opprette og Redigere Steder
                                </h3>
                                <p className="text-slate-600 font-medium mb-4 leading-relaxed">
                                    Når du trykker på <strong>"Nytt sted"</strong> i menyen, eller trykker <strong>"Rediger Sted"</strong> inne på en steds-side, åpnes redigeringsskjemaet. Her er de viktigste funksjonene for å sikre at stedet blir lagret riktig:
                                </p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-6 border rounded-2xl bg-slate-50 shadow-inner space-y-4">
                                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-indigo-500" />
                                            Finne Nøyaktig Posisjon
                                        </h4>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Adresser er ofte unøyaktige for store lagerbygg. Bruk disse verktøyene i skjemaet:
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <Button variant="outline" className="w-full font-bold border-indigo-200 text-indigo-700 bg-indigo-50/50 pointer-events-none">
                                                <Search className="h-4 w-4 mr-2" />
                                                Hent koordinater
                                            </Button>
                                            <p className="text-xs text-slate-500 ml-2 border-l-2 border-slate-200 pl-2">Gjør et automatisk oppslag basert på adressen du skrev inn.</p>
                                            
                                            <Button variant="outline" className="w-full font-bold border-emerald-200 text-emerald-700 bg-emerald-50/50 pointer-events-none mt-2">
                                                <LocateFixed className="h-4 w-4 mr-2" />
                                                Bruk GPS
                                            </Button>
                                            <p className="text-xs text-slate-500 ml-2 border-l-2 border-slate-200 pl-2"><strong>Anbefalt hvis du står fysisk på stedet!</strong> Henter telefonens nøyaktige posisjon.</p>
                                        </div>
                                    </div>

                                    <div className="p-6 border rounded-2xl bg-slate-50 shadow-inner space-y-4">
                                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-indigo-500" />
                                            Leveringsvindu
                                        </h4>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Angi når det faktisk er mulig å levere på dette stedet. Dette er avgjørende for:
                                        </p>
                                        <ul className="text-sm text-slate-600 font-medium space-y-2 list-disc list-inside ml-2">
                                            <li><strong className="text-slate-800">Sjåføren:</strong> Viser umiddelbart om de vil rekke frem før stengetid basert på ruten.</li>
                                            <li><strong className="text-slate-800">Ruteplanleggeren (Auto):</strong> Maskinen vil automatisk bygge ruten slik at ingen tidsvinduer brytes, og advarer hvis en manuell endring (drag-and-drop) gjør at sjåføren kommer for sent.</li>
                                        </ul>
                                    </div>

                                    <div className="p-6 border rounded-2xl bg-slate-50 shadow-inner space-y-4">
                                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                                            <Ruler className="h-5 w-5 text-indigo-500" />
                                            Fysiske Begrensninger
                                        </h4>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Er det en lav undergang? En smal port? Eller en bro med vektgrense rett før innkjøringen?
                                        </p>
                                        <ul className="text-sm text-slate-600 font-medium space-y-2 list-none ml-2">
                                            <li className="flex items-center gap-2"><Ruler className="h-4 w-4 text-slate-400" /> <strong>Høyde, Lengde, Bredde (m)</strong></li>
                                            <li className="flex items-center gap-2"><Weight className="h-4 w-4 text-slate-400" /> <strong>Maks Vekt (kg)</strong></li>
                                        </ul>
                                        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                                            Dette vises tydelig for sjåføren, og sikrer at <strong className="text-slate-700">auto-planleggeren aldri tildeler en lastebil til et sted den ikke fysisk passer inn i</strong>.
                                        </p>
                                    </div>

                                    <div className="p-6 border rounded-2xl bg-slate-50 shadow-inner space-y-4">
                                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                                            <Camera className="h-5 w-5 text-indigo-500" />
                                            Bilder og Visuell Hjelp
                                        </h4>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Et bilde sier mer enn tusen ord. Du kan laste opp inntil 8 bilder per sted.
                                        </p>
                                        <ul className="text-sm text-slate-600 font-medium space-y-2 list-disc list-inside ml-2">
                                            <li>Take bilde av <strong>innkjørselen</strong> fra veien.</li>
                                            <li>Take bilde av selve <strong>rampen/porten</strong>.</li>
                                            <li>Take bilde av eventuelle <strong>hindringer</strong>.</li>
                                            <li>Du kan merke ett av bildene med "Stjerne" for å sette hovedbildet.</li>
                                        </ul>
                                    </div>

                                    <div className="p-6 border rounded-2xl bg-slate-50 shadow-inner space-y-4">
                                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                                            <Key className="h-5 w-5 text-indigo-500" />
                                            Dørkoder og Nøkler
                                        </h4>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            For steder som krever spesiell tilgang. Hvis din administrator har aktivert dette feltet under innstillinger, kan du legge til:
                                        </p>
                                        <ul className="text-sm text-slate-600 font-medium space-y-2 list-disc list-inside ml-2">
                                            <li><strong>Koder:</strong> Eksempelvis bom- eller portkoder.</li>
                                            <li><strong>Nøkler:</strong> Notat om hvilken fysisk systemnøkkel som kreves.</li>
                                        </ul>
                                        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                                            Dette lagres trygt og vises direkte til sjåføren på leveringskortet.
                                        </p>
                                    </div>

                                    <div className="p-6 border rounded-2xl bg-slate-50 shadow-inner space-y-4">
                                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                                            <PhoneCall className="h-5 w-5 text-indigo-500" />
                                            Kontaktpersoner
                                        </h4>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                            Spesielt nyttig for steder hvor man må ringe på forhånd, eller hvis man trenger hjelp for å komme seg inn.
                                        </p>
                                        <ul className="text-sm text-slate-600 font-medium space-y-2 list-disc list-inside ml-2">
                                            <li>Legg til flere personer med <strong>navn, telefon og e-post</strong>.</li>
                                        </ul>
                                        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                                            Sjåføren kan trykke på telefonnummeret i appen for å ringe kunden direkte fra sin egen mobil uten å måtte taste inn nummeret manuelt.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER 4: AVVIK */}
                    {activeChapter === 'avvik' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><ShieldAlert className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Sikkerhet & Avvik</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                En trygg arbeidsdag er det aller viktigste. RettSted gjør det enkelt å rapportere farlige forhold før en ulykke skjer, og varsler deretter kollegaer automatisk.
                            </p>

                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent mt-12">
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-orange-500 text-white font-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        1
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border bg-white shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-black text-slate-800 text-lg">Oppdage og Rapportere</h3>
                                        </div>
                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                            På hvert leveringssted vil du se en knapp merket "Meld Avvik". Trykk på denne hvis du opplever isete ramper, farlige hunder, eller manglende sikring. Ta et bilde og send inn.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-red-500 text-white font-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        2
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border-2 border-red-500 bg-red-50/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-black text-red-700 text-lg">Advarsel til kollegaer</h3>
                                        </div>
                                        <p className="text-slate-700 font-medium text-sm leading-relaxed">
                                            Når et avvik er meldt, vil kortet til dette stedet umiddelbart få en rød, glødende ramme. Slik er nestemann som skal levere der advart om faren før de ankommer.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white font-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        3
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border bg-white shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-black text-slate-800 text-lg">Lukking av Avvik</h3>
                                        </div>
                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                            Administrator eller HMS-ansvarlig vil behandle saken. Når problemet er løst (f.eks. snøen er ryddet bort), kan de "Lukke" avviket i adminpanelet, og advarselen forsvinner.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER 5: RUTER */}
                    {activeChapter === 'ruter' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><Route className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Ruteplanlegging</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                RettSted håndterer planlegging og tildeling av ruter til sjåfører.
                            </p>
                            
                            <Alert className="bg-indigo-50 border-indigo-200">
                                <Info className="h-5 w-5 text-indigo-600" />
                                <AlertTitle className="text-indigo-900 font-bold ml-2">Modul under utvikling</AlertTitle>
                                <AlertDescription className="text-indigo-800 ml-2 mt-1">
                                    Auto-planlegging (Constraint Engine) og drag-and-drop rutebygging testes for øyeblikket. Instrukser og visuelle guider for planleggere vil publiseres her når funksjonaliteten lanseres i stabil versjon.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}