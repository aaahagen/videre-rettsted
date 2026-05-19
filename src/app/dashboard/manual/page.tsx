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
    PhoneCall,
    Download,
    CheckCircle2,
    ListChecks,
    Truck,
    CameraIcon,
    Signature,
    CreditCard,
    BarChart3,
    ShieldCheck,
    ScanBarcode,
    ListTree,
    ArrowRightLeft,
    CheckCircle,
    FileSpreadsheet,
    UserPlus,
    CalendarDays,
    History,
    Wrench,
    Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';

type Chapter = 'intro' | 'roller' | 'steder' | 'avvik' | 'pod' | 'hms' | 'ordrer' | 'lasterampe' | 'ruter' | 'fleet' | 'workforce' | 'owner';

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
        { id: 'pod', title: 'Leveringsbevis (POD)', icon: CheckCircle2 },
        { id: 'hms', title: 'HMS-Systemet', icon: Shield },
        { id: 'ordrer', title: 'Ordrehåndtering', icon: Package, adminOnly: true },
        { id: 'lasterampe', title: 'Lasterampe (Manifest)', icon: ScanBarcode },
        { id: 'ruter', title: 'Ruteplanlegging', icon: Route, adminOnly: true },
        { id: 'fleet', title: 'Kjøretøy & Vedlikehold', icon: Truck, adminOnly: true },
        { id: 'workforce', title: 'Ansatte & HR', icon: Users, adminOnly: true },
        { id: 'owner', title: 'Bedriftsoversikt (Eier)', icon: Building2, adminOnly: true },
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
                                        Sjåfør & Innleid (Ekstern)
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Hverdagens helter. Sjåfører har tilgang til å se og <strong className="text-slate-800">redigere leveringssteder</strong> for å holde databasen oppdatert. 
                                        De kan <strong className="text-slate-800">opprette nye steder</strong> direkte fra veien, bruke <strong className="text-slate-800">Leveringsbevis (POD)</strong>, 
                                        utføre <strong className="text-slate-800">kjøretøykontroller</strong>, og rapportere avvik på både steder og biler. De tildeles ruter av planleggere.
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

                                <div className="p-5 border rounded-xl border-l-4 border-l-slate-400 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-slate-800 tracking-tight">
                                        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md"><Settings className="h-4 w-4" /></div> 
                                        Administrator
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Driftsansvarlig. Kan invitere brukere, slette steder, endre systeminnstillinger, tilpasse skjemaer og eksportere data. Sørger for at den daglige operasjonen flyter teknisk sett.
                                    </p>
                                </div>

                                <div className="p-5 border rounded-xl border-l-4 border-l-red-500 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-black text-lg mb-2 flex items-center gap-2 text-slate-800 tracking-tight">
                                        <div className="p-1.5 bg-red-100 text-red-600 rounded-md"><Building2 className="h-4 w-4" /></div> 
                                        Bedriftseier (Owner)
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        Øverste myndighet. Har alt av tilgang som administrator, men er i tillegg ansvarlig for <strong className="text-slate-800">betaling og abonnement</strong>. Eieren har tilgang til en eksklusiv <strong className="text-slate-800">Bedriftsoversikt</strong> med statistikk på toppnivå.
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
                                <h3 className="font-black text-slate-800 text-xl tracking-tight flex items-center gap-2">
                                    <PlusCircle className="h-6 w-6 text-indigo-500" />
                                    Opprette og Redigere Steder
                                </h3>
                                <p className="text-slate-600 font-medium mb-4 leading-relaxed">
                                    Som sjåfør har du makten til å forbedre databasen vår. Når du trykker på <strong>"Nytt sted"</strong> i menyen, eller trykker <strong>"Rediger Sted"</strong> inne på en steds-side, åpnes redigeringsskjemaet.
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

                            <div className="grid md:grid-cols-2 gap-6 mt-8">
                                <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-4 border-l-4 border-l-orange-500">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-orange-500" />
                                        Avvik på Steder
                                    </h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        Bruk "Meld Avvik"-knappen på et steds-kort hvis du opplever f.eks. is, farlige hunder, manglende belysning eller blokkerte ramper.
                                    </p>
                                    <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                                        <li>Stedet får en rød ramme i appen for alle sjåfører.</li>
                                        <li>Admins får beskjed og må løse saken for å fjerne advarselen.</li>
                                    </ul>
                                </div>

                                <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-4 border-l-4 border-l-red-500">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-red-500" />
                                        Avvik på Kjøretøy
                                    </h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        Under den daglige kjøretøykontrollen (pre-trip/post-trip) kan du rapportere skader eller feil på bilen.
                                    </p>
                                    <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                                        <li>Last opp inntil 4 bilder av skaden.</li>
                                        <li>Bilen merkes med "Observasjon" eller settes ut av drift av admin.</li>
                                        <li>Verkstedordre og historikk logges sentralt.</li>
                                    </ul>
                                </div>
                            </div>

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
                                            På hvert leveringssted vil du se en knapp merket "Meld Avvik". Trykk på denne hvis noe er galt. Ta et bilde og send inn.
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
                                            Når et avvik er meldt, vil kortet til dette stedet umiddelbart få en rød ramme. Slik er nestemann som skal levere der advart om faren før de ankommer.
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
                                            Administrator eller HMS-ansvarlig behandler saken. Når problemet er løst, "Lukker" de avviket i panelet, og advarselen forsvinner.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER: POD */}
                    {activeChapter === 'pod' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><CheckCircle2 className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Leveringsbevis (POD)</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Proof of Delivery (POD) sikrer fullstendig sporbarhet og beskytter både sjåfør og bedrift mot tvister.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 w-fit rounded-lg"><CameraIcon className="h-5 w-5" /></div>
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Foto-bevis</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Krav om bilde ved utlevering, spesielt hvis varen settes igjen uten signatur ("Satt igjen ved dør").
                                    </p>
                                </div>
                                <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 w-fit rounded-lg"><Signature className="h-5 w-5" /></div>
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Digital Signatur</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Kunden signerer direkte på sjåførens mobilskjerm ved mottak.
                                    </p>
                                </div>
                                <div className="p-5 border rounded-2xl bg-white shadow-sm space-y-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 w-fit rounded-lg"><LocateFixed className="h-5 w-5" /></div>
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">GPS Stempel</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Hver levering logges automatisk med nøyaktige koordinater for hvor beviset ble fanget.
                                    </p>
                                </div>
                            </div>

                            <Alert className="bg-slate-50 border-slate-200 rounded-xl">
                                <Info className="h-5 w-5 text-slate-600" />
                                <AlertDescription className="text-slate-600 font-medium">
                                    Dersom en levering ikke lar seg gjennomføre (f.eks. stengt vei eller feil adresse), krever systemet at sjåføren velger en årsak og dokumenterer situasjonen med bilde før saken kan avsluttes.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* CHAPTER: HMS */}
                    {activeChapter === 'hms' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><Shield className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">HMS-Systemet</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                HMS-modulen sikrer at alle leveringssteder blir risikovurdert før eller under besøk, og gir bedriften full dokumentasjon på utførte sikkerhetssjekker.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <Card className="border-2 border-indigo-100 bg-indigo-50/30">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-black flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-indigo-600" />
                                            Administrasjon (Admins)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm font-medium text-slate-600">
                                        <p>Som administrator eller HMS-ansvarlig bruker du <strong className="text-slate-800">HMS Logger & Innstillinger</strong> i menyen for å:</p>
                                        <ul className="space-y-2 list-disc list-inside">
                                            <li>Aktivere/deaktivere sjekklister globalt.</li>
                                            <li>Definere spørsmålene som skal stilles (f.eks. "Er det trygg belysning?", "Er rampen sikret?").</li>
                                            <li>Se en fullstendig logg over hvem som har sjekket hvilke steder og når.</li>
                                        </ul>
                                        <div className="pt-2">
                                            <Button variant="outline" className="w-full font-bold border-indigo-200 text-indigo-700 pointer-events-none">
                                                <Download className="h-4 w-4 mr-2" />
                                                Eksporter Logg (CSV)
                                            </Button>
                                            <p className="text-xs text-slate-500 mt-2">Du kan laste ned hele historikken til Excel for revisjon eller HMS-rapportering.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-emerald-100 bg-emerald-50/30">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-black flex items-center gap-2">
                                            <ListChecks className="h-5 w-5 text-emerald-600" />
                                            Utførelse (Sjåfører)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm font-medium text-slate-600">
                                        <p>Sjåfører og HMS-ansvarlige ser HMS-behovet direkte på steds-kortet:</p>
                                        <ul className="space-y-2 list-disc list-inside">
                                            <li>En <strong className="text-red-600">Rød HMS-knapp</strong> betyr at stedet krever sjekk.</li>
                                            <li>Når knappen trykkes, åpnes sjekklisten med de spørsmålene admin har valgt.</li>
                                            <li>Man kan legge til en utfyllende kommentar til sjekken.</li>
                                            <li>Når sjekken er lagret, blir knappen <strong className="text-emerald-600">Grønn</strong> og viser når den sist ble utført.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <h3 className="font-black text-slate-800 text-xl tracking-tight">Hvem ser hva?</h3>
                                <div className="grid gap-4">
                                    <div className="p-4 bg-white border rounded-xl shadow-sm flex items-start gap-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Users className="h-5 w-5" /></div>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">Sjåfører</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Ser kun HMS-knappen inne på hvert enkelt sted. De har ikke tilgang til den sentrale loggen eller innstillinger.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border rounded-xl shadow-sm flex items-start gap-4 border-l-4 border-l-orange-500">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0"><Shield className="h-5 w-5" /></div>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">HMS Ansvarlig</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Har full tilgang til HMS-panelet, kan endre sjekklister og se/laste ned loggen, i tillegg til å utføre sjekker ute på steder.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border rounded-xl shadow-sm flex items-start gap-4 border-l-4 border-l-red-500">
                                        <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0"><Settings className="h-5 w-5" /></div>
                                        <div>
                                            <p className="font-black text-sm text-slate-800">Administrator</p>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Har samme tilgang som HMS-ansvarlig, men kan i tillegg styre selve modultilgangen for hele bedriften.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER: ORDRER */}
                    {activeChapter === 'ordrer' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><Package className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Ordrehåndtering</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Alle oppdrag i RettSted starter som en ordre. Her lærer du hvordan du importerer, oppretter og administrerer dem.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-4">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                                        Masseimport (CSV)
                                    </h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        Den mest effektive metoden. Last opp en Excel/CSV-fil fra ditt TMS-system. RettSted vil:
                                    </p>
                                    <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
                                        <li>Koble ordrene til riktige leveringssteder i databasen.</li>
                                        <li>Validere kolli-informasjon og vekt.</li>
                                        <li>Gjøre dem umiddelbart tilgjengelige for ruteplanlegging.</li>
                                    </ul>
                                </div>

                                <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-4">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <PlusCircle className="h-5 w-5 text-blue-600" />
                                        Manuell Opprettelse
                                    </h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        For hasteoppdrag eller ad-hoc leveringer. Trykk på "Ny Ordre" og fyll ut:
                                    </p>
                                    <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
                                        <li>Kunde/Mottaker (Velg fra databasen).</li>
                                        <li>Beskrivelse av last (f.eks "2 Paller Dagligvarer").</li>
                                        <li>Vekt og volum for automatisk kapasitetsberegning.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER: LASTERAMPE */}
                    {activeChapter === 'lasterampe' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><ScanBarcode className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Lasterampe (Manifest)</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Lasterampen er terminalarbeiderens viktigste verktøy for å sikre at riktig pakke havner på riktig bil.
                            </p>

                            <div className="space-y-8">
                                <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-4">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <ListTree className="h-5 w-5 text-indigo-500" />
                                        Hva er et Manifest?
                                    </h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        Et manifest er en digital pakkseddel for en hel rute. Den viser nøyaktig hvilke ordrer og kolli som skal være med bilen.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="border-2 border-slate-100">
                                        <CardHeader>
                                            <CardTitle className="text-base font-black flex items-center gap-2">
                                                <ScanBarcode className="h-5 w-5 text-blue-600" />
                                                Skanning av Varer
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-slate-600 font-medium space-y-3">
                                            <p>Bruk en håndskanner eller mobilkamera for å skanne strekkoder på pakkene:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Systemet gir umiddelbar lyd- og visuell respons.</li>
                                                <li>Telleren oppdateres (f.eks. <strong className="text-slate-900">4/10 kolli lastet</strong>).</li>
                                                <li>Varsler hvis du skanner en vare som <strong className="text-red-600">ikke</strong> tilhører denne ruten.</li>
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-2 border-slate-100">
                                        <CardHeader>
                                            <CardTitle className="text-base font-black flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                Verifisering
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-slate-600 font-medium space-y-3">
                                            <p>Når alle varer er skannet inn:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Trykk på "Fullfør Manifest".</li>
                                                <li>Systemet sjekker om alt er med.</li>
                                                <li>Hvis noe mangler, må du bekrefte avviket før bilen kan kjøre.</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER 5: RUTER */}
                    {activeChapter === 'ruter' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><Route className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Ruteplanlegging</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Planlegging i RettSted kombinerer kraftig automatisering med menneskelig kontroll ("Cyborg Planning").
                            </p>

                            <div className="space-y-8">
                                <div className="p-6 border rounded-2xl bg-indigo-50/50 border-indigo-100 space-y-4">
                                    <h3 className="font-black text-indigo-900 flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-indigo-600" />
                                        Auto-planlegging (Constraint Engine)
                                    </h3>
                                    <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                                        Vår motor beregner automatisk den mest effektive rekkefølgen basert på:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold text-indigo-700">
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100"><Clock className="h-3 w-3" /> Åpningstider</div>
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100"><Users className="h-3 w-3" /> Sjåførens arbeidstid</div>
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100"><Weight className="h-3 w-3" /> Vektbegrensninger</div>
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100"><Truck className="h-3 w-3" /> Bilens kapasitet</div>
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100"><MapPin className="h-3 w-3" /> Geografi</div>
                                    </div>
                                </div>

                                <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-6">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                                        Manuel Justering
                                    </h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        Du har alltid siste ord. Bruk <strong className="text-slate-900">Drag-and-Drop</strong> for å endre rekkefølge eller flytte ordrer mellom ruter. 
                                        Systemet vil umiddelbart varsle deg hvis en manuell endring fører til:
                                    </p>
                                    <ul className="grid sm:grid-cols-2 gap-3">
                                        <li className="flex items-center gap-2 text-xs font-bold p-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                            <AlertTriangle className="h-3 w-3" /> Tidsbrudd (Stengt kunde)
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold p-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                            <AlertTriangle className="h-3 w-3" /> Sjåfør overtid (Arbeidstid)
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold p-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                            <AlertTriangle className="h-3 w-3" /> Overvekt på kjøretøy
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold p-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                            <AlertTriangle className="h-3 w-3" /> Fysisk sperre (For stor bil)
                                        </li>
                                        <li className="flex items-center gap-2 text-xs font-bold p-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
                                            <AlertTriangle className="h-3 w-3" /> Manglende ADR-sertifisering
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER: FLEET */}
                    {activeChapter === 'fleet' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><Truck className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Kjøretøy & Vedlikehold</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Administrer bedriftens bilflåte, overvåk vedlikehold og sørg for at alle kjøretøy er lovlige og trygge.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <Card className="border-2 border-blue-100">
                                    <CardHeader>
                                        <CardTitle className="text-base font-black flex items-center gap-2">
                                            <Gauge className="h-5 w-5 text-blue-600" />
                                            Flåteovervåkning
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-slate-600 font-medium space-y-3">
                                        <p>Få full oversikt over bilene dine i sanntid:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li><strong className="text-slate-900">Status:</strong> Klar, På tur, Parkert eller På verksted.</li>
                                            <li><strong className="text-slate-900">Kilometerstand:</strong> Oppdateres automatisk ved hver inspeksjon.</li>
                                            <li><strong className="text-slate-900">Fristovervåkning:</strong> EU-kontroll, service og fartsskriver-kalibrering.</li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-orange-100">
                                    <CardHeader>
                                        <CardTitle className="text-base font-black flex items-center gap-2">
                                            <Wrench className="h-5 w-5 text-orange-600" />
                                            Skadehåndtering
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-slate-600 font-medium space-y-3">
                                        <p>Når en sjåfør melder skade, havner den i triagesystemet:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>Se bilder og beskrivelse av skaden.</li>
                                            <li>Planlegg verkstedbesøk.</li>
                                            <li>Last opp verkstedordre og reparasjonskvitteringer for full historikk.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER: WORKFORCE */}
                    {activeChapter === 'workforce' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><Users className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Ansatte & HR</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Full kontroll på personell, arbeidstid og sertifiseringer.
                            </p>

                            <div className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-4">
                                        <h3 className="font-black text-slate-800 flex items-center gap-2">
                                            <UserPlus className="h-5 w-5 text-indigo-600" />
                                            Sjåførprofiler
                                        </h3>
                                        <p className="text-sm text-slate-600 font-medium">Lagre kritiske data på ett sted:</p>
                                        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                                            <li>Kontaktinfo og pårørende.</li>
                                            <li>Kontrakter og ansettelsesforhold.</li>
                                            <li>Sertifiseringer (ADR, Truck, etc).</li>
                                            <li>Nedlasting av sjåførkort (28-dagers regel).</li>
                                        </ul>
                                    </div>

                                    <div className="p-6 border rounded-2xl bg-white shadow-sm space-y-4">
                                        <h3 className="font-black text-slate-800 flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5 text-emerald-600" />
                                            Arbeidstid & Stempling
                                        </h3>
                                        <p className="text-sm text-slate-600 font-medium">Overvåk og godkjenn timer:</p>
                                        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                                            <li>Geofence-stempling (Stempler kun når sjåføren er på terminalen).</li>
                                            <li>GPS-stempling for fleksible lokasjoner.</li>
                                            <li>Eget godkjennings-workflow for overtid.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-6 border rounded-2xl bg-slate-50 border-slate-200">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                                        <History className="h-5 w-5 text-slate-500" />
                                        Tidslinje
                                    </h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        Bruk **Arbeids-tidslinjen** for å se hvem som er på jobb, hvem som har pause, og hvem som har ferie eller er syke. Dette gir deg et øyeblikksbilde av bedriftens kapasitet i dag og fremover.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CHAPTER: OWNER */}
                    {activeChapter === 'owner' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-2 bg-slate-100 rounded-lg"><Building2 className="h-5 w-5 text-slate-700" /></div>
                                <h2 className="text-2xl font-headline font-black text-slate-900 tracking-tight">Bedriftsoversikt (Eier)</h2>
                            </div>
                            
                            <p className="text-slate-700 text-lg font-medium">
                                Rollen som "Eier" (Owner) er designet for ledelsen. Her får man oversikt over hele organisasjonen på et strategisk nivå uten å bli overveldet av den daglige logistikkdriften.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <Card className="border-2 border-slate-200 bg-slate-50 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-black flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                                            Eksklusiv Statistikk
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm font-medium text-slate-600 leading-relaxed">
                                        <p>Bedriftseiere har tilgang til et eget dashboard som viser <strong className="text-slate-800">Key Performance Indicators (KPIs)</strong>:</p>
                                        <ul className="space-y-2 list-disc list-inside">
                                            <li>Totalt antall fullførte ruter historisk.</li>
                                            <li>Vekst i antall adresser og leveringssteder i databasen.</li>
                                            <li>Status på bilflåtens helse og vedlikehold.</li>
                                            <li>Antall aktive brukere fordelt på roller.</li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-slate-200 bg-slate-50 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-black flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                                            Samsvar & Compliance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm font-medium text-slate-600 leading-relaxed">
                                        <p>Hold kontroll på lovpålagte frister og dokumentasjon:</p>
                                        <ul className="space-y-2 list-disc list-inside">
                                            <li><strong className="text-slate-800">Fartsskriver (90 dager):</strong> Se hvor mange prosent av flåten som har godkjent nedlasting innenfor tidsfristen.</li>
                                            <li><strong className="text-slate-800">Sjåførkort (28 dager):</strong> Overvåkat at sjåførene tømmer kortene sine regelmessig.</li>
                                            <li><strong className="text-slate-800">EU-kontroll:</strong> Få varsler om kommende frister for kjøretøyene.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <h3 className="font-black text-slate-800 text-xl tracking-tight flex items-center gap-2">
                                    <CreditCard className="h-6 w-6 text-blue-600" />
                                    Abonnement og Betaling
                                </h3>
                                <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                                    <p className="text-blue-900 font-medium leading-relaxed">
                                        Eieren er den eneste i organisasjonen som kan administrere betaling. Fra Bedriftsoversikten kan man:
                                    </p>
                                    <ul className="mt-4 space-y-2 list-disc list-inside text-blue-800 font-bold">
                                        <li>Oppgradere eller nedgradere abonnement (Free/Pro/Enterprise).</li>
                                        <li>Se betalingshistorikk og laste ned fakturaer (via Stripe).</li>
                                        <li>Administrere betalingsmetoder (Kredittkort/EHF).</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-6 border-l-4 border-l-amber-500 bg-amber-50 rounded-r-2xl">
                                <h3 className="font-black text-amber-900 text-lg mb-2 flex items-center gap-2">
                                    <Info className="h-5 w-5 text-amber-600" />
                                    Tips til Eiere
                                </h3>
                                <p className="text-amber-800/80 font-medium leading-relaxed">
                                    Selv om Eier-dashboardet er "minimalistisk", har du tilgang til alle Administrator-funksjoner. Vi anbefaler likevel at du utnevner en dedikert <strong className="text-amber-900">Administrator</strong> for den daglige oppfølgingen av sjåfører og steder, slik at du kan fokusere på de store linjene.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}