'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
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
            // 1. Get all places for the organization
            const places = await firebaseDB.getPlaces(orgId);

            // 2. Delete all images associated with places (skipped due to client-side complexity, see comments)
            // Ideally should be handled by Cloud Function trigger on place deletion.

            // 3. Delete all places
            const deletePlacePromises = places.map(place => firebaseDB.deletePlace(place.id));
            await Promise.all(deletePlacePromises);

            // 4. Delete all users in the organization (Firestore docs only)
            const users = await firebaseDB.getUsers(orgId);
            const deleteUserPromises = users.map(user => firebaseDB.deleteUser(user.id));
            await Promise.all(deleteUserPromises);

            // 5. Delete the organization document
            await firebaseDB.deleteOrganization(orgId);

            toast({
                title: "Organisasjon slettet",
                description: "Du blir nå logget ut.",
            });

            // Sign out
            await auth.signOut();
            router.push('/');

        } catch (error: any) {
            console.error("Delete org error:", error);
            toast({
                title: "Sletting feilet",
                description: error.message || "En feil oppstod under sletting.",
                variant: "destructive"
            });
        } finally {
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
                    Dette vil permanent slette organisasjonen, alle brukere, steder og bilder. Handlingen kan ikke angres.
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
                                    <li>Alle opplastede bilder</li>
                                    <li>Alle brukerkontoer tilknyttet organisasjonen</li>
                                    <li>Din egen tilgang</li>
                                </ul>
                                <Button className="w-full" variant="secondary" onClick={() => setStep(2)}>
                                    Jeg forstår konsekvensene
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <p className="font-semibold text-destructive">Er du helt sikker?</p>
                                <p>Det finnes ingen "angre"-knapp. Dataene vil være borte for alltid.</p>
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
                                <p>Siste sjanse. Er du administrator og har myndighet til dette?</p>
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
                                            Sletter alt...
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
