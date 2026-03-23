'use client';

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, deleteDoc } from 'firebase/firestore';
import app, { db } from '@/lib/firebase/firebase';
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
import { Loader2, Mail, UserX, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface InvitationData {
  id: string;
  email: string;
  role: 'admin' | 'driver';
  createdAt: { _seconds: number; _nanoseconds: number };
  expiresAt: { _seconds: number; _nanoseconds: number };
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'driver';
  createdAt: Date;
  expiresAt: Date;
}

const ITEMS_PER_PAGE = 5;

export function PendingInvitations({ orgId }: { orgId: string }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingExpired, setIsDeletingExpired] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const functions = getFunctions(app);
    const getInvitationsCallable = httpsCallable<void, InvitationData[]>(functions, 'getInvitations');

    try {
      const result = await getInvitationsCallable();
      const rawInvitations = result.data;
      
      const parsedInvitations: Invitation[] = rawInvitations.map((inv: InvitationData) => ({
        ...inv,
        createdAt: new Date(inv.createdAt._seconds * 1000),
        expiresAt: new Date(inv.expiresAt._seconds * 1000),
      }));

      parsedInvitations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setInvitations(parsedInvitations);
      // Reset to page 1 on refresh if the current page would be empty
      if (parsedInvitations.length <= (currentPage - 1) * ITEMS_PER_PAGE) {
         setCurrentPage(1);
      }
    } catch (error: any) {
      console.error("Error fetching invitations via function:", error);
      toast({
        title: "Kunne ikke hente invitasjoner",
        description: "Det oppstod en feil under henting av invitasjoner fra serveren.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, toast]);

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await deleteDoc(doc(db, 'invitations', invitationId));
      toast({
        title: "Invitasjon tilbakekalt",
        description: "Invitasjonen har blitt slettet.",
      });
      // Refresh the list after deletion
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Feil ved tilbakekalling",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpired = async () => {
    setIsDeletingExpired(true);
    const now = new Date();
    const expiredInvites = invitations.filter(inv => inv.expiresAt.getTime() - now.getTime() < 0);
    
    try {
      const deletePromises = expiredInvites.map(inv => deleteDoc(doc(db, 'invitations', inv.id)));
      await Promise.all(deletePromises);
      
      toast({
        title: "Utløpte invitasjoner slettet",
        description: `${expiredInvites.length} utløpte invitasjoner ble fjernet.`,
      });
      
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette alle utløpte invitasjoner.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingExpired(false);
    }
  };

  const formatRemainingTime = (expiryDate: Date) => {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff < 0) return { text: "Utløpt", color: "text-destructive" };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return { text: `ca. ${days} dag${days > 1 ? 'er' : ''} igjen`, color: "text-muted-foreground" };
    if (hours > 0) return { text: `ca. ${hours} time${hours > 1 ? 'r' : ''} igjen`, color: "text-amber-600" };
    return { text: "Mindre enn en time igjen", color: "text-amber-600" };
  };

  const hasExpiredInvitations = invitations.some(inv => {
      const diff = inv.expiresAt.getTime() - new Date().getTime();
      return diff < 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(invitations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvitations = invitations.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-xl sm:text-2xl">
            Utestående Invitasjoner
            </CardTitle>
            <div className="flex items-center gap-2">
                {hasExpiredInvitations && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" disabled={isDeletingExpired}>
                                {isDeletingExpired ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                <span className="hidden sm:inline">Slett utløpte</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Slett utløpte invitasjoner?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Dette vil permanent fjerne alle invitasjoner som har passert utløpsdatoen.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Avbryt</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={handleDeleteExpired}
                            >
                                Ja, slett utløpte
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                <Button variant="outline" size="sm" onClick={fetchInvitations} disabled={isLoading}>
                    Oppdater
                </Button>
            </div>
        </div>
        <CardDescription>
          Her er invitasjonene som er sendt ut, men ikke er blitt brukt enda. De utløper etter 7 dager.
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
                      {currentInvitations.map((invite) => {
                          const expiry = formatRemainingTime(invite.expiresAt);
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
                {currentInvitations.map((invite) => {
                   const expiry = formatRemainingTime(invite.expiresAt);
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
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                     <span className="text-sm text-muted-foreground">
                        Viser {startIndex + 1}-{Math.min(endIndex, invitations.length)} av {invitations.length}
                     </span>
                     <div className="flex gap-2">
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                         >
                            <ChevronLeft className="h-4 w-4" />
                         </Button>
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                         >
                            <ChevronRight className="h-4 w-4" />
                         </Button>
                     </div>
                  </div>
              )}

             </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}