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
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-white border-b">
          <div className="container px-4 py-16 md:px-6 md:py-24 lg:py-32">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-slate-900">
                  Finn frem på første forsøk. Hver gang.
                </h1>
                <p className="mt-4 max-w-xl text-lg text-slate-600 md:text-xl">
                  Spar tid, reduser stress og øk leveringspresisjonen med Videre
                  RettSted.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="px-8 h-14 text-lg">
                    <Link href="/register">Kom i Gang</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="px-8 h-14 text-lg">
                    <Link href="/login">Logg Inn</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Image
                  src="/last.stopp.png"
                  width={1200}
                  height={800}
                  alt="Levering av varer til en kafé i en travel gate."
                  className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl object-cover shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Utfordringen Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-slate-900">Utfordringen:</h2>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl text-slate-900">Den &quot;siste meteren&quot; </h2>
              <p className="mt-4 text-lg text-slate-600">
                Standard GPS tar sjåføren til adressen, men ikke til den rette
                rampen, riktig dør eller den skjulte kjellerinngangen.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <Clock className="h-10 w-10 text-destructive mb-2" />
                  <CardTitle>Sjåfører kaster bort tid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Leter etter innganger og kaster bort verdifulle minutter på hvert stopp.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <PhoneOff className="h-10 w-10 text-destructive mb-2" />
                  <CardTitle>Kundeservice belastes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Telefoner om forsinkelser og misforståelser øker stresset for alle.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <UserPlus className="h-10 w-10 text-destructive mb-2" />
                  <CardTitle>Lang opplæringstid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Nye sjåfører bruker lang tid på å lære seg ruter og leveringspunkter.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Løsningen Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Løsningen:</h2>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Visuell leveringsstøtte </h2>
                <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                  Videre RettSted is a simple web-app that gives your driver the exact image they need to finish the job.
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
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                      <span className="text-lg font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Hvorfor velge Videre RettSted?</h3>
                <div className="grid gap-6">
                  <div className="flex gap-4">
                    <div className="bg-accent text-accent-foreground p-3 rounded-lg h-fit">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Økt presisjon</h4>
                      <p className="text-primary-foreground/80">Ingen flere misforståelser om hvilken dør som skal brukes.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-accent text-accent-foreground p-3 rounded-lg h-fit">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Datasikkerhet</h4>
                      <p className="text-primary-foreground/80">Alt lagres trygt i Google Cloud (Firestore).</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-accent text-accent-foreground p-3 rounded-lg h-fit">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Skalerbart</h4>
                      <p className="text-primary-foreground/80">Fungerer like godt for 2 som for 200 sjåfører.</p>
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
              Hvordan det fungerer
            </h2>
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="relative flex flex-col items-center text-center group">
                <div className="mb-6 bg-slate-100 p-6 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <UserPlus className="h-10 w-10" />
                </div>
                <div className="absolute top-10 -right-4 hidden lg:block text-slate-300">
                  <span className="text-4xl">→</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 font-headline">1. Registrer</h3>
                <p className="text-slate-600">Administratoren oppretter kontoer og inviterer sjåfører enkelt via en sikker lenke.</p>
              </div>
              <div className="relative flex flex-col items-center text-center group">
                <div className="mb-6 bg-slate-100 p-6 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Camera className="h-10 w-10" />
                </div>
                <div className="absolute top-10 -right-4 hidden lg:block text-slate-300">
                  <span className="text-4xl">→</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 font-headline">2. Dokumenter</h3>
                <p className="text-slate-600">Sjåføren tar bilde og legger inn en kort beskrivelse og hashtag (f.eks. #rampe4).</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="mb-6 bg-slate-100 p-6 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Share2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-headline">3. Del</h3>
                <p className="text-slate-600">Neste sjåfør som skal til samme adresse ser bildene, kartet og beskrivelsen med en gang.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 border-t bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl bg-white rounded-3xl p-8 md:p-12 shadow-xl text-center border">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-6">
                Klar for en mer effektiv hverdag?
              </h2>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                Kontakt oss for en demonstrasjon av Videre RettSted. Bli med på å fjerne usikkerheten i den siste meteren av leveransen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-10 h-14 text-lg">
                  Få en demo
                </Button>
                <Button variant="outline" size="lg" className="px-10 h-14 text-lg">
                  Lær mer
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400">
        <div className="container px-4 py-12 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-white font-headline font-bold text-xl mb-4">Videre RettSted</h3>
              <p className="max-w-xs">Vi hjelper transportbedrifter med å løse utfordringen med &quot;den siste meteren&quot; gjennom visuell støtte.</p>
            </div>
            <div className="text-sm">
              <p className="mb-2">© 2024 Videre RettSted. Alle rettigheter forbeholdt.</p>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-white transition-colors">Personvern</Link>
                <Link href="#" className="hover:text-white transition-colors">Vilkår</Link>
                <Link href="#" className="hover:text-white transition-colors">Kontakt</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
