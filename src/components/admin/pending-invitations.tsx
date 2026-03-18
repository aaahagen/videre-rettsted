'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Mail, Calendar, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'driver';
  createdAt: {
    toDate: () => Date;
  };
  expiresAt: {
    toDate: () => Date;
  };
}

export function PendingInvitations({ orgId }: { orgId: string }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!orgId) {
        setIsLoading(false);
        return;
    };

    const q = query(
      collection(db, 'invitations'),
      where('orgId', '==', orgId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingInvites = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Invitation));
      pendingInvites.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
      setInvitations(pendingInvites);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Kunne ikke hente invitasjoner",
        description: "Det oppstod en feil under henting av invitasjoner.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [orgId, toast]);

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await deleteDoc(doc(db, 'invitations', invitationId));
      toast({
        title: "Invitasjon tilbakekalt",
        description: "Invitasjonen har blitt slettet.",
      });
    } catch (error: any) {
      toast({
        title: "Feil ved tilbakekalling",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatRemainingTime = (expiryDate: Date) => {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff < 0) return { text: "Utløpt", color: "text-destructive" };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return { text: `ca. ${days} dag${days > 1 ? 'er' : ''}`, color: "text-muted-foreground" };
    if (hours > 0) return { text: `ca. ${hours} time${hours > 1 ? 'r' : ''}`, color: "text-amber-600" };
    return { text: "Mindre enn en time", color: "text-amber-600" };
  };

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="font-headline text-xl sm:text-2xl">
          Utestående Invitasjoner
        </CardTitle>
        <CardDescription>
          Her er invitasjonene som er sendt ut, men ikke er blitt brukt enda. De utløper etter 72 timer.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 pb-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {invitations.length === 0 ? (
                <div className="text-center py-10 px-6">
                    <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Ingen ventende invitasjoner</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Når du inviterer en ny bruker, vil den dukke opp her.
                    </p>
                </div>
            ) : (
             <>
              {/* Desktop View */}
              <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>E-post</TableHead>
                        <TableHead>Rolle</TableHead>
                        <TableHead>Gjenstående tid</TableHead>
                        <TableHead className="w-[100px] text-right">Handling</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invite) => {
                          const expiry = formatRemainingTime(invite.expiresAt.toDate());
                          return (
                            <TableRow key={invite.id}>
                              <TableCell className="font-medium">{invite.email}</TableCell>
                              <TableCell>
                                  <Badge variant={invite.role === 'admin' ? 'default' : 'secondary'} className={invite.role === 'admin' ? 'bg-primary' : ''}>
                                      {invite.role === 'admin' ? 'Admin' : 'Sjåfør'}
                                  </Badge>
                              </TableCell>
                              <TableCell className={expiry.color}>
                                  {expiry.text}
                              </TableCell>
                              <TableCell className="text-right">
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                          <UserX className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Handlingen kan ikke angres. Dette vil permanent slette invitasjonen for <span className="font-medium">{invite.email}</span>, og lenken deres vil bli ugyldig.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive hover:bg-destructive/90"
                                          onClick={() => handleRevokeInvitation(invite.id)}
                                        >
                                          Ja, trekk tilbake
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                              </TableCell>
                            </TableRow>
                          );
                      })}
                    </TableBody>
                  </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y">
                {invitations.map((invite) => {
                   const expiry = formatRemainingTime(invite.expiresAt.toDate());
                   return (
                      <div key={invite.id} className="p-4 flex justify-between items-center">
                          <div className="space-y-2">
                              <p className="font-bold">{invite.email}</p>
                              <div className="flex items-center gap-2">
                                  <Badge variant={invite.role === 'admin' ? 'default' : 'secondary'} className={invite.role === 'admin' ? 'bg-primary' : ''}>
                                      {invite.role === 'admin' ? 'Admin' : 'Sjåfør'}
                                  </Badge>
                                  <span className={`text-xs ${expiry.color}`}>
                                      {expiry.text}
                                  </span>
                              </div>
                          </div>
                          
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <UserX className="h-5 w-5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Handlingen kan ikke angres. Dette vil permanent slette invitasjonen for <span className="font-medium">{invite.email}</span>, og lenken deres vil bli ugyldig.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleRevokeInvitation(invite.id)}
                                  >
                                    Ja, trekk tilbake
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                      </div>
                   )
                })}
              </div>
             </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
