import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Globe, Smartphone, DownloadCloud, Eye, Car, Route as RouteIcon, Users, Clock, ShieldCheck, Zap, Leaf, Truck, Ruler, Package, GraduationCap, MapPin, Activity, Shield, Info, Download, Trash2, Search, Bell, Calculator, Lock, Server } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative text-center py-20 md:py-32 bg-gradient-to-br from-[#1A237E] to-slate-800 text-white overflow-hidden min-h-[400px] flex items-center">
        <Image
          src="/hero-image.png"
          alt="Bakgrunnsbilde av logistikk i bevegelse"
          fill
          sizes="100vw"
          className="opacity-20 object-cover z-0"
          quality={80}
          priority
        />
        <div className="absolute inset-0 bg-[#1A237E]/40 z-10"></div>
        
        <div className="container mx-auto px-4 relative z-20">
          <Badge className="bg-yellow-500 text-slate-900 font-black px-4 py-1 mb-6 uppercase tracking-widest text-xs border-none">Versjon 2.0: Smart Logistikk</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg leading-tight">
            Din erfaring. <span className="text-yellow-400">Vår teknologi.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-200 font-medium">
            VIDERE RettSted kombinerer din lokale kunnskap med kraftige algoritmer som automatiserer ruter, sikrer lasten og beskytter dine data i et lukket miljø.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/pricing" className="bg-yellow-500 text-slate-900 font-bold py-4 px-10 rounded-xl text-lg hover:bg-yellow-400 transition-all shadow-xl hover:scale-105">
              Kom i gang
            </Link>
            <Link href="/login" className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-bold py-4 px-10 rounded-xl text-lg hover:bg-white hover:text-slate-900 transition-all">
              Logg inn
            </Link>
          </div>
        </div>
      </section>

      {/* Security & Data Ownership Section */}
      <section id="data-security" className="py-12 bg-slate-900 text-white border-y border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-full">
                    <Lock className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h4 className="font-bold">100% Lukket Data</h4>
                    <p className="text-xs text-slate-400">Ingen deling med eksterne modeller.</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                    <Server className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h4 className="font-bold">Privat Database</h4>
                    <p className="text-xs text-slate-400">Full isolasjon mellom organisasjoner.</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-full">
                    <ShieldCheck className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                    <h4 className="font-bold">Eierskap til kunnskap</h4>
                    <p className="text-xs text-slate-400">Dine stedsdetaljer forblir din fordel.</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section id="challenge" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Utfordringen: Den siste frustrerende meteren</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Standard GPS tar sjåføren til riktig adresse, men den viser sjelden veien til den spesifikke rampen eller den riktige inngangen. Din bedrifts suksess hviler på denne lokale kunnskapen – vi hjelper deg å digitalisere den trygt.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="border-none bg-slate-50 shadow-sm">
              <CardHeader>
                <div className="flex justify-center mb-4 text-primary"><Search className="w-8 h-8" /></div>
                <CardTitle className="text-xl font-bold">Verdi i detaljene</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Sjåfører kaster bort tid på å lete. Din bedrifts unike kunnskap om leveringspunkter er en ressurs som må tas vare på.</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-slate-50 shadow-sm">
              <CardHeader>
                <div className="flex justify-center mb-4 text-primary"><Clock className="w-8 h-8" /></div>
                <CardTitle className="text-xl font-bold">Forutsigbar flyt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Med presise tidsestimater per lokasjon får du ruteplaner som faktisk stemmer med virkeligheten.</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-slate-50 shadow-sm">
              <CardHeader>
                <div className="flex justify-center mb-4 text-primary"><Users className="w-8 h-8" /></div>
                <CardTitle className="text-xl font-bold">Kunnskapsoverføring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Nye sjåfører blir operative på timer, ikke uker, fordi de har tilgang til bedriftens visuelle hukommelse.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section id="pillars" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Løsningen: Digital Presisjon</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
               VIDERE RettSted kombinerer visuelle detaljer med avansert matematisk optimering i et sikkert rammeverk.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Calculator className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Optimeringsmotor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">Våre algoritmer beregner de beste rutene ved å balansere bilens lasteevne, sjåførens turnus og miljøsoner.</p>
                <ul className="text-sm space-y-2 text-slate-500">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Matematisk clustering av ordrer</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Automatisk rute-sekvensering</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Overholdelse av sjåfør-timer</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Eye className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Visuell Veiledning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">Bilder av porter og ramper sikrer at sjåføren finner frem. Informasjonen eies av deg og deles aldri med andre.</p>
                <ul className="text-sm space-y-2 text-slate-500">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Privat bildegalleri per lokasjon</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sikker håndtering av dørkoder</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Geofencing for dokumentasjon</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Fysisk Firewall</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">Systemet validerer automatisk bilens dimensjoner mot stedets begrensninger for å unngå skader.</p>
                <ul className="text-sm space-y-2 text-slate-500">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Høyde- og breddesjekk</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Vektbegrensninger i sanntid</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Full kontroll på bil+henger</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Guarantee Section */}
      <section className="py-20 bg-[#1A237E] text-white">
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <Shield className="w-16 h-16 text-yellow-400 mx-auto" />
                <h2 className="text-3xl md:text-5xl font-black">Ditt "Know-How" er din styrke.</h2>
                <p className="text-xl text-blue-100 leading-relaxed">
                    Vi forstår at informasjonen om dine kunder og leveringssteder er bedriftshemmeligheter som gir deg et konkurransefortrinn. Derfor har vi bygget VIDERE RettSted med en <span className="text-yellow-400 font-bold">"Zero-Leak" filosofi</span>:
                </p>
                <div className="grid md:grid-cols-2 gap-8 text-left pt-8">
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-yellow-400" />
                            Ingen AI-trening
                        </h4>
                        <p className="text-sm text-blue-100/80">Dine data brukes <strong>aldri</strong> til å trene opp åpne AI-modeller. Din kunnskap forblir låst i din egen database.</p>
                    </div>
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Server className="w-5 h-5 text-yellow-400" />
                            Isolert Multi-tenancy
                        </h4>
                        <p className="text-sm text-blue-100/80">Hver organisasjon lever i sitt eget isolerte data-rom. Det er fysisk umulig for en konkurrent å se dine steder eller ruter.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Green Logistics Section */}
      <section className="py-20 bg-emerald-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-800 border border-emerald-700 px-4 py-1.5 rounded-full mb-6">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Miljøfokusert Logistikk</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">Bærekraft drevet av <span className="text-emerald-400">algoritmer</span></h2>
              <p className="text-xl text-emerald-100 leading-relaxed mb-8">
                Styr unna dyre bompenger og diesel-forbud. Systemet skiller automatisk mellom diesel- og nullutslippskjøretøy ved planlegging i bykjerner.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <h4 className="font-bold text-lg text-emerald-400">Sone-håndtering</h4>
                    <p className="text-sm text-emerald-100/80">Vår algoritme prioriterer elektriske biler i nullutslippssoner og kalkulerer bomavgifter for diesel-flåten.</p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-bold text-lg text-emerald-400">Rekkevidde-kontroll</h4>
                    <p className="text-sm text-emerald-100/80">Vi passer på bilens rekkevidde og sørger for at ruten alltid er innenfor batteriets kapasitet.</p>
                </div>
              </div>
            </div>
            <div className="relative h-[300px] lg:h-[400px]">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
                <div className="bg-emerald-800/40 backdrop-blur-xl border border-emerald-700 p-8 rounded-3xl relative shadow-2xl h-full flex flex-col justify-center">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-900/50">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Effektiv Flåte</p>
                            <h3 className="text-2xl font-bold">Klar for det grønne skiftet</h3>
                        </div>
                    </div>
                    <p className="italic text-emerald-200">"Vi har integrert tekniske begrensninger direkte i ruteplanleggingen, slik at du kan drive miljøvennlig med full kontroll."</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification & Terminal Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/2 order-2 lg:order-1">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">Ubrutt kontroll fra <span className="text-primary">rampe til dør</span></h2>
                    <p className="text-xl text-slate-600 mb-8">
                        Vår plattform sikrer dokumentasjon gjennom hele kjeden. Fra varene lastes på bilen til de er levert hos mottaker.
                    </p>
                    <div className="grid gap-6">
                        <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <Package className="w-6 h-6 text-primary shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-900">Lasterampe & Manifest</h4>
                                <p className="text-slate-500 text-sm">Dedikert dashboard for terminalen med skanning for å sikre at ruten er 100% korrekt lastet.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-900">Digital Proof of Delivery (POD)</h4>
                                <p className="text-slate-500 text-sm">Sjåførene dokumenterer leveransen med GPS-stempel, bildebevis og signatur direkte i appen.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <Activity className="w-6 h-6 text-primary shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-900">Overvåkning i sanntid</h4>
                                <p className="text-slate-500 text-sm">Følg fremdrift live, inkludert avviksmeldinger og nøyaktige leveringstidspunkter for bedre kundeservice.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 order-1 lg:order-2 w-full">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-video w-full">
                        <Image 
                            src="/hero-image.png" 
                            alt="Terminal dashboard preview" 
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Accessibility & Security Sections */}
      <section id="security" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Sikkerhet og Tilgjengelighet</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Vi beskytter dine data mens vi gjør dem tilgjengelige der de trengs – på veien.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4 text-center md:text-left">
                <Lock className="w-10 h-10 text-primary mx-auto md:mx-0" />
                <h4 className="font-bold text-slate-900">Total Datakontroll</h4>
                <p className="text-slate-500 text-sm">Du eier dataene. Inviter brukere med spesifikke roller som Sjåfør, Lager eller Planner.</p>
            </div>
            <div className="space-y-4 text-center md:text-left">
                <DownloadCloud className="w-10 h-10 text-primary mx-auto md:mx-0" />
                <h4 className="font-bold text-slate-900">Ingen Installasjon</h4>
                <p className="text-slate-500 text-sm">Moderne web-app (PWA) som fungerer direkte i nettleseren på PC, Mac, iPhone og Android.</p>
            </div>
            <div className="space-y-4 text-center md:text-left">
                <GraduationCap className="w-10 h-10 text-primary mx-auto md:mx-0" />
                <h4 className="font-bold text-slate-900">Integrert HMS</h4>
                <p className="text-slate-500 text-sm">Innebygd LMS for sertifisering og opplæring av sjåfører direkte i arbeidsflyten.</p>
            </div>
            <div className="space-y-4 text-center md:text-left">
                <Trash2 className="w-10 h-10 text-primary mx-auto md:mx-0" />
                <h4 className="font-bold text-slate-900">Full GDPR-kontroll</h4>
                <p className="text-slate-500 text-sm">Automatisert sletting av personopplysninger og historikk i tråd med lovverket.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Drivers, By Drivers Section */}
      <section id="for-drivers" className="py-24 bg-slate-900 text-white relative">
        <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-center mb-8">
                    <div className="p-5 bg-slate-800 rounded-full border border-slate-700 shadow-xl">
                        <Car className="w-10 h-10 text-yellow-400" />
                    </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-black mb-6">Bygget av Sjåfører, for Sjåfører</h2>
                <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
                    VIDERE RettSted er laget av folk som har sittet bak rattet. Vi kjenner tidspresset, de uleselige fraktbrevene og gleden ved en perfekt planlagt dag. Vi bygger de verktøyene vi selv alltid har savnet på veien.
                </p>
                <div className="flex justify-center items-center gap-4 text-sm font-bold text-yellow-500 uppercase tracking-widest">
                    <span>Erfaring</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                    <span>Presisjon</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                    <span>Integritet</span>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Klar for neste nivå?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            Digitaliser din bedrifts unike kunnskap i dag. Sikkerhet, presisjon og full kontroll.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/pricing" className="bg-[#1A237E] text-white font-bold py-4 px-12 rounded-xl text-lg hover:bg-blue-800 transition-all shadow-xl hover:scale-105">
                Se Priser
            </Link>
             <a 
                href="mailto:videre.communication@gmail.com?subject=Forespørsel om demo av VIDERE RettSted"
                className="bg-slate-100 text-slate-900 font-bold py-4 px-12 rounded-xl text-lg hover:bg-slate-200 transition-all"
            >
                Be om Demo
            </a>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full border-t border-slate-200 py-12 bg-white">
        <div className="container mx-auto max-w-5xl px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                <div className="flex items-center gap-4">
                    <Image 
                        src="/icon.png" 
                        alt="VIDERE Logo" 
                        width={50} 
                        height={50} 
                        className="rounded-lg" 
                    />
                    <div className="text-left">
                        <p className="font-black text-slate-900 leading-tight">VIDERE</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">RettSted</p>
                    </div>
                </div>
                <div className="flex gap-8 text-sm font-bold text-slate-600 uppercase tracking-tighter">
                    <Link href="/about" className="hover:text-primary transition-colors">Om Oss</Link>
                    <Link href="/pricing" className="hover:text-primary transition-colors">Priser</Link>
                    <a href="mailto:videre.logistics@gmail.com" className="hover:text-primary transition-colors">Kontakt</a>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
                <p>&copy; {new Date().getFullYear()} VIDERE. Alle rettigheter forbeholdt.</p>
                <div className="flex gap-6">
                    <Link href="/legal/personvern" className="hover:underline">Personvern</Link>
                    <Link href="/legal/vilkar" className="hover:underline">Vilkår</Link>
                    <Link href="/legal/dpa" className="hover:underline">DPA</Link>
                </div>
            </div>
        </div>
    </footer>
    </div>
  );
}

// Sub-components
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border", className)}>{children}</span>;
}
