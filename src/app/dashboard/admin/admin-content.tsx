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
import { UserPlus, Loader2, Copy, Check, MoreVertical, Shield, ShieldAlert, UserX, Pause, Play, Mail, User as UserIcon, Edit2, Settings, IdCard, Search, Building2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { User, Organization } from '@/lib/types';
import { onSnapshot, collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { DataExport } from '@/components/admin/data-export';
import { DataImport } from '@/components/admin/data-import';
import { DeleteOrganization } from '@/components/admin/delete-org';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { PendingInvitations } from '@/components/admin/pending-invitations';
import { DriverProfileForm } from '@/components/workforce/driver-profile-form';
import { DriverProfile } from '@/lib/types';

function UserActionsDropdown({ user, handleUpdateRole, handleToggleStatus, handleDeleteUser, onEditName }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Endre
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={onEditName}>
          <Edit2 className="mr-2 h-4 w-4" />
          Endre Navn
        </DropdownMenuItem>
        {user.role === 'admin' ? (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'driver')}>
            <Shield className="mr-2 h-4 w-4" />
            Gjør til Fast Sjåfør
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')}>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Gjør til Admin
          </DropdownMenuItem>
        )}
        {user.role !== 'contractor' && (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'contractor')}>
             <UserIcon className="mr-2 h-4 w-4" />
             Gjør til Innleid (Ekstern)
          </DropdownMenuItem>
        )}
        {user.role === 'contractor' && (
          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'driver')}>
             <Shield className="mr-2 h-4 w-4" />
             Gjør til Fast Sjåfør
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

const ITEMS_PER_PAGE = 5;

