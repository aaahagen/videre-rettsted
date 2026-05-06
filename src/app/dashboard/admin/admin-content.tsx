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
import { Badge } from '@/components/ui/badge';
import { UserPlus, Loader2, Copy, Check, MoreVertical, Shield, ShieldAlert, UserX, Pause, Play, Mail, User as UserIcon, Edit2, Settings, IdCard, Search, Building2, CheckCircle2, ChevronLeft, ChevronRight, Plus, Users, Download, Upload, Package, ChevronDown, ChevronUp, Clock, MapPin, Hash } from 'lucide-react';
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
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { PendingInvitations } from '@/components/admin/pending-invitations';
import { useAuth } from '@/components/auth-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function AdminDashboardContent({ authUser }: { authUser?: FirebaseUser }) {
  const { dbUser } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'driver' | 'admin' | 'contractor' | 'loader' | 'planner'>('driver');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(true);
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
    doorCodeEnabled: false,
    doorCodeLabel: '',
    doorCodePlaceholder: '',
    contactPersonsEnabled: false,
    contactPersonsLabel: '',
    contactPersonsPlaceholder: '', 
    depotAddress: '',
    depotLat: '',
    depotLng: '',
    depotRadius: 500,
    // Place Settings (Customer Numbers)
    autoGenerateCustomerNumbers: false,
    customerNumberPrefix: '',
    nextCustomerNumber: 1000
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupRealtimeUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const currentUserId = authUser?.uid || dbUser?.id;
        if (!currentUserId) return;
        
        const userDoc = await firebaseDB.getUser(currentUserId);
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
              doorCodeEnabled: org.fieldSettings?.doorCode?.enabled ?? false,
              doorCodeLabel: org.fieldSettings?.doorCode?.label || '',
              doorCodePlaceholder: org.fieldSettings?.doorCode?.placeholder || '', 
              contactPersonsEnabled: org.fieldSettings?.contactPersons?.enabled ?? false,
              contactPersonsLabel: org.fieldSettings?.contactPersons?.label || '',
              contactPersonsPlaceholder: org.fieldSettings?.contactPersons?.placeholder || '', 
              depotAddress: org.mainDepot?.address || '',
              depotLat: org.mainDepot?.coordinates?.lat?.toString() || '',
              depotLng: org.mainDepot?.coordinates?.lng?.toString() || '',
              depotRadius: org.mainDepot?.radius || 500,
              autoGenerateCustomerNumbers: org.placeSettings?.autoGenerateCustomerNumbers ?? false,
              customerNumberPrefix: org.placeSettings?.customerNumberPrefix || '',
              nextCustomerNumber: org.placeSettings?.nextCustomerNumber || 1000
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
  }, [authUser, dbUser, toast]);

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
  }, [searchQuery, users]);

  const handleInviteUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      setIsInviteOpen(false);
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

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({
        title: "Rolle oppdatert",
        description: `Brukerens rolle ble endret.`,
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
          doorCode: { enabled: orgSettings.doorCodeEnabled, label: orgSettings.doorCodeLabel, placeholder: orgSettings.doorCodePlaceholder },
          contactPersons: { enabled: orgSettings.contactPersonsEnabled, label: orgSettings.contactPersonsLabel, placeholder: orgSettings.contactPersonsPlaceholder }
        },
        placeSettings: {
            autoGenerateCustomerNumbers: orgSettings.autoGenerateCustomerNumbers,
            customerNumberPrefix: orgSettings.customerNumberPrefix,
            nextCustomerNumber: orgSettings.nextCustomerNumber
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden w-full">
      <div className="space-y-6 sm:space-y-8">
        
        <h1 className="text-3xl font-bold font-headline px-1">Adminpanel</h1>
        
        {organization && <PendingInvitations orgId={organization.id} />}

        {/* USER MANAGEMENT (Collapsible) */}
        <Collapsible
          open={isUsersOpen}
          onOpenChange={setIsUsersOpen}
          className="space-y-2"
        >
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 w-full flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsUsersOpen(!isUsersOpen)}>
                  <CardTitle className="flex items-center gap-2 font-headline text-xl sm:text-2xl">
                    <Users className="h-5 w-5" /> Brukere & Tilganger
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                      <Button className="hidden sm:flex"><Plus className="mr-2 h-4 w-4" /> Inviter Bruker</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inviter ny bruker</DialogTitle>
                        <DialogDescription>
                          Opprett en invitasjon for en ny ansatt. De vil få en lenke for å opprette sin konto.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="inviteName">Navn eller internnummer</Label>
                          <Input 
                            id="inviteName" 
                            type="text" 
                            placeholder="Ola Nordmann" 
                            value={name}
                            onChange={handleNameChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inviteEmail">E-postadresse</Label>
                          <Input 
                            id="inviteEmail" 
                            type="email" 
                            placeholder="navn@bedrift.no" 
                            value={email}
                            onChange={handleNameChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="inviteRole">Rolle</Label>
                          <Select 
                            value={role} 
                            onValueChange={(val: any) => setRole(val)}
                          >
                            <SelectTrigger id="inviteRole" className="w-full">
                              <SelectValue placeholder="Velg en rolle" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="driver">Fast Sjåfør</SelectItem>
                              <SelectItem value="contractor">Innleid (Ekstern)</SelectItem>
                              <SelectItem value="loader">Lager / Laster</SelectItem>
                              <SelectItem value="planner">Ruteplanlegger</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Avbryt</Button>
                        <Button onClick={() => handleInviteUser()} disabled={!email || isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Opprett Invitasjon
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      {isUsersOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              {!isUsersOpen && (
                <CardDescription className="w-full">Administrer hvem som har tilgang til systemet</CardDescription>
              )}
              <div className="w-full sm:hidden">
                 <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Inviter Bruker</Button>
                    </DialogTrigger>
                    {/* ... dialog content ... */}
                 </Dialog>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="mb-4 text-sm text-muted-foreground">Administrer hvem som har tilgang til systemet</div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Søk etter navn eller e-post..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="rounded-md border">
                    {/* Desktop Header */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 p-4 font-semibold border-b bg-muted/50 text-sm">
                      <div className="col-span-4">Bruker</div>
                      <div className="col-span-3">Rolle</div>
                      <div className="col-span-3">Status</div>
                      <div className="col-span-2 text-right">Handlinger</div>
                    </div>
                    
                    {filteredUsers.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Ingen brukere funnet.
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredUsers.map((user) => (
                          <div key={user.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center text-sm">
                            <div className="col-span-1 sm:col-span-4 flex justify-between sm:block">
                              <div>
                                <p className="font-medium truncate">{user.name || 'Ikke fullført'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                              {/* Mobile Actions Button */}
                              <div className="sm:hidden">
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
                            </div>
                            <div className="col-span-1 sm:col-span-3">
                              <Select 
                                disabled={user.id === dbUser?.id || user.id === authUser?.uid}
                                value={user.role} 
                                onValueChange={(val) => handleUpdateRole(user.id, val)}
                              >
                                <SelectTrigger className="h-8 text-xs w-full sm:w-auto">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="driver">Fast Sjåfør</SelectItem>
                                  <SelectItem value="contractor">Innleid (Ekstern)</SelectItem>
                                  <SelectItem value="loader">Lager / Laster</SelectItem>
                                  <SelectItem value="planner">Ruteplanlegger</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-1 sm:col-span-3 flex items-center justify-between sm:justify-start gap-2">
                               <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${user.status === 'paused' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                  <span className="text-xs sm:text-sm">{user.status === 'paused' ? 'Pauset' : 'Aktiv'}</span>
                               </div>
                               <Switch 
                                  className="sm:hidden"
                                  checked={user.status !== 'paused'}
                                  disabled={user.id === dbUser?.id || user.id === authUser?.uid}
                                  onCheckedChange={() => handleToggleStatus(user.id, user.status)}
                                />
                            </div>
                            <div className="hidden sm:flex col-span-2 justify-end items-center gap-2">
                               <Switch 
                                  checked={user.status !== 'paused'}
                                  disabled={user.id === dbUser?.id || user.id === authUser?.uid}
                                  onCheckedChange={() => handleToggleStatus(user.id, user.status)}
                                />
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* TIMELISTER / ANSATTE MODULE */}
        {organization?.modules?.workforce && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl sm:text-2xl">
                <Clock className="h-5 w-5" /> Timelister / Ansatte
              </CardTitle>
              <CardDescription>
                Administrer innstillinger for timeregistrering og ansatte.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Hoveddepot & Geofencing
                  </h3>
                  <p className="text-xs text-slate-500 italic">Sett lokasjonen for organisasjonens hoveddepot. Dette brukes til å verifisere inn- og utstempling for sjåfører med fast oppmøte.</p>
                  
                  <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
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
                    <Button type="submit" disabled={isSavingSettings} className="w-full sm:w-auto">
                      {isSavingSettings ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Lagrer...
                        </>
                      ) : (
                        <>
                          <Settings className="mr-2 h-4 w-4" />
                          Lagre Hoveddepot
                        </>
                      )}
                    </Button>
                  </form>
               </div>
            </CardContent>
          </Card>
        )}

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

              {/* CUSTOMER NUMBER SETTINGS */}
              <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Hash className="h-4 w-4" /> Kundenummerering
                  </h3>
                  <p className="text-xs text-slate-500 italic">Velg om systemet skal tildele kundenummer automatisk når du oppretter nye steder.</p>
                  
                  <div className="p-4 rounded-xl border bg-slate-50/50 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold">Auto-generer kundenummer</Label>
                            <p className="text-xs text-muted-foreground">Nye steder får tildelt neste ledige nummer automatisk.</p>
                        </div>
                        <Switch 
                            checked={orgSettings.autoGenerateCustomerNumbers}
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, autoGenerateCustomerNumbers: checked }))}
                        />
                    </div>

                    {orgSettings.autoGenerateCustomerNumbers && (
                        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-top-1">
                            <div className="space-y-2">
                                <Label htmlFor="custPrefix">Prefix (Valgfritt)</Label>
                                <Input 
                                    id="custPrefix"
                                    placeholder="F.eks. K-"
                                    value={orgSettings.customerNumberPrefix}
                                    onChange={(e) => setOrgSettings(s => ({ ...s, customerNumberPrefix: e.target.value }))}
                                />
                                <p className="text-[10px] text-muted-foreground">Legges foran nummeret (f.eks. K-1001)</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="custNext">Neste nummer i rekken</Label>
                                <Input 
                                    id="custNext"
                                    type="number"
                                    value={orgSettings.nextCustomerNumber}
                                    onChange={(e) => setOrgSettings(s => ({ ...s, nextCustomerNumber: parseInt(e.target.value) || 1000 }))}
                                />
                            </div>
                        </div>
                    )}
                  </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
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

                    {/* Dørkode */}
                    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <Label className="text-base font-semibold">Dørkode / Nøkkel</Label>
                         <Switch 
                            checked={orgSettings.doorCodeEnabled} 
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, doorCodeEnabled: checked }))} 
                         />
                      </div>
                      <div className={`space-y-4 ${!orgSettings.doorCodeEnabled && 'opacity-50 pointer-events-none'}`}>
                        <div className="space-y-2">
                          <Label htmlFor="doorCodeLabel" className="text-xs">Etikett (Label)</Label>
                          <Input
                            id="doorCodeLabel"
                            placeholder="F.eks. Kode til port"
                            value={orgSettings.doorCodeLabel}
                            onChange={(e) => setOrgSettings(s => ({ ...s, doorCodeLabel: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doorCodePlaceholder" className="text-xs">Plassholder</Label>
                          <Input
                            id="doorCodePlaceholder"
                            placeholder="F.eks. 1234*"
                            value={orgSettings.doorCodePlaceholder}
                            onChange={(e) => setOrgSettings(s => ({ ...s, doorCodePlaceholder: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Kontaktpersoner */}
                    <div className="space-y-4 p-4 rounded-lg border bg-slate-50/50">
                      <div className="flex items-center justify-between">
                         <Label className="text-base font-semibold">Kontaktpersoner</Label>
                         <Switch 
                            checked={orgSettings.contactPersonsEnabled} 
                            onCheckedChange={(checked) => setOrgSettings(s => ({ ...s, contactPersonsEnabled: checked }))} 
                         />
                      </div>
                      <div className={`space-y-4 ${!orgSettings.contactPersonsEnabled && 'opacity-50 pointer-events-none'}`}>
                        <div className="space-y-2">
                          <Label htmlFor="contactPersonsLabel" className="text-xs">Etikett (Label)</Label>
                          <Input
                            id="contactPersonsLabel"
                            placeholder="F.eks. Kontaktpersoner"
                            value={orgSettings.contactPersonsLabel}
                            onChange={(e) => setOrgSettings(s => ({ ...s, contactPersonsLabel: e.target.value }))}
                          />
                        </div>
                      </div>
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

        {/* DATA MANAGEMENT */}
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><DatabaseIcon className="h-5 w-5" /> Datahåndtering</CardTitle>
            <CardDescription>Eksporter eller importer leveringssteder</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {organization && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 border rounded-xl p-4 bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Download className="h-4 w-4" /> Eksport (Backup)
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Last ned en komplett kopi av dine steder, ruter og kjøretøy som en JSON-fil.
                                    </p>
                                </div>
                                <DataExport orgId={organization.id} />
                            </div>

                            <div className="space-y-4 border rounded-xl p-4 bg-slate-50">
                                <div>
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Upload className="h-4 w-4" /> Import (Gjenopprett)
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Last opp en JSON-fil for å gjenopprette steder. <span className="text-amber-600 font-bold">Lagrer nye steder, sletter ingenting.</span>
                                    </p>
                                </div>
                                <DataImport orgId={organization.id} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t mt-8">
                    {organization && <DeleteOrganization orgId={organization.id} />}
                </div>
            </CardContent>
        </Card>

        

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

// Just a helper icon
function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}