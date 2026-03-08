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
          <Image
            src="/icon.png"
            alt="VIDERE RettSted Logo"
            width={80}
            height={80}
            className="mx-auto mb-4 rounded-lg"
          />
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

        {/* Secure Payment Info */}
        <div className="flex items-center justify-center pt-12 mt-8">
            <div className="flex items-center gap-4 p-4 border rounded-full bg-white shadow-sm">
                <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                    <h3 className="text-md font-semibold">Sikker Betaling via Stripe</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Vi lagrer aldri dine kortopplysninger.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
