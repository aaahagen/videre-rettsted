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

export default function LoginPage() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await firebaseAuth.signIn(email, password);
      // The useEffect will handle the redirect
    } catch (err: any) {
      setLoginError(err.message || 'Kunne ikke logge inn. Vennligst sjekk legitimasjonen din.');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="mb-8 flex flex-col items-center gap-2">
        <Logo className="h-16 w-16" />
        <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
          Videre RettSted
        </h1>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="font-headline text-2xl text-center">Logg Inn</CardTitle>
          <CardDescription className="text-center">
            Skriv inn din e-post og passord for å få tilgang til kontoen din.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passord</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Glemt passord?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="bg-white"
              />
            </div>
            {loginError && (
              <p className="text-sm font-medium text-destructive text-center">
                {loginError}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logger inn...
                </>
              ) : (
                'Logg Inn'
              )}
            </Button>
            <div className="text-center text-sm text-slate-600">
              Har du ikke en konto?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Registrer deg her
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
