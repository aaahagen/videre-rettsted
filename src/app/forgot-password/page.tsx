
'use client';

import { useState } from 'react';
import { firebaseAuth } from '@/lib/firebase/auth';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await firebaseAuth.sendPasswordResetEmail(email);
      setMessage('En e-post for tilbakestilling av passord er sendt. Vennligst sjekk innboksen din.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'En ukjent feil oppsto.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setEmail(value);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/">
            <Logo className="h-16 w-16" />
        </Link>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-slate-900">
          Videre RettSted
        </h1>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="font-headline text-2xl text-center">Glemt Passord</CardTitle>
          <CardDescription className="text-center">
            Skriv inn din e-postadresse, så sender vi deg en lenke for å tilbakestille passordet ditt.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
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
            {error && (
              <p className="text-sm font-medium text-destructive text-center">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm font-medium text-green-600 text-center">
                {message}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sender e-post...
                </>
              ) : (
                'Send Tilbakestillingslenke'
              )}
            </Button>
            <div className="text-center text-sm">
              <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Tilbake til innlogging
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
