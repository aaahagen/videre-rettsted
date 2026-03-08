import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Server } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="bg-slate-50">
      <div className="container mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Prisplaner
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Velg en plan som passer for din bedrift.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Plan 1 */}
          <Card className="flex flex-col transform hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle>Start</CardTitle>
              <CardDescription>299,- NOK / mnd</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside space-y-2">
                <li>Opp til 5 brukere</li>
                <li>Opp til 100 steder</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/register?plan=start">Velg</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Plan 2 */}
          <Card className="flex flex-col border-2 border-primary shadow-lg transform hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle>Vekst</CardTitle>
              <CardDescription>699,- NOK / mnd</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside space-y-2">
                <li>Opp til 20 brukere</li>
                <li>Opp til 500 steder</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/register?plan=vekst">Velg</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Plan 3 */}
          <Card className="flex flex-col transform hover:scale-105 transition-transform duration-300">
            <CardHeader>
              <CardTitle>Ubegrenset</CardTitle>
              <CardDescription>Kontakt for pris</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside space-y-2">
                <li>Ubegrenset antall brukere</li>
                <li>Ubegrenset antall steder</li>
                <li>Egen supportavtale</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <a href="mailto:videre-communication@gmail.com?subject=Forespørsel om Ubegrenset plan">Kontakt oss</a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Divider */}
        <div className="relative my-12">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-slate-50 px-3 text-lg font-medium text-gray-900">
                Eller
                </span>
            </div>
        </div>
        
        {/* Source Code Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                            <Server className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Kjøp Kildekoden
                    </h2>
                    <p className="mt-2 text-lg text-gray-600">
                        For bedrifter med spesielle krav til sikkerhet, tilpasning eller som ønsker å unngå løpende kostnader.
                    </p>
                </div>
                <div>
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Bedriftslisens</CardTitle>
                            <CardDescription>20 000,- NOK (engangssum)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">Ta fullt eierskap over applikasjonen. Med en engangslisens får dere tilgang til all kildekode, slik at dere kan drifte, tilpasse og videreutvikle løsningen internt på egne systemer.</p>
                        </CardContent>
                        <CardFooter>
                        <Button asChild className="w-full">
                            <a href="mailto:videre-communication@gmail.com?subject=Forespørsel om kjøp av lisens">Kontakt oss for kjøp</a>
                        </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
      </div>
        {/* Footer */}
        <footer className="w-full border-t border-gray-200 py-8 bg-white">
            <div className="container mx-auto max-w-5xl text-center text-gray-500">
                <div className="flex justify-center items-center gap-4 md:gap-6 mb-4">
                    <Image
                        src="/icon2.png"
                        alt="VIDERE Logo"
                        width={60}
                        height={60}
                        className="rounded-lg bg-white p-1"
                    />
                    <div className="text-3xl font-thin text-slate-400">+</div>
                    <Image
                        src="/icon.png"
                        alt="VIDERE RettSted Logo"
                        width={60}
                        height={60}
                        className="rounded-lg"
                    />
                </div>
                <p className="text-sm">
                    VIDERE RettSted er en del av app-familien fra <span className="font-semibold">VIDERE</span>.
                </p>
                <div className="flex justify-center gap-6 my-4 text-sm">
                    <a href="#" className="hover:underline">Om Oss</a>
                    <a href="mailto:videre-communications@gmail.com" className="hover:underline">Kontakt Oss</a>
                </div>
                <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} VIDERE. Alle rettigheter forbeholdt.</p>
            </div>
        </footer>
    </div>
  );
}
