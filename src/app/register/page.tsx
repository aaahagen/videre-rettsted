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
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setIsSubmitting(true);
    try {
      await firebaseAuth.registerOrganization(email, password, organizationName);
      // The useEffect will handle the redirect
    } catch (err: any) {
      setRegisterError(err.message || 'Kunne ikke registrere organisasjon. Vennligst prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrgNameChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setOrganizationName(value);
  };

  const handleEmailChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setEmail(value);
  };

  const handlePasswordChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setPassword(value);
  };

  if (loading || (user && !isSubmitting)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Link href="/" className="flex flex-col items-center gap-2">
            <Logo className="h-16 w-16" />
            <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
            Videre RettSted
            </h1>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-headline text-2xl">Start Organisasjon</CardTitle>
          <CardDescription>
            Opprett en ny organisasjon for din transportbedrift. Du blir automatisk administrator.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Bedriftsnavn / Organisasjon</Label>
              <Input
                id="organizationName"
                placeholder="F.eks. Nordmann Transport AS"
                value={organizationName}
                onChange={handleOrgNameChange}
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Din E-post (Administrator)</Label>
              <Input
                id="email"
                type="email"
                placeholder="ola.nordmann@eksempel.no"
                value={email}
                onChange={handleEmailChange}
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Velg et sterkt passord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="bg-white"
              />
            </div>
            {registerError && (
              <p className="text-sm font-medium text-destructive text-center">
                {registerError}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oppretter konto...
                </>
              ) : (
                'Opprett Organisasjon'
              )}
            </Button>
            <div className="text-center text-sm text-slate-600">
              Har du allerede en konto?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Logg inn her
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
