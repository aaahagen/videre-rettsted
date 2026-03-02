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
import { UserPlus, Loader2, Copy, Check, MoreVertical, Shield, ShieldAlert, UserX, Pause, Play, Mail, User as UserIcon, Edit2 } from 'lucide-react';
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
import { db } from '@/lib/firebase/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export default function AdminDashboardContent({ authUser }: { authUser: FirebaseUser }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'driver' | 'admin'>('driver');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
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
  }, [authUser, toast]);

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
      const link = await firebaseAuth.inviteUser(email, role, name);
      setInviteLink(link);
      toast({
        title: 'Invitasjon opprettet',
        description: `En invitasjonslenke er generert for ${email}.`,
      });
      setEmail('');
      setName('');
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

  const handleUpdateName = async () => {
    if (!editingUser || !newName.trim()) return;
    
    try {
      await updateDoc(doc(db, 'users', editingUser.id), { name: newName.trim() });
      toast({
        title: "Navn oppdatert",
        description: `Brukerens navn er nå ${newName.trim()}.`,
      });
      setEditingUser(null);
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

  const handleNameChange = (e: any) => {
    const value = e.target ? e.target.value : e;
    setName(value);
  };

  return (
    <div className="p-2 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
      <div className="space-y-6 sm:space-y-8">
        <Card className="border-none shadow-none sm:border sm:shadow-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-headline text-2xl sm:text-3xl">
              Adminpanel
            </CardTitle>
            <CardDescription className="text-base">
              Administrer din organisasjon og brukere.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-headline text-xl sm:text-2xl">
              Opprett Ny Bruker
            </CardTitle>
            <CardDescription>
              Legg til en ny sjåfør eller administrator. De vil motta en invitasjon.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleInviteUser} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="name">Navn (valgfritt)</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ola Nordmann"
                    value={name}
                    onChange={handleNameChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="bruker@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <Select
                  value={role}
                  onValueChange={(value: 'driver' | 'admin') => setRole(value)}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Velg en rolle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Sjåfør</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-8" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Genererer...
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
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-headline text-xl sm:text-2xl">
              Administrer Brukere
            </CardTitle>
            <CardDescription>Se og administrer nåværende brukere.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 pb-0">
            {isLoadingUsers ? (
               <div className="flex justify-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop View Table */}
                <div className="hidden md:block">
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
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                              <UserActionsDropdown 
                                user={user} 
                                handleUpdateRole={handleUpdateRole} 
                                handleToggleStatus={handleToggleStatus} 
                                handleDeleteUser={handleDeleteUser} 
                                onEditName={() => {
                                  setEditingUser(user);
                                  setNewName(user.name || '');
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden divide-y">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Ingen brukere funnet.
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-bold text-lg">{user.name || 'Ikke fullført'}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="mr-2 h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                          <UserActionsDropdown 
                            user={user} 
                            handleUpdateRole={handleUpdateRole} 
                            handleToggleStatus={handleToggleStatus} 
                            handleDeleteUser={handleDeleteUser} 
                            onEditName={() => {
                              setEditingUser(user);
                              setNewName(user.name || '');
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className={user.role === 'admin' ? 'bg-primary' : ''}
                          >
                            {user.role === 'admin' ? 'Admin' : 'Sjåfør'}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={user.status === 'paused' 
                              ? "text-amber-600 border-amber-400" 
                              : "text-green-600 border-green-400"}
                          >
                            {user.status === 'paused' ? 'Pauset' : 'Aktiv'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Name Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
            <DialogHeader>
              <DialogTitle>Endre Navn</DialogTitle>
              <DialogDescription>
                Oppdater navnet til {editingUser?.email}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newName">Fullt Navn</Label>
                <Input
                  id="newName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ola Nordmann"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Avbryt</Button>
              </DialogClose>
              <Button onClick={handleUpdateName}>Lagre endringer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!inviteLink} onOpenChange={(open) => !open && setInviteLink(null)}>
          <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
            <DialogHeader>
              <DialogTitle>Invitasjonslenke Klar</DialogTitle>
              <DialogDescription>
                Del denne lenken med den nye brukeren.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
              <div className="grid flex-1 gap-2 w-full">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={inviteLink || ''}
                  readOnly
                  className="h-10 text-sm"
                />
              </div>
              <Button size="sm" onClick={copyToClipboard} className="px-4 w-full sm:w-auto h-10">
                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {isCopied ? 'Kopiert' : 'Kopier'}
              </Button>
            </div>
            <DialogFooter className="sm:justify-start mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
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

function UserActionsDropdown({ user, handleUpdateRole, handleToggleStatus, handleDeleteUser, onEditName }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-100 rounded-full">
          <MoreVertical className="h-5 w-5" />
          <span className="sr-only">Meny</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEditName}>
          <Edit2 className="mr-2 h-4 w-4" />
          Endre Navn
        </DropdownMenuItem>
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
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => handleDeleteUser(user.id)}
        >
          <UserX className="mr-2 h-4 w-4" />
          Slett Bruker
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
