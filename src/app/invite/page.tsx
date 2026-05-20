'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    Lock, 
    Mail, 
    ArrowRight,
    ShieldCheck,
    Check,
    ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth, db, functions } from '@/lib/firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Invitation } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

const registerSchema = z.object({
  password: z.string().min(8, 'Passordet må være minst 8 tegn.'),
  confirmPassword: z.string(),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: "Du må godta personvernerklæringen for å fortsette."
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passordene er ikke like",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function InviteContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [invitation, setInvitation] = useState<Invitation & { name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const inviteId = searchParams.get('id') || searchParams.get('invitation');

  // 1. Safety Redirect: If the user is already logged in, send them to the dashboard
  useEffect(() => {
    if (!authLoading && user) {
        console.log("User already logged in, redirecting from invite to dashboard");
        router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Only verify if we are not already redirecting a logged-in user
    if (authLoading || user) return;

    async function verifyInvite() {
      const finalId = inviteId || new URLSearchParams(window.location.search).get('id');
      
      if (!finalId) {
        setError('Ugyldig eller manglende invitasjonslenke.');
        setLoading(false);
        return;
      }

      try {
        const inviteDoc = await getDoc(doc(db, 'invitations', finalId));
        
        if (!inviteDoc.exists()) {
          setError('Invitasjonen finnes ikke eller har blitt slettet.');
          setLoading(false);
          return;
        }

        const data = inviteDoc.data() as any;
        
        if (data.status !== 'pending') {
          setError('Denne invitasjonen har allerede blitt brukt.');
          setLoading(false);
          return;
        }

        let expiryDate: Date | null = null;
        if (data.expiresAt) {
            if (data.expiresAt instanceof Timestamp) {
                expiryDate = data.expiresAt.toDate();
            } else if (data.expiresAt.toDate) {
                expiryDate = data.expiresAt.toDate();
            } else if (data.expiresAt instanceof Date) {
                expiryDate = data.expiresAt;
            }
        }

        if (expiryDate && expiryDate < new Date()) {
            setError('Denne invitasjonen er utløpt.');
            setLoading(false);
            return;
        }

        setInvitation({ ...data, id: inviteDoc.id });
      } catch (err: any) {
        console.error("Error verifying invite:", err);
        setError('Det oppstod en feil under verifisering av invitasjonen.');
      } finally {
        setLoading(false);
      }
    }

    verifyInvite();
  }, [inviteId, user, authLoading]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      privacyAccepted: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    if (!invitation) return;

    setIsSubmitting(true);
    try {
      const acceptInvitationCallable = httpsCallable(functions, 'acceptInvitation');
      
      const result = await acceptInvitationCallable({
        inviteId: invitation.id,
        name: invitation.name || 'Bruker', 
        password: values.password
      });

      console.log("Account created successfully via Cloud Function", result.data);

      await signInWithEmailAndPassword(auth, invitation.email, values.password);

      setSuccess(true);
      toast({
        title: "Velkommen!",
        description: "Din konto er nå opprettet.",
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      let message = 'Kunne ikke opprette konto. Prøv igjen senere.';
      
      if (err.message?.includes('already-exists') || err.code === 'functions/already-exists') {
        message = 'Denne e-postadressen er allerede i bruk.';
      } else if (err.message?.includes('invalid-argument')) {
        message = 'Passordet må være minst 6 tegn.';
      }

      toast({
        title: "Feil",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we are redirecting a logged-in user, show the loader
  if (authLoading || (user && !success)) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F8] p-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#1A237E]" />
        </div>
      );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F8] p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#1A237E]" />
          <p className="font-bold text-[#1A237E]/60 uppercase tracking-widest text-xs">Verifiserer invitasjon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F8] p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-red-500 w-full" />
          <CardHeader className="p-8 text-center">
            <div className="mx-auto bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Ugyldig Invitasjon</CardTitle>
            <CardDescription className="text-slate-500 font-medium pt-2">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-8 pt-0">
            <Button asChild variant="outline" className="w-full h-12 rounded-xl font-bold">
              <Link href="/login">Gå til innlogging</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F8] p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden text-center">
            <div className="h-2 bg-emerald-500 w-full" />
            <CardContent className="p-12">
                <div className="mx-auto bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Konto Opprettet!</h2>
                <p className="text-slate-500 font-medium mb-8">Velkommen til VIDERE RettSted. Du blir nå videresendt til ditt dashbord...</p>
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mx-auto" />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      {/* LEFT SIDE - DECORATIVE */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A237E] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400 blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-lg text-white">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl w-fit mb-8">
                <ShieldCheck className="h-10 w-10 text-indigo-300" />
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">
                Fullfør din <span className="text-indigo-300">profil.</span>
            </h1>
            <p className="text-xl text-indigo-100/80 leading-relaxed font-medium">
                Velkommen til {invitation?.orgName || 'organisasjonen'}. Velg et sikkert passord for å komme i gang.
            </p>
            
            <div className="mt-12 space-y-6">
                {[
                    'Sikker tilgang til din bedrifts data',
                    'Personlig dashbord og ruteoversikt',
                    'Sanntidskommunikasjon med teamet'
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="bg-emerald-500/20 p-1 rounded-full">
                            <Check className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="font-bold text-indigo-50">{text}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="p-8 sm:p-12 pb-4">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-[#1A237E] rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Invitasjon mottatt</span>
            </div>
            <CardTitle className="text-4xl font-black text-slate-900 tracking-tight">Velg Passord</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-lg pt-2">
               Konto for <span className="text-[#1A237E] font-bold">{invitation?.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 sm:p-12 pt-0">
            <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Registrert navn</p>
                <p className="text-lg font-black text-slate-700">{invitation?.name || 'Ikke oppgitt'}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Velg Passord</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                <Input type="password" placeholder="••••••••" {...field} className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#1A237E] text-lg font-bold" />
                            </div>
                        </FormControl>
                        <FormMessage className="text-xs font-bold text-red-500" />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gjenta Passord</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                <Input type="password" placeholder="••••••••" {...field} className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#1A237E] text-lg font-bold" />
                            </div>
                        </FormControl>
                        <FormMessage className="text-xs font-bold text-red-500" />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="privacyAccepted"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border p-4 bg-slate-50/50">
                        <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-slate-600">
                            Jeg godtar <Link href="/legal/personvern" target="_blank" className="text-[#1A237E] font-bold hover:underline inline-flex items-center gap-1">personvernerklæringen <ExternalLink className="h-3 w-3" /></Link>
                        </FormLabel>
                        <FormMessage className="text-[10px] font-bold text-red-500" />
                        </div>
                    </FormItem>
                    )}
                />

                <Button 
                    type="submit" 
                    className="w-full h-16 bg-[#1A237E] hover:bg-[#1A237E]/90 text-white font-black rounded-2xl text-xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] mt-4" 
                    disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Aktiverer...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                        <span>Aktiver Konto</span>
                        <ArrowRight className="h-6 w-6" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="p-8 sm:p-12 pt-0 flex justify-center">
            <p className="text-slate-400 text-sm font-medium">
                Har du allerede en konto? <Link href="/login" className="text-[#1A237E] font-black hover:underline ml-1">Logg inn her</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F0F4F8]"><Loader2 className="h-8 w-8 animate-spin text-[#1A237E]" /></div>}>
        <InviteContent />
    </Suspense>
  );
}
