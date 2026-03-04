import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  CheckCircle2, 
  Camera, 
  Share2, 
  Clock, 
  PhoneOff, 
  UserPlus, 
  Zap, 
  ShieldCheck, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-white border-b overflow-hidden">
          <div className="container px-4 py-16 md:px-6 md:py-24 lg:py-32">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="z-10">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-slate-900 leading-tight">
                  Finn frem på første forsøk. Hver gang.
                </h1>
                <p className="mt-4 max-w-xl text-lg text-slate-600 md:text-xl">
                  Spar tid, reduser stress og øk leveringspresisjonen med VIDERE
                  RettSted. Den visuelle guiden for dine sjåfører.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="px-8 h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                    <Link href="/register">Kom i Gang</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="px-8 h-14 text-lg">
                    <Link href="/login">Logg Inn</Link>
                  </Button>
                </div>
              </div>
              <div className="relative lg:scale-110">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[2rem] blur-3xl opacity-50"></div>
                <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden group">
                   <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden relative">
                      <Image
                        src="/hero-image.png"
                        alt="VIDERE RettSted App"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                         <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                            <div className="bg-accent p-2 rounded-lg">
                               <MapPin className="text-white h-6 w-6" />
                            </div>
                            <div>
                               <p className="text-white font-bold">Hovedinngang Rampen</p>
                               <p className="text-white/70 text-sm italic">Bruk dør B4 bak bygget</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Utfordringen Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-slate-900 mb-2">Utfordringen:</h2>
              <h3 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-primary">Den &quot;siste meteren&quot; </h3>
              <p className="mt-4 text-lg text-slate-600">
                Standard GPS tar sjåføren til adressen, men ikke til den rette
                rampen, riktig dør eller den skjulte kjellerinngangen.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="bg-destructive/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">Sjåfører kaster bort tid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Leter etter innganger og kaster bort verdifulle minutter på hvert stopp. Dette fører til forsinkelser i hele ruten.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader>
                   <div className="bg-destructive/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                    <PhoneOff className="h-8 w-8 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">Kundeservice belastes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Telefoner om forsinkelser og misforståelser øker stresset for både sjåfører og kontoransatte.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardHeader>
                   <div className="bg-destructive/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                    <UserPlus className="h-8 w-8 text-destructive" />
                  </div>
                  <CardTitle className="text-xl">Lang opplæringstid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Nye sjåfører bruker lang tid på å lære seg ruter og spesifikke leveringspunkter som er &quot;selvfølgelige&quot; for veteranene.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Løsningen Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Løsningen:</h2>
                <h3 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-6 text-accent">Visuell leveringsstøtte </h3>
                <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                  VIDERE RettSted er en enkel web-app som gir sjåføren akkurat det bildet og den informasjonen de trenger for å fullføre jobben raskt.
                </p>
                <div className="space-y-4">
                  {[
                    "Bilder som forklarer mer enn ord",
                    "Ekstremt intuitiv og laget for alle",
                    "Full kontroll for administratorer",
                    "Sømløs integrasjon med Google Maps",
                    "Bedriftens eget digitale bibliotek"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="bg-accent/20 p-1 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-accent" />
                      </div>
                      <span className="text-lg font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold mb-8">Hvorfor velge VIDERE RettSted?</h3>
                <div className="grid gap-8">
                  <div className="flex gap-5">
                    <div className="bg-accent text-accent-foreground p-4 rounded-2xl h-fit shadow-lg shadow-accent/20">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1">Økt presisjon</h4>
                      <p className="text-primary-foreground/70">Ingen flere misforståelser om hvilken dør eller rampe som skal brukes.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="bg-accent text-accent-foreground p-4 rounded-2xl h-fit shadow-lg shadow-accent/20">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1">Datasikkerhet</h4>
                      <p className="text-primary-foreground/70">Alt lagres trygt i Google Cloud (Firestore) med din bedrifts private tilgang.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="bg-accent text-accent-foreground p-4 rounded-2xl h-fit shadow-lg shadow-accent/20">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1">Skalerbart</h4>
                      <p className="text-primary-foreground/70">Fungerer like godt for 2 som for 200 sjåfører. Systemet vokser med deg.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hvordan det fungerer Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-16">
              Slik fungerer det
            </h2>
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="relative flex flex-col items-center text-center group px-4">
                <div className="mb-8 bg-slate-50 p-8 rounded-3xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <UserPlus className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline">1. Registrer</h3>
                <p className="text-slate-600 leading-relaxed">Administratoren oppretter organisasjonen og inviterer sjåfører enkelt via en sikker, unik lenke.</p>
              </div>
              <div className="relative flex flex-col items-center text-center group px-4">
                <div className="mb-8 bg-slate-50 p-8 rounded-3xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <Camera className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline">2. Dokumenter</h3>
                <p className="text-slate-600 leading-relaxed">Sjåføren tar bilde, legger til en kort beskrivelse og knytter det til adressen for fremtiden.</p>
              </div>
              <div className="flex flex-col items-center text-center group px-4">
                <div className="mb-8 bg-slate-50 p-8 rounded-3xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <Share2 className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline">3. Del</h3>
                <p className="text-slate-600 leading-relaxed">Neste sjåfør som skal til samme adresse ser bildene og instruksene med en gang på sin mobil.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 border-t bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl text-center border relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl mb-6 text-slate-900 leading-tight">
                Klar for en mer effektiv leveringshverdag?
              </h2>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Kontakt oss for en demonstrasjon av VIDERE RettSted. Bli med på å fjerne usikkerheten i &quot;den siste meteren&quot; av leveransen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-10 h-16 text-xl shadow-lg hover:shadow-xl transition-all">
                  Få en demo
                </Button>
                <Button variant="outline" size="lg" className="px-10 h-16 text-xl">
                  Lær mer
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 border-t border-white/5">
        <div className="container px-4 py-16 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
               <div className="flex items-center gap-2 mb-6">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <MapPin className="text-white h-6 w-6" />
                  </div>
                  <h3 className="text-white font-headline font-bold text-2xl tracking-tight">VIDERE RettSted</h3>
               </div>
              <p className="max-w-xs text-lg leading-relaxed">Vi hjelper transportbedrifter med å løse utfordringen med &quot;den siste meteren&quot; gjennom visuell støtte og smart deling.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase text-xs tracking-widest">Produkt</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/register" className="hover:text-white transition-colors">Kom i gang</Link></li>
                    <li><Link href="/login" className="hover:text-white transition-colors">Logg inn</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Funksjoner</Link></li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <h4 className="text-white font-bold uppercase text-xs tracking-widest">Selskap</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="#" className="hover:text-white transition-colors">Om oss</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Kontakt</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Personvern</Link></li>
                  </ul>
               </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm italic">
            <p>© 2024 VIDERE RettSted. Utviklet for presisjon.</p>
            <div className="flex gap-8">
                <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
                <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
