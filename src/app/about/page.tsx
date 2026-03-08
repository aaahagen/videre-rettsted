
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Globe, Smartphone, DownloadCloud, Eye, Car, DatabaseBackup, Printer, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative text-center py-20 md:py-32 bg-gradient-to-br from-slate-900 to-slate-700 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-image.png"
            alt="Bakgrunnsbilde av en lastebil"
            layout="fill"
            objectFit="cover"
            quality={80}
            className="opacity-20"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg">
            Finn frem på første forsøk. Hver gang.
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-200">
            Spar tid, reduser stress og øk leveringspresisjonen med VIDERE RettSted – designet for den siste, avgjørende meteren av leveransen.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/pricing" className="bg-yellow-500 text-slate-900 font-bold py-3 px-8 rounded-lg text-lg hover:bg-yellow-400 transition-transform transform hover:scale-105">
              Kom i gang
            </Link>
            <Link href="/login" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-white hover:text-slate-900 transition-all">
              Logg inn
            </Link>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section id="challenge" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Utfordringen: Den siste, frustrerende meteren</h2>
            <p className="text-lg text-slate-600 mb-12">
              Standard GPS tar sjåføren til riktig adresse, men den viser sjelden veien til den spesifikke rampen, den skjulte bakdøren eller den riktige inngangen i en stor bygning. Resultatet er bortkastet tid, unødvendig stress og forsinkede leveranser.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Tidkrevende leting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Sjåfører kaster bort verdifull tid på å lete etter riktig leveringspunkt, noe som forplanter seg og skaper forsinkelser resten av dagen.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Frustrerte kunder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Kundeservice må håndtere unødvendige telefoner fra kunder og sjåfører, noe som reduserer effektiviteten.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Treg opplæring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Nye sjåfører bruker lang tid på å lære seg ruter og spesifikke leveringspunkter som er &quot;selvfølgelige&quot; for veteranene.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section id="solution" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Løsningen: Visuell leveringsstøtte</h2>
            <p className="text-lg text-slate-600 mb-12">
              VIDERE RettSted er en enkel og intuitiv web-app som gir sjåføren akkurat det de trenger for å fullføre jobben effektivt: et bilde av leveringsstedet.
            </p>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <Image src="/hero-image.png" alt="App-grensesnitt" width={1200} height={800} />
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold">Bilder som fjerner tvil</h3>
                  <p className="text-slate-600">Sjåførene ser nøyaktige bilder av innganger, ramper og porter. Ingen flere misforståelser eller feil.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Users className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold">Alltid Oppdatert Informasjon</h3>
                  <p className="text-slate-600">Det er sjåførene selv som tar bilder og oppdaterer instruksjoner direkte fra feltet. Dette sikrer at informasjonen alltid er fersk og nøyaktig.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold">Sømløs navigasjon</h3>
                  <p className="text-slate-600">Ett enkelt trykk på kartet i appen åpner Google Maps, klar til å lede sjåføren de siste, kritiske meterne.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold">Bedriftens kunnskapsbase</h3>
                  <p className="text-slate-600">Bygg opp et verdifullt bibliotek med leveringssteder som blir værende i bedriften, selv når erfarne sjåfører slutter.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Drivers, By Drivers Section */}
      <section id="for-drivers" className="py-20 bg-slate-800 text-white">
        <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-slate-700 rounded-full">
                        <Car className="w-10 h-10 text-yellow-400" />
                    </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Bygget av Sjåfører, for Sjåfører</h2>
                <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-300 mb-8">
                    VIDERE RettSted er ikke laget av et fjernt teknologiselskap. Vi er selv erfarne sjåfører som har kjent på frustrasjonen ved å ikke finne frem. Derfor er appen designet fra grunnen av for å være det verktøyet vi alltid har savnet. Det er sjåførene som er ekspertene, og det er de som bygger opp den verdifulle kunnskapsbasen som gjør hverdagen enklere for alle.
                </p>
            </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tilgjengelig Overalt, Uten Installasjon</h2>
            <p className="text-lg text-slate-600 mb-12">
                VIDERE RettSted er en moderne web-app bygget for maksimal tilgjengelighet. Glem App Store og kompliserte oppdateringer – alt du trenger er en nettleser.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-yellow-500">
              <CardHeader className="flex flex-col items-center">
                <div className="p-4 bg-yellow-100 rounded-full mb-4">
                    <Globe className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Ingen Installasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Åpne appen direkte i nettleseren på hvilken som helst enhet. Du har alltid tilgang til den nyeste versjonen, helt automatisk.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-yellow-500">
              <CardHeader className="flex flex-col items-center">
                <div className="p-4 bg-yellow-100 rounded-full mb-4">
                    <Smartphone className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Fungerer På Alle Enheter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Enten du bruker PC, Mac, iPhone eller Android, er opplevelsen like god. Appen tilpasser seg skjermen din automatisk.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-yellow-500">
              <CardHeader className="flex flex-col items-center">
                <div className="p-4 bg-yellow-100 rounded-full mb-4">
                    <DownloadCloud className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Legg til på Hjem-skjerm</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">For en enda raskere opplevelse kan du legge til VIDERE RettSted på hjem-skjermen din – akkurat som en vanlig app.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security and Compliance Section */}
      <section id="security" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trygghet for deg som leder</h2>
            <p className="text-lg text-slate-600 mb-12">
              Vi forstår at datasikkerhet og overholdelse av regelverk er avgjørende. Derfor er VIDERE RettSted bygget med trygghet og fleksibilitet i tankene.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Full kontroll på tilgang</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Som administrator styrer du nøyaktig hvem som har tilgang. Nye sjåfører inviteres enkelt via en tidsbegrenset og sikker lenke.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Dine Data, Din Kontroll</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Ta full eierskap over bedriftens data. Med et enkelt klikk kan du eksportere all informasjon for daglig, lokal backup.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Utskrift til Papir</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">For sjåfører som foretrekker papir, kan all viktig informasjon skrives ut som en oversiktlig A4-PDF med bilder og instrukser.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">NIS2-vennlig design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Appen fungerer frittstående og krever ingen integrasjon med bedriftens kjerne- eller ERP-systemer.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Unngå sensitiv informasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Vi anbefaler å bruke interne koder eller referanser i appen, slik at sensitive data forblir i deres egne, sikre systemer.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Et supplement, ikke et krav</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Se på VIDERE RettSted som et spesialisert effektivitetsverktøy, ikke som et kritisk system for bedriftens leveringsevne.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Fleksibel og Fremtidssikker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Appens arkitektur er designet for enkel overgang til andre serverløsninger, inkludert en egen, lokal server.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Kostnadseffektivt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Automatisk nedskalering av bilder sparer datatrafikk og lagringskostnader, noe som gjør appen rimelig i drift.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 text-center bg-white">
        <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-yellow-100 rounded-full">
                        <Eye className="w-10 h-10 text-yellow-600" />
                    </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Se Appen i Aksjon</h2>
                <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-600 mb-8">
                    Den beste måten å forstå kraften i VIDERE RettSted er å se den i bruk. Vi tilbyr en personlig og uforpliktende demo der vi viser hvordan appen kan løse akkurat dine utfordringer.
                </p>
                <a 
                    href="mailto:videre.communication@gmail.com?subject=Forespørsel om demo av VIDERE RettSted"
                    className="bg-slate-800 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-slate-700 transition-transform transform hover:scale-105"
                >
                    Be om en demo
                </a>
            </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center bg-slate-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Klar for en mer effektiv hverdag?</h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-300 mb-8">
            Bli med på å fjerne usikkerheten i den siste, avgjøende meteren av leveransen. Registrer din bedrift i dag og opplev forskjellen.
          </p>
          <Link href="/pricing" className="bg-yellow-500 text-slate-900 font-bold py-3 px-8 rounded-lg text-lg hover:bg-yellow-400 transition-transform transform hover:scale-105">
            Start nå
          </Link>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full mt-16 border-t border-gray-200 py-8 bg-white">
            <div className="container mx-auto max-w-5xl text-center text-sm text-gray-500">
                <div className="flex justify-center gap-6 mb-4">
                <a href="#" className="hover:underline">Om Oss</a>
                <a href="mailto:videre-communications@gmail.com" className="hover:underline">Kontakt Oss</a>
                </div>
                <p>&copy; {new Date().getFullYear()} VIDERE. Alle rettigheter forbeholdt.</p>
            </div>
        </footer>
    </div>
  );
}
