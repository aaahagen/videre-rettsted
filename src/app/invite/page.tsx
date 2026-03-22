'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app, { auth, db } from '@/lib/firebase/firebase';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function InviteContent() {
  const [user, loading] = useAuthState(auth);
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteId = searchParams.get('id');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);

  // If a user is already logged in, log them out so they can register as a new user
  useEffect(() => {
    // If we are currently submitting the form (registering), DO NOT redirect yet.
    if (isSubmitting) return;

    if (user && !loading && invitationData && user.email !== invitationData.email) {
      signOut(auth);
    } else if (user && !loading && invitationData && user.email === invitationData.email) {
       router.push('/dashboard');
    }
  }, [user, loading, router, invitationData, isSubmitting]);

  useEffect(() => {
    const checkInvitation = async () => {
      if (!inviteId) {
        setError('Ugyldig invitasjonslenke.');
        setIsLoadingInvitation(false);
        return;
      }

      try {
        const invRef = doc(db, 'invitations', inviteId);
        const invSnap = await getDoc(invRef);

        if (!invSnap.exists()) {
          setError('Invitasjonen finnes ikke.');
          setIsLoadingInvitation(false);
          return;
        }

        const data = invSnap.data();
        if (data.status === 'accepted') {
            setError('Denne invitasjonen er allerede brukt.');
            setIsLoadingInvitation(false);
            return;
        }

        if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
            setError('Invitasjonen har utløpt.');
            setIsLoadingInvitation(false);
            return;
        }

        setInvitationData(data);
        setEmail(data.email);
        setName(data.name || ''); // Pre-fill name if provided in invitation
      } catch (err: any) {
        console.error('Error fetching invitation:', err);
        setError(`En feil oppstod: ${err.message || 'Kunne ikke hente invitasjon'}`);
      } finally {
        setIsLoadingInvitation(false);
      }
    };

    checkInvitation();
  }, [inviteId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId || !invitationData) return;

    setError(null);
    setPrivacyError(false);

    if (!hasAcceptedPrivacyPolicy) {
      setPrivacyError(true);
      return;
    }

    if (password.length < 8) {
        setError('Passordet må være minst 8 tegn langt.');
        return;
    }

    setIsSubmitting(true);

    try {
      const functions = getFunctions(app);
      const acceptInvitationCallable = httpsCallable(functions, 'acceptInvitation');
      
      await acceptInvitationCallable({
        inviteId,
        password,
        name
      });

      // After successful creation, sign the user in directly
      // because the cloud function creates them, but doesn't log them in on this client
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);

      // AuthProvider listener will pick up the new user profile instantly.
      router.push('/dashboard');

    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = 'Kunne ikke opprette bruker.';
      if (err.message) {
         if (err.message.includes('already in use') || err.message.includes('already-exists')) {
            errorMessage = 'E-postadressen er allerede i bruk.';
         } else if (err.message.includes('characters') || err.message.includes('invalid-argument')) {
            errorMessage = 'Passordet må være minst 6 tegn.';
         } else {
             errorMessage = err.message;
         }
      }
      setError(errorMessage);
      setIsSubmitting(false);
    } 
  };

  if (loading || isLoadingInvitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-destructive text-center">Feil</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p>{error}</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button variant="outline">Gå til innlogging</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
     )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Logo className="h-24 w-24" />
        <div className="flex flex-col items-center space-y-1">
            <span className="font-headline text-2xl font-normal tracking-tight text-slate-900 block">
            Velkommen til
            </span>
            <span className="font-headline text-3xl font-bold tracking-tight text-slate-900 block">
            VIDERE RettSted
            </span>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div>
            <CardTitle className="font-headline text-xl mb-2">Fullfør din registrering</CardTitle>
            <CardDescription className="text-base">
              Du har blitt invitert til å bli med i
            </CardDescription>
          </div>
          
          {/* Explicit separate container for the organization name to guarantee new line */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            {invitationData?.orgName ? (
                <span className="font-bold text-primary text-lg block break-words">
                    {invitationData.orgName}
                </span>
            ) : (
                <span className="italic text-slate-500">en organisasjon</span>
            )}
          </div>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Fullt Navn</Label>
              <Input
                id="name"
                placeholder="Ola Nordmann"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Velg Passord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white"
                minLength={8}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Passordet må bestå av minst 8 tegn.
              </p>
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
                  Du må bekrefte at du har lest personvernerklæringen for å registrere deg.
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive text-center">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oppretter konto...
                </>
              ) : (
                'Fullfør Registrering'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function InvitePage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <InviteContent />
        </Suspense>
    )
}
