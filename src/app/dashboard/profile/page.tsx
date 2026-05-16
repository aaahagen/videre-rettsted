'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    User, 
    Mail, 
    Shield, 
    Lock, 
    Smartphone, 
    CheckCircle2, 
    AlertTriangle,
    Camera,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase/firebase';
import { 
    multiFactor, 
    PhoneAuthProvider, 
    PhoneMultiFactorGenerator, 
    RecaptchaVerifier
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { dbUser, user: authUser, loading } = useAuth();
  const { toast } = useToast();
  
  const [phoneNumber, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const mfaUser = authUser ? multiFactor(authUser) : null;
  const isMfaEnabled = (mfaUser?.enrolledFactors?.length || 0) > 0;

  useEffect(() => {
    if (authUser && !recaptchaVerifier) {
        try {
            const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            });
            setRecaptchaVerifier(verifier);
        } catch (error) {
            console.error("Recaptcha Init Error:", error);
        }
    }
    
    return () => {
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
        }
    };
  }, [authUser, recaptchaVerifier]);

  const handleStartEnrollment = async () => {
    if (!phoneNumber || !recaptchaVerifier || !authUser || !mfaUser) return;
    
    setIsEnrolling(true);
    try {
        const session = await mfaUser.getSession();
        
        // Ensure E.164 format. If it doesn't start with +, assume +47
        let formattedPhone = phoneNumber.trim().replace(/\s/g, '');
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+47${formattedPhone}`;
        }

        const phoneInfoOptions = {
            phoneNumber: formattedPhone,
            session: session
        };
        const provider = new PhoneAuthProvider(auth);
        const id = await provider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
        setVerificationId(id);
        toast({ title: "Kode sendt", description: `En verifiseringskode er sendt til ${formattedPhone}.` });
    } catch (error: any) {
        console.error("MFA Enrollment Error:", error);
        toast({ title: "Feil", description: error.message || "Kunne ikke sende verifiseringskode.", variant: "destructive" });
    } finally {
        setIsEnrolling(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !verificationId || !authUser || !mfaUser) return;
    
    setIsVerifying(true);
    try {
        const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
        await mfaUser.enroll(multiFactorAssertion, "Min Mobil");
        
        setVerificationId(null);
        setVerificationCode('');
        toast({ title: "MFA Aktivert", description: "To-faktor autentisering er nå aktiv på din konto." });
    } catch (error: any) {
        console.error("MFA Verification Error:", error);
        toast({ title: "Feil", description: "Ugyldig kode eller sesjon utløpt. Vennligst prøv igjen.", variant: "destructive" });
    } finally {
        setIsVerifying(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!mfaUser || !confirm("Er du sikker på at du vil deaktivere to-faktor autentisering?")) return;
    
    try {
        const factor = mfaUser.enrolledFactors[0];
        await mfaUser.unenroll(factor);
        toast({ title: "MFA Deaktivert", description: "To-faktor autentisering er fjernet fra din konto." });
    } catch (error: any) {
        toast({ title: "Feil", description: error.message, variant: "destructive" });
    }
  };

  if (loading || !dbUser) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Invisible container for Firebase ReCAPTCHA */}
      <div id="recaptcha-container"></div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                <AvatarImage src={dbUser.avatarUrl || ''} className="object-cover" />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-bold">
                    {dbUser.name?.charAt(0) || 'U'}
                </AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" asChild className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-lg">
                <Link href="/dashboard/profile/picture"><Camera className="h-4 w-4" /></Link>
            </Button>
        </div>
        <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{dbUser.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    {dbUser.role}
                </Badge>
                <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {dbUser.email}
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
            <Button variant="secondary" className="w-full justify-start font-bold h-12 bg-white border shadow-sm">
                <User className="mr-2 h-4 w-4 text-indigo-500" /> Profilinformasjon
            </Button>
            <Button variant="ghost" className="w-full justify-start font-bold h-12 text-slate-500 hover:text-indigo-600" asChild>
                <Link href="/dashboard/profile/picture">
                    <Camera className="mr-2 h-4 w-4" /> Endre profilbilde
                </Link>
            </Button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Sikkerhet & Innlogging
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        Administrer hvordan du logger inn og sikre din konto.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* MFA SECTION */}
                    <div className="p-6 rounded-2xl border-2 border-slate-50 bg-slate-50/30">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={isMfaEnabled ? "p-2 bg-emerald-100 rounded-xl" : "p-2 bg-slate-100 rounded-xl"}>
                                    <Smartphone className={isMfaEnabled ? "h-6 w-6 text-emerald-600" : "h-6 w-6 text-slate-400"} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">To-faktor autentisering (MFA)</h4>
                                    <p className="text-xs text-slate-500 font-medium">Legg til et ekstra lag med sikkerhet via SMS.</p>
                                </div>
                            </div>
                            <Badge className={isMfaEnabled ? "bg-emerald-500" : "bg-slate-200 text-slate-500"}>
                                {isMfaEnabled ? "Aktiv" : "Inaktiv"}
                            </Badge>
                        </div>

                        {!isMfaEnabled ? (
                            <div className="space-y-4 pt-2">
                                {!verificationId ? (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+47</span>
                                            <Input 
                                                placeholder="Mobilnummer" 
                                                className="pl-12 h-11 bg-white" 
                                                value={phoneNumber}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleStartEnrollment} 
                                            disabled={isEnrolling || !phoneNumber}
                                            className="h-11 bg-indigo-600 hover:bg-indigo-700 font-bold px-6"
                                        >
                                            {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Send Kode
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-2 animate-in slide-in-from-right-4 duration-300">
                                        <Input 
                                            placeholder="6-sifret kode" 
                                            className="h-11 bg-white flex-1" 
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                        />
                                        <Button 
                                            onClick={handleVerifyCode} 
                                            disabled={isVerifying || !verificationCode}
                                            className="h-11 bg-emerald-600 hover:bg-emerald-700 font-bold px-6"
                                        >
                                            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Bekreft & Aktiver
                                        </Button>
                                        <Button variant="ghost" onClick={() => setVerificationId(null)} className="h-11 font-bold text-slate-400">Avbryt</Button>
                                    </div>
                                )}
                                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                    Ved å aktivere MFA vil du bli bedt om å oppgi en engangskode sendt via SMS hver gang du logger inn fra en ny enhet. Standard SMS-takster kan påløpe.
                                </p>
                            </div>
                        ) : (
                            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                    <p className="text-xs text-emerald-800 font-bold">Din konto er beskyttet med SMS-verifisering.</p>
                                </div>
                                <Button variant="outline" onClick={handleDisableMfa} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 font-bold h-11 px-6">
                                    Deaktiver MFA
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 rounded-2xl border-2 border-slate-50 bg-slate-50/30 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-xl">
                                <Lock className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Passord</h4>
                                <p className="text-xs text-slate-500 font-medium">Administrer passordet ditt.</p>
                            </div>
                        </div>
                        <Button variant="outline" className="font-bold h-10 px-4" asChild>
                            <Link href="/forgot-password">Glemte Passord?</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/50">
                <CardHeader>
                    <CardTitle className="text-xl font-black">Personlige Detaljer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Fullt Navn</Label>
                            <Input value={dbUser.name} disabled className="bg-slate-50 border-none font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">E-postadresse</Label>
                            <Input value={dbUser.email} disabled className="bg-slate-50 border-none font-bold" />
                        </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                            Noen profilfelter er låst og kan kun endres av en administrator in din organisasjon. Kontakt din leder hvis informasjonen er feil.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
