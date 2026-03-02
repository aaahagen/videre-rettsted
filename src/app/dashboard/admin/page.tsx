'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Loader2, Copy, Check, MoreVertical, Shield, ShieldAlert, UserX, Pause, Play } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { firebaseAuth } from '@/lib/firebase/auth';
import { firebaseDB } from '@/lib/firebase/database';
import { User } from '@/lib/types';
import { onSnapshot, collection, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function AdminPage() {
  const [authUser, loadingAuth] = useAuthState(auth);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'driver' | 'admin'>('driver');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (loadingAuth || !authUser) return;

    let unsubscribe: () => void;

    const setupRealtimeUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const userDoc = await firebaseDB.getUser(authUser.uid);
        if (userDoc && userDoc.orgId) {
          const q = query(
            collection(db, 'users'),
            where('orgId', '==', userDoc.orgId)
          );
          
          unsubscribe = onSnapshot(q, (snapshot) => {
            const orgUsers = snapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            } as User));
            // Sort by name A-Z
            orgUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setUsers(orgUsers);
            setIsLoadingUsers(false);
          }, (error) => {
            console.error("Realtime fetch error:", error);
            setIsLoadingUsers(false);
            toast({
              title: "Kunne ikke hente brukere",
              description: "Du har kanskje ikke tilgang eller det oppstod en feil.",
              variant: "destructive"
            });
          });
        } else {
            console.warn("User has no orgId or doc not found", authUser.uid);
            setIsLoadingUsers(false);
        }
      } catch (error) {
        console.error("Error setting up users listener:", error);
        setIsLoadingUsers(false);
      }
    };

    setupRealtimeUsers();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authUser, loadingAuth, toast]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) {
      toast({
        title: 'Feil',
        description: 'Vennligst fyll ut alle feltene.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const link = await firebaseAuth.inviteUser(email, role);
      setInviteLink(link);
      toast({
        title: 'Invitasjon opprettet',
        description: `En invitasjonslenke er generert for ${email}.`,
      });
      setEmail('');
      setRole('driver');
    } catch (error: any) {
      console.error('Kunne ikke invitere bruker:', error);
      toast({
        title: 'Invitasjon Mislyktes',
        description: error.message || 'En uventet feil oppstod.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
          title: "Kopiert!",
          description: "Invitasjonslenken er kopiert til utklippstavlen.",
        });
      } catch (err) {
         console.error("Clipboard API failed, fallback to select", err);
         const input = document.getElementById('link') as HTMLInputElement;
         if(input) {
            input.select();
            input.setSelectionRange(0, 99999); 
            document.execCommand("copy");
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            toast({
                title: "Kopiert!",
                description: "Invitasjonslenken er kopiert til utklippstavlen.",
            });
         }
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'driver') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({
        title: "Rolle oppdatert",
        description: `Brukerens rolle er nå ${newRole === 'admin' ? 'Admin' : 'Sjåfør'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Feil ved oppdatering",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne brukeren?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({
        title: "Bruker slettet",
        description: "Brukeren har blitt fjernet fra organisasjonen.",
      });
    } catch (error: any) {
      toast({
        title: "Feil ved sletting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'paused' ? 'active' : 'paused';
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      toast({
        title: newStatus === 'paused' ? "Bruker satt på pause" : "Bruker aktivert",
        description: `Brukeren er nå ${newStatus === 'paused' ? 'deaktivert' : 'aktiv'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Feil ved statusendring",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEmailChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setEmail(value);
  };

  if (!isMounted || loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Adminpanel
            </CardTitle>
            <CardDescription>
              Administrer din organisasjon og brukere.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Opprett Ny Bruker
            </CardTitle>
            <CardDescription>
              Legg til en ny sjåfør eller administrator i organisasjonen din. De vil motta en invitasjon for å sette opp kontoen sin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteUser} className="max-w-lg space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="bruker@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <Select
                  value={role}
                  onValueChange={(value: 'driver' | 'admin') => setRole(value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Velg en rolle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Sjåfør</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Genererer Lenke...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Generer Invitasjonslenke
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Administrer Brukere
            </CardTitle>
            <CardDescription>Se og administrer nåværende brukere i din organisasjon.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
               <div className="flex justify-center py-4">
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
               </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Navn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Ingen brukere funnet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || 'Ikke fullført'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={user.role === 'admin' ? 'bg-primary' : ''}
                          >
                            {user.role === 'admin' ? 'Admin' : 'Sjåfør'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={user.status === 'paused' 
                              ? "text-amber-600 border-amber-400" 
                              : "text-green-600 border-green-400"}
                          >
                            {user.status === 'paused' ? 'Pauset' : 'Aktiv'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {user.role === 'admin' ? (
                                <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'driver')}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Gjør til Sjåfør
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')}>
                                  <ShieldAlert className="mr-2 h-4 w-4" />
                                  Gjør til Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                                {user.status === 'paused' ? (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Aktiver
                                  </>
                                ) : (
                                  <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Sett på pause
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Slett Bruker
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!inviteLink} onOpenChange={(open) => !open && setInviteLink(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitasjonslenke Klar</DialogTitle>
              <DialogDescription>
                Del denne lenken med den nye brukeren. Lenken er gyldig i 7 dager.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 mt-4">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={inviteLink || ''}
                  readOnly
                  className="h-9"
                />
              </div>
              <Button size="sm" onClick={copyToClipboard} className="px-3">
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Lukk
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