export default function AdminDashboardContent({ authUser }: { authUser: FirebaseUser }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'driver' | 'admin' | 'contractor'>('driver');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Organization Settings State
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgSettings, setOrgSettings] = useState({
    name: '',
    orgNumber: '',
    descEnabled: true,
    descLabel: '',
    descPlaceholder: '',
    notesEnabled: true,
    notesLabel: '',
    notesPlaceholder: '',
    field3Enabled: false,
    field3Label: '',
    field3Placeholder: '', 
    depotAddress: '',
    depotLat: '',
    depotLng: '',
    depotRadius: 500
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupRealtimeUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const userDoc = await firebaseDB.getUser(authUser.uid);
        if (userDoc && userDoc.orgId) {
          // Fetch Organization Details
          const org = await firebaseDB.getOrganization(userDoc.orgId);
          setOrganization(org);
          if (org) {
            setOrgSettings({
              name: org.name || '',
              orgNumber: org.orgNumber || '',
              descEnabled: org.fieldSettings?.description?.enabled ?? true,
              descLabel: org.fieldSettings?.description?.label || '',
              descPlaceholder: org.fieldSettings?.description?.placeholder || '',
              notesEnabled: org.fieldSettings?.notes?.enabled ?? true,
              notesLabel: org.fieldSettings?.notes?.label || '',
              notesPlaceholder: org.fieldSettings?.notes?.placeholder || '',
              field3Enabled: org.fieldSettings?.field3?.enabled ?? false,
              field3Label: org.fieldSettings?.field3?.label || '',
              field3Placeholder: org.fieldSettings?.field3?.placeholder || '', 
              depotAddress: org.mainDepot?.address || '',
              depotLat: org.mainDepot?.coordinates?.lat?.toString() || '',
              depotLng: org.mainDepot?.coordinates?.lng?.toString() || '',
              depotRadius: org.mainDepot?.radius || 500
            });
          }

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
            setFilteredUsers(orgUsers);
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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const queryText = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        (user.name?.toLowerCase().includes(queryText) || '') ||
        (user.email?.toLowerCase().includes(queryText) || '')
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset to page 1 on search
  }, [searchQuery, users]);

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
      setTimeout(() => { document.body.style.pointerEvents = ''; }, 300);
    } catch (error: any) {
      toast({
        title: "Feil ved oppdatering",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne brukeren? Handlingen kan ikke angres.')) return;
    
    try {
      await firebaseAuth.deleteUser(userId);
      toast({
        title: "Bruker Slettet",
        description: "Brukeren er permanent fjernet fra systemet.",
      });
    } catch (error: any) {
      console.error('Error deleting user from admin panel:', error);
      toast({
        title: "Sletting Mislyktes",
        description: error.message || "En feil oppstod under sletting av brukeren.",
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setIsSavingSettings(true);
    try {
      await firebaseDB.updateOrganization(organization.id, {
        name: orgSettings.name,
        orgNumber: orgSettings.orgNumber,
        mainDepot: {
          address: orgSettings.depotAddress,
          coordinates: { lat: parseFloat(orgSettings.depotLat) || 0, lng: parseFloat(orgSettings.depotLng) || 0 },
          radius: orgSettings.depotRadius
        },
        fieldSettings: {
          description: { enabled: orgSettings.descEnabled, label: orgSettings.descLabel, placeholder: orgSettings.descPlaceholder },
          notes: { enabled: orgSettings.notesEnabled, label: orgSettings.notesLabel, placeholder: orgSettings.notesPlaceholder },
          field3: { enabled: orgSettings.field3Enabled, label: orgSettings.field3Label, placeholder: orgSettings.field3Placeholder }
        }
      });
      toast({
        title: "Innstillinger lagret",
        description: "Organisasjonsinnstillinger er oppdatert.",
      });
    } catch (error: any) {
      toast({
        title: "Feil ved lagring",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
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

  const formatLegalDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'Ukjent dato';
    return timestamp.toDate().toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden w-full">
      <div className="space-y-6 sm:space-y-8">
        
        <h1 className="text-3xl font-bold font-headline px-1">Adminpanel</h1>

        

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-headline text-xl sm:text-2xl">
              Opprett Ny Bruker
            </CardTitle>
            <CardDescription>
              Bruk fiktive e-poster. Dette er for sikkerhet. Ingen personlige e-poster eller fulle navn. Dersom en bruker mister påloggingsinformasjon kan du opprette en ny.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleInviteUser} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="name">Navn eller internnummer</Label>
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
                  onValueChange={(value: 'driver' | 'admin' | 'contractor') => setRole(value as any)}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Velg en rolle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Fast Sjåfør</SelectItem>
                    <SelectItem value="contractor">Innleid (Ekstern)</SelectItem>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-xl sm:text-2xl">
                  Administrer Brukere
                </CardTitle>
                <CardDescription>Se og administrer nåværende brukere.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søk etter navn eller e-post..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
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
                      {currentUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {searchQuery ? 'Ingen brukere funnet.' : 'Ingen brukere i organisasjonen.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || 'Ikke fullført'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={user.role === 'admin' ? 'default' : user.role === 'contractor' ? 'outline' : 'secondary'}
                                className={user.role === 'admin' ? 'bg-primary' : user.role === 'contractor' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                              >
                                {user.role === 'admin' ? 'Admin' : user.role === 'contractor' ? 'Innleid' : 'Fast Sjåfør'}
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
                  {currentUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {searchQuery ? 'Ingen brukere funnet.' : 'Ingen brukere i organisasjonen.'}
                    </div>
                  ) : (
                    currentUsers.map((user) => (
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
                            variant={user.role === 'admin' ? 'default' : user.role === 'contractor' ? 'outline' : 'secondary'}
                            className={user.role === 'admin' ? 'bg-primary' : user.role === 'contractor' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                          >
                            {user.role === 'admin' ? 'Admin' : user.role === 'contractor' ? 'Innleid' : 'Fast Sjåfør'}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <span className="text-sm text-muted-foreground">
                        Viser {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} av {filteredUsers.length}
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
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-headline text-xl sm:text-2xl">
              Organisasjonsinnstillinger
            </CardTitle>
            <CardDescription>
              Tilpass organisasjonsnavn, etiketter og plassholdere for stedsskjemaet. Du kan også velge hvilke felt som skal vises for sjåførene.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSaveSettings} className="space-y-8 max-w-3xl">
              
              <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Generelt</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organisasjonsnavn</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="orgName"
                          placeholder="Ditt firmanavn"
                          value={orgSettings.name}
                          onChange={(e) => setOrgSettings(s => ({ ...s, name: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgNumber">Organisasjonsnummer</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="orgNumber"
                          placeholder="F.eks. 987654321"
                          value={orgSettings.orgNumber}
                          onChange={(e) => setOrgSettings(s => ({ ...s, orgNumber: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
              </div>

              <div className="space-y-4">
                 <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">Tilpass Skjema for "Nytt Sted"</h3>
                 <div className="grid gap-8 md:grid-cols-3">
                    
                    {/* Felt 1 */}
                    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <Label className="text-base font-semibold">Felt 1</Label>
                         <Switch 
                            checked={orgSettings.descEnabled} 
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, descEnabled: checked }))} 
                         />
                      </div>
                      <div className={`space-y-4 ${!orgSettings.descEnabled && 'opacity-50 pointer-events-none'}`}>
                        <div className="space-y-2">
                          <Label htmlFor="descLabel" className="text-xs">Etikett (Label)</Label>
                          <Input
                            id="descLabel"
                            placeholder="F.eks. Beskrivelse"
                            value={orgSettings.descLabel}
                            onChange={(e) => setOrgSettings(s => ({ ...s, descLabel: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="descPlaceholder" className="text-xs">Plassholder</Label>
                          <Input
                            id="descPlaceholder"
                            placeholder="F.eks. Ring på klokken..."
                            value={orgSettings.descPlaceholder}
                            onChange={(e) => setOrgSettings(s => ({ ...s, descPlaceholder: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Felt 2 */}
                    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <Label className="text-base font-semibold">Felt 2</Label>
                         <Switch 
                            checked={orgSettings.notesEnabled} 
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, notesEnabled: checked }))} 
                         />
                      </div>
                      <div className={`space-y-4 ${!orgSettings.notesEnabled && 'opacity-50 pointer-events-none'}`}>
                        <div className="space-y-2">
                          <Label htmlFor="notesLabel" className="text-xs">Etikett (Label)</Label>
                          <Input
                            id="notesLabel"
                            placeholder="F.eks. Intern info"
                            value={orgSettings.notesLabel}
                            onChange={(e) => setOrgSettings(s => ({ ...s, notesLabel: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notesPlaceholder" className="text-xs">Plassholder</Label>
                          <Input
                            id="notesPlaceholder"
                            placeholder="F.eks. Kunden er ofte ikke hjemme..."
                            value={orgSettings.notesPlaceholder}
                            onChange={(e) => setOrgSettings(s => ({ ...s, notesPlaceholder: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Felt 3 */}
                    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <Label className="text-base font-semibold">Felt 3</Label>
                         <Switch 
                            checked={orgSettings.field3Enabled} 
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, field3Enabled: checked }))} 
                         />
                      </div>
                      <div className={`space-y-4 ${!orgSettings.field3Enabled && 'opacity-50 pointer-events-none'}`}>
                        <div className="space-y-2">
                          <Label htmlFor="field3Label" className="text-xs">Etikett (Label)</Label>
                          <Input
                            id="field3Label"
                            placeholder="F.eks. Kode til port"
                            value={orgSettings.field3Label}
                            onChange={(e) => setOrgSettings(s => ({ ...s, field3Label: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="field3Placeholder" className="text-xs">Plassholder</Label>
                          <Input
                            id="field3Placeholder"
                            placeholder="F.eks. 1234*"
                            value={orgSettings.field3Placeholder}
                            onChange={(e) => setOrgSettings(s => ({ ...s, field3Placeholder: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                 </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Hoveddepot & Geofencing</h3>
                  <p className="text-xs text-slate-500 italic">Sett lokasjonen for organisasjonens hoveddepot. Dette brukes til å verifisere inn- og utstempling for sjåfører med fast oppmøte.</p>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="depotAddress">Adresse</Label>
                      <Input id="depotAddress" placeholder="F.eks. Storgata 1, 0101 Oslo" value={orgSettings.depotAddress} onChange={(e) => setOrgSettings(s => ({ ...s, depotAddress: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depotLat">Breddegrad (Lat)</Label>
                      <Input id="depotLat" placeholder="59.9139" value={orgSettings.depotLat} onChange={(e) => setOrgSettings(s => ({ ...s, depotLat: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depotLng">Lengdegrad (Lng)</Label>
                      <Input id="depotLng" placeholder="10.7522" value={orgSettings.depotLng} onChange={(e) => setOrgSettings(s => ({ ...s, depotLng: e.target.value }))} />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex justify-between items-center"><Label htmlFor="depotRadius">Radius for stempling: {orgSettings.depotRadius} meter</Label></div>
                        <input type="range" id="depotRadius" min="100" max="5000" step="100" value={orgSettings.depotRadius} onChange={(e) => setOrgSettings(s => ({ ...s, depotRadius: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                  </div>
              </div>
              <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Hoveddepot & Geofencing</h3>
                  <p className="text-xs text-slate-500 italic">Sett lokasjonen for organisasjonens hoveddepot. Dette brukes til å verifisere inn- og utstempling for sjåfører med fast oppmøte.</p>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="depotAddress">Adresse</Label>
                      <Input id="depotAddress" placeholder="F.eks. Storgata 1, 0101 Oslo" value={orgSettings.depotAddress} onChange={(e) => setOrgSettings(s => ({ ...s, depotAddress: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depotLat">Breddegrad (Lat)</Label>
                      <Input id="depotLat" placeholder="59.9139" value={orgSettings.depotLat} onChange={(e) => setOrgSettings(s => ({ ...s, depotLat: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depotLng">Lengdegrad (Lng)</Label>
                      <Input id="depotLng" placeholder="10.7522" value={orgSettings.depotLng} onChange={(e) => setOrgSettings(s => ({ ...s, depotLng: e.target.value }))} />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex justify-between items-center"><Label htmlFor="depotRadius">Radius for stempling: {orgSettings.depotRadius} meter</Label></div>
                        <input type="range" id="depotRadius" min="100" max="5000" step="100" value={orgSettings.depotRadius} onChange={(e) => setOrgSettings(s => ({ ...s, depotRadius: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                  </div>
              </div>
              <Button type="submit" disabled={isSavingSettings} className="w-full sm:w-auto">
                {isSavingSettings ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Lagrer...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Lagre Innstillinger
                  </>
                )}
              </Button>
            </form>

            {/* Legal Status Section */}
            {organization?.legal && (
               <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">Juridisk Status</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Databehandleravtale (DPA) v{organization.legal.dpaVersion || '1.0'} er elektronisk akseptert.</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Akseptert av: {organization.legal.dpaAcceptedByEmail || 'Administrator'}
                        </p>
                        <p className="text-sm text-slate-500">
                          Dato: {formatLegalDate(organization.legal.dpaAcceptedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
               </div>
            )}
            
          </CardContent>
        </Card>

        {organization && (
            <>
                 <DataExport orgId={organization.id} />
                <DataImport orgId={organization.id} />
                <DeleteOrganization orgId={organization.id} />
            </>
        )}

        

        {/* Edit Name Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => {
            if (!open) {
                setEditingUser(null);
                setTimeout(() => { document.body.style.pointerEvents = ''; }, 300);
            }
        }}>
          <DialogContent className="sm:max-w-md w-[95vw] rounded-xl" aria-describedby={undefined}>
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
          <DialogContent className="sm:max-w-md w-[95vw] rounded-xl" aria-describedby={undefined}>
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