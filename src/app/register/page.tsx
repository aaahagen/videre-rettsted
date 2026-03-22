'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { firebaseAuth } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [orgNumber, setOrgNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  const [legalError, setLegalError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setLegalError(false);

    if (!hasAcceptedLegal) {
      setLegalError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseAuth.registerOrganization(email, password, organizationName, name, orgNumber);
      // The useEffect will handle the redirect
    } catch (err: any) {
      setRegisterError(err.message || 'Kunne ikke registrere organisasjon. Vennligst prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || (user && !isSubmitting)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4F8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A237E]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F8] p-4">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Link href="/" className="flex flex-col items-center gap-2">
            <Logo className="h-32 w-32" />
            <h1 className="font-headline text-3xl font-bold tracking-tight text-[#1A237E]">
            VIDERE RettSted
            </h1>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg border-none bg-white">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-headline text-2xl text-[#1A237E]">Start Organisasjon</CardTitle>
          <CardDescription className="text-slate-500">
            Opprett en ny organisasjon for din transportbedrift. Du blir automatisk administrator.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-6">
            
            {/* Input Group with Light Blue Background */}
            <div className="space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <div className="space-y-2">
                <Label htmlFor="organizationName" className="text-[#1A237E] font-medium">Bedriftsnavn</Label>
                <Input
                  id="organizationName"
                  placeholder="F.eks. Nordmann Transport AS"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  className="bg-white border-blue-200 focus-visible:ring-[#1A237E]"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="orgNumber" className="text-[#1A237E] font-medium">Organisasjonsnummer</Label>
                  <span className="text-xs text-slate-500">Valgfritt, men anbefalt for DPA</span>
                </div>
                <Input
                  id="orgNumber"
                  placeholder="9 sifre (f.eks. 987654321)"
                  value={orgNumber}
                  onChange={(e) => setOrgNumber(e.target.value)}
                  className="bg-white border-blue-200 focus-visible:ring-[#1A237E]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#1A237E] font-medium">Ditt Navn (Administrator)</Label>
                <Input
                  id="name"
                  placeholder="Ola Nordmann"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white border-blue-200 focus-visible:ring-[#1A237E]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#1A237E] font-medium">Din E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ola.nordmann@eksempel.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-blue-200 focus-visible:ring-[#1A237E]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1A237E] font-medium">Velg et sterkt passord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-blue-200 focus-visible:ring-[#1A237E]"
                  minLength={6}
                />
              </div>
            </div>

            {/* Legal Block */}
            <div className={`p-4 rounded-xl ${legalError ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'}`}>
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="legal" 
                  checked={hasAcceptedLegal} 
                  onCheckedChange={(checked) => {
                    setHasAcceptedLegal(checked === true);
                    if (checked) setLegalError(false);
                  }}
                  className={`mt-0.5 flex-shrink-0 ${!legalError && 'border-slate-300 data-[state=checked]:bg-[#1A237E] data-[state=checked]:border-[#1A237E]'}`}
                />
                <label
                  htmlFor="legal"
                  className="text-sm font-medium leading-tight text-slate-700 cursor-pointer"
                >
                  Jeg aksepterer{' '}
                  <Link href="/legal/vilkar" className="font-semibold text-[#1A237E] hover:underline" target="_blank">
                    Brukervilkårene
                  </Link>{' '}
                  og{' '}
                  <Link href="/legal/dpa" className="font-semibold text-[#1A237E] hover:underline" target="_blank">
                    Databehandleravtalen (DPA)
                  </Link>{' '}
                  på vegne av min bedrift, og bekrefter at jeg har lest{' '}
                  <Link href="/legal/personvern" className="font-semibold text-[#1A237E] hover:underline" target="_blank">
                    Personvernerklæringen
                  </Link>.
                </label>
              </div>
              {legalError && (
                <p className="text-xs font-medium text-destructive mt-2 pl-7">
                  Du må akseptere vilkårene for å opprette en organisasjon.
                </p>
              )}
            </div>

            {registerError && (
              <p className="text-sm font-medium text-destructive text-center bg-red-50 p-3 rounded-lg border border-red-100">
                {registerError}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full text-lg h-12 bg-[#1A237E] hover:bg-[#1A237E]/90 text-white rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Oppretter konto...
                </>
              ) : (
                'Opprett Organisasjon'
              )}
            </Button>
            <div className="text-center text-sm text-slate-600">
              Har du allerede en konto?{' '}
              <Link href="/login" className="font-semibold text-[#1A237E] hover:underline">
                Logg inn her
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}