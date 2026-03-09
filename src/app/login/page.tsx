'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { firebaseAuth } from '@/lib/firebase/auth';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setPrivacyError(false);

    if (!hasAcceptedPrivacyPolicy) {
      setPrivacyError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseAuth.signIn(email, password, rememberMe);
      // AuthProvider will handle redirect
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Kunne ikke logge inn. Vennligst sjekk legitimasjonen din.');
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Logo className="h-32 w-32" />
        <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
          VIDERE RettSted
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
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Husk meg
              </label>
            </div>
            
            <div className={`p-4 rounded-md ${privacyError ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'}`}>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="privacy" 
                  checked={hasAcceptedPrivacyPolicy} 
                  onCheckedChange={(checked) => {
                    setHasAcceptedPrivacyPolicy(checked === true);
                    if (checked) setPrivacyError(false);
                  }}
                  className="mt-1"
                />
                <label
                  htmlFor="privacy"
                  className="text-sm font-medium leading-tight cursor-pointer"
                >
                  Jeg bekrefter at jeg har lest og forstått{' '}
                  <Link href="/legal/personvern" className="font-semibold text-primary hover:underline" target="_blank">
                    personvernerklæringen
                  </Link>.
                </label>
              </div>
              {privacyError && (
                <p className="text-xs font-medium text-destructive mt-2 pl-6">
                  Du må bekrefte at du har lest personvernerklæringen for å logge inn.
                </p>
              )}
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
