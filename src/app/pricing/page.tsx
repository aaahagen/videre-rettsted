import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Prisplaner
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Velg en plan som passer for din bedrift.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <Card className="flex flex-col">
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
          <Card className="flex flex-col border-2 border-primary">
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
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Ubegrenset</CardTitle>
              <CardDescription>1499,- NOK+ / mnd</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="list-disc list-inside space-y-2">
                <li>Ubegrenset antall brukere</li>
                <li>Ubegrenset antall steder</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/register?plan=ubegrenset">Velg</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl mt-12">
                Eller kjøp kildekoden
            </h2>
            <p className="mt-4 text-lg text-gray-600">
                Kjøp kildekoden og få full kontroll.
            </p>
        </div>


        <Card>
            <CardHeader>
                <CardTitle>Kjøp Kildekoden</CardTitle>
                <CardDescription>20 000,- NOK (engangssum)</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Få full tilgang til kildekoden og drift applikasjonen på egenhånd. Inkluderer lisens for bruk i din organisasjon.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a href="mailto:videre-communication@gmail.com">Kontakt oss</a>
              </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
