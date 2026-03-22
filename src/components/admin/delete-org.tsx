'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import app, { auth } from '@/lib/firebase/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteOrganizationProps {
    orgId: string;
}

export function DeleteOrganization({ orgId }: DeleteOrganizationProps) {
    const [step, setStep] = useState(0);
    const [confirmationText, setConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [authUser] = useAuthState(auth);
    const router = useRouter();
    const { toast } = useToast();

    const requiredText = "Jeg vil for alltid slette hele organisasjonen. Dette kan ikke gjøres om. Jeg er ansvarlig for sletting.";

    const handleDelete = async () => {
        if (confirmationText !== requiredText) {
            toast({
                title: "Feil bekreftelse",
                description: "Vennligst skriv setningen nøyaktig som vist.",
                variant: "destructive"
            });
            return;
        }

        setIsDeleting(true);
        try {
            const functions = getFunctions(app);
            const deleteOrgCallable = httpsCallable(functions, 'deleteOrganization');

            await deleteOrgCallable();

            toast({
                title: "Organisasjon slettet",
                description: "Du blir nå logget ut.",
            });

            // The user's Auth account has been deleted by the cloud function,
            // but we still call signOut to clear the client state cleanly.
            await auth.signOut();
            router.push('/');

        } catch (error: any) {
            console.error("Delete org error:", error);
            toast({
                title: "Sletting feilet",
                description: error.message || "En feil oppstod under sletting av organisasjonen.",
                variant: "destructive"
            });
            setIsDeleting(false);
        }
    };

    const reset = () => {
        setStep(0);
        setConfirmationText('');
    };

    return (
        <Card className="border-destructive/50 bg-destructive/5 mt-8">
            <CardHeader className="px-4 sm:px-6">
                <CardTitle className="font-headline text-xl sm:text-2xl text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Faresone: Slett Organisasjon
                </CardTitle>
                <CardDescription className="text-destructive/80">
                    Dette vil permanent slette organisasjonen, alle brukere (inkludert din innlogging), steder, ruter og bilder. Handlingen kan ikke angres.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
                <Dialog open={step > 0} onOpenChange={(open) => !open && reset()}>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto" onClick={() => setStep(1)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Slett Organisasjon
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Er du sikker?</DialogTitle>
                            <DialogDescription>
                                Denne handlingen er irreversible.
                            </DialogDescription>
                        </DialogHeader>

                        {step === 1 && (
                            <div className="space-y-4">
                                <p>Du er i ferd med å slette <strong>hele organisasjonen</strong>. Dette vil slette:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    <li>Alle steder og lokasjoner</li>
                                    <li>Alle ruter og lister</li>
                                    <li>Alle opplastede bilder i skyen</li>
                                    <li>Alle brukerkontoer (inkludert innloggingsinformasjon)</li>
                                    <li>Din egen administratortilgang</li>
                                </ul>
                                <Button className="w-full" variant="secondary" onClick={() => setStep(2)}>
                                    Jeg forstår konsekvensene
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <p className="font-semibold text-destructive">Er du helt sikker?</p>
                                <p>Det finnes ingen "angre"-knapp. Både data og innlogginger vil være borte for alltid.</p>
                                <div className="flex gap-2">
                                    <Button className="w-full" variant="outline" onClick={reset}>Avbryt</Button>
                                    <Button className="w-full" variant="destructive" onClick={() => setStep(3)}>
                                        Gå videre
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <p>Siste sjanse. Er du administrator og har myndighet til å utføre denne slettingen?</p>
                                <div className="flex gap-2">
                                    <Button className="w-full" variant="outline" onClick={reset}>Nei, avbryt</Button>
                                    <Button className="w-full" variant="destructive" onClick={() => setStep(4)}>
                                        Ja, jeg er ansvarlig
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <Label className="text-destructive font-bold">
                                    Skriv nøyaktig følgende setning for å bekrefte:
                                </Label>
                                <div className="p-3 bg-slate-100 rounded text-sm font-mono select-all">
                                    {requiredText}
                                </div>
                                <Input 
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    placeholder="Skriv setningen her..."
                                    className="border-destructive/30 focus-visible:ring-destructive"
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        toast({
                                            title: "Ingen klipp og lim",
                                            description: "Du må skrive setningen manuelt.",
                                            variant: "destructive"
                                        });
                                    }}
                                />
                                <Button 
                                    className="w-full" 
                                    variant="destructive" 
                                    onClick={handleDelete}
                                    disabled={confirmationText !== requiredText || isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sletter alt (dette kan ta tid)...
                                        </>
                                    ) : (
                                        "SLETT ALT NÅ"
                                    )}
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
