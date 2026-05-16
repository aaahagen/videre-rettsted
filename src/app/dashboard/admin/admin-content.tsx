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
import { Loader2, Copy, Check, MoreVertical, Pause, Play, User as UserIcon, Edit2, Search, Building2, CheckCircle2, Plus, Users, Download, Upload, ChevronDown, ChevronUp, Clock, MapPin, Hash, Save, UserX, LocateFixed, Shield } from 'lucide-react';
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
import { geocodeAddress } from '@/lib/geocoding';
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
import { AuditLogViewer } from '@/components/admin/audit-log-viewer';
import { useAuth } from '@/components/auth-provider';

/**
 * Dropdown-meny for administrative handlinger på en spesifikk bruker.
 * 
 * Tillater:
 * - Endring av visningsnavn
 * - Aktivering/deaktivering (pause) av brukeren
 * - Permanent sletting av brukeren
 */
function UserActionsDropdown({ user, handleToggleStatus, handleDeleteUser, onEditName }: any) {
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

/**
 * AdminDashboardContent er kontrollpanelet for organisasjonsadministratorer.
 * 
 * Kompononentet gir tilgang til:
 * - **Brukerhåndtering:** Invitasjoner, rolletildeling og statuskontroll.
 * - **Geofencing:** Konfigurasjon av hoveddepot og stemplingsradius.
 * - **Kundenummerering:** Oppsett av automatiske sekvenser for leveringssteder.
 * - **Skjematilpasning:** Mulighet for å endre feltnavn og synlighet i appen.
 * - **Sikkerhetslogg:** Innsyn i audit trail for GDPR-samsvar.
 * - **Datahåndtering:** Eksport og import av organisasjonens data.
 * 
 * @param authUser - Det gjeldende Firebase Auth-objektet for den innloggede administratoren.
 */
export default function AdminDashboardContent({ authUser }: { authUser?: FirebaseUser }) {
  const { dbUser } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'driver' | 'admin' | 'contractor' | 'loader' | 'planner' | 'hms_responsible' | 'salesman'>('driver');
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

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  /**
   * Henter koordinater via enhetens GPS.
   */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Ikke støttet",
        description: "Nettleseren din støtter ikke geolokasjon.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    toast({
      title: "Henter posisjon...",
      description: "Vennligst vent mens vi finner koordinatene dine.",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrgSettings(s => ({ 
            ...s, 
            depotLat: position.coords.latitude.toString(), 
            depotLng: position.coords.longitude.toString() 
        }));
        toast({
          title: "Posisjon hentet",
          description: "Koordinater er registrert.",
        });
        setIsGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Feil ved henting av posisjon",
          description: error.message,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      }
    );
  };

  /**
   * Bruker geokoding-tjenesten for å oversette tekst-adresse til koordinater.
   */
  const handleGeocode = async () => {
    if (!orgSettings.depotAddress || orgSettings.depotAddress.length < 5) {
      toast({ title: "Mangler adresse", description: "Vennligst skriv inn en gyldig adresse først.", variant: "destructive" });
      return;
    }

    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(orgSettings.depotAddress);
      if (coords) {
        setOrgSettings(s => ({
            ...s,
            depotLat: coords.lat.toString(),
            depotLng: coords.lng.toString()
        }));
        toast({ title: "Adresse funnet", description: `Koordinater satt til ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` });
      } else {
        toast({ title: "Fant ikke adressen", description: "Kunne ikke finne koordinater for denne adressen. Sjekk skrivemåten.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Feil ved søk", description: "Noe gikk galt under adresseoppslag.", variant: "destructive" });
    } finally {
      setIsGeocoding(false);
    }
  };

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
    field4Enabled: false,
    field4Label: '',
    field4Placeholder: '',
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
    autoGenerateCustomerNumbers: false,
    customerNumberPrefix: '',
    nextCustomerNumber: 1000
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  /**
   * Setter opp realtids-lyttere for organisasjonsdata og brukerliste.
   */
  useEffect(() => {
    let unsubscribe: () => void;

    const setupRealtimeUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const currentUserId = authUser?.uid || dbUser?.id;
        if (!currentUserId) return;
        
        const userDoc = await firebaseDB.getUser(currentUserId);
        if (userDoc && userDoc.orgId) {
          // Hent organisasjonsdetaljer
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
              field4Enabled: org.fieldSettings?.field4?.enabled ?? false,
              field4Label: org.fieldSettings?.field4?.label || '',
              field4Placeholder: org.fieldSettings?.field4?.placeholder || '',
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
            // Sorter A-Z
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

  /**
   * Filtrerer brukerlisten basert på søkefrase.
   */
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

  /**
   * Oppretter en ny invitasjon og returnerer en lenke.
   */
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
      const link = await firebaseAuth.inviteUser(email, role, name, organization?.id);
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

  /**
   * Kopierer invitasjonslenken til utklippstavlen.
   */
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
         console.error("Clipboard API failed");
      }
    }
  };

  /**
   * Oppdaterer rollen til en eksisterende bruker.
   */
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

  /**
   * Lagrer oppdaterte organisasjonsinnstillinger i Firestore.
   */
  const handleSaveSettings = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
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
          field3: { enabled: orgSettings.field3Enabled, label: orgSettings.field3Label, placeholder: orgSettings.field3Placeholder },
          field4: { enabled: orgSettings.field4Enabled, label: orgSettings.field4Label, placeholder: orgSettings.field4Placeholder },
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden w-full">
      <div className="space-y-6 sm:space-y-8">
        
        <h1 className="text-3xl font-bold font-headline px-1">Adminpanel</h1>
        
        {/* USER MANAGEMENT (Collapsible) */}
        <Collapsible
          open={isUsersOpen}
          onOpenChange={setIsUsersOpen}
          className="space-y-2"
        >
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-slate-50/50">
              <div 
                className="flex items-center gap-3 cursor-pointer group" 
                onClick={() => setIsUsersOpen(!isUsersOpen)}
              >
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-primary/30 transition-colors">
                    <Users className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">Brukere & Tilganger</CardTitle>
                  {!isUsersOpen && (
                    <CardDescription className="text-xs">Administrer hvem som har tilgang til systemet</CardDescription>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-9 font-bold">
                        <Plus className="mr-1.5 h-4 w-4" /> 
                        Ny bruker
                    </Button>
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
                          placeholder="Ola Nordmann" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail">E-postadresse</Label>
                        <Input 
                          id="inviteEmail" 
                          type="email" 
                          placeholder="navn@bedrift.no" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inviteRole">Rolle</Label>
                        <Select value={role} onValueChange={(val: any) => setRole(val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="driver">Fast Sjåfør</SelectItem>
                            <SelectItem value="contractor">Innleid (Ekstern)</SelectItem>
                            <SelectItem value="loader">Lager / Laster</SelectItem>
                            <SelectItem value="planner">Ruteplanlegger</SelectItem>
                            <SelectItem value="salesman">Selger</SelectItem>
                            <SelectItem value="hms_responsible">HMS Ansvarlig</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Eier</SelectItem>
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
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white border">
                    {isUsersOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-4 sm:p-6 border-t border-slate-100">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Søk brukere..." className="pl-10 h-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  
                  <div className="rounded-xl border divide-y">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors">
                        <div className="col-span-1 sm:col-span-4">
                          <p className="font-bold text-slate-900 truncate">{user.name || 'Ufullført'}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="col-span-1 sm:col-span-3">
                          <Select 
                            disabled={user.id === dbUser?.id}
                            value={user.role} 
                            onValueChange={(val) => handleUpdateRole(user.id, val)}
                          >
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="driver">Sjåfør</SelectItem>
                                <SelectItem value="contractor">Innleid</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="owner">Eier</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 sm:col-span-3">
                           <Badge className={user.status === 'paused' ? 'bg-amber-500' : 'bg-green-500'}>{user.status || 'Aktiv'}</Badge>
                        </div>
                        <div className="col-span-1 sm:col-span-2 text-right">
                            <UserActionsDropdown user={user} handleToggleStatus={() => {}} handleDeleteUser={() => {}} onEditName={() => {}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* TIMELISTER MODULE */}
        {organization?.modules?.workforce && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b p-6">
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500" /> Timelister & Geofencing
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Depot Adresse</Label>
                      <div className="flex flex-col gap-3">
                          <Input placeholder="Adresse for innstempling" value={orgSettings.depotAddress} onChange={(e) => setOrgSettings(s => ({ ...s, depotAddress: e.target.value }))} />
                          <div className="grid grid-cols-2 gap-2">
                              <Button type="button" variant="outline" onClick={handleGeocode} disabled={isGeocoding} className="h-10 font-bold border-indigo-200">
                                  {isGeocoding ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Search className="h-4 w-4 mr-2" />} Søk adresse
                              </Button>
                              <Button type="button" variant="outline" onClick={handleGetLocation} className="h-10 font-bold border-emerald-200">
                                  <LocateFixed className="h-4 w-4 mr-2" /> Bruk GPS
                              </Button>
                          </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Lat</Label><Input value={orgSettings.depotLat} onChange={(e) => setOrgSettings(s => ({ ...s, depotLat: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Lng</Label><Input value={orgSettings.depotLng} onChange={(e) => setOrgSettings(s => ({ ...s, depotLng: e.target.value }))} />
                    </div>
                    <div className="space-y-2 md:col-span-2 p-4 bg-slate-50 rounded-xl">
                        <Label>Stemplingsradius: {orgSettings.depotRadius}m</Label>
                        <input type="range" min="100" max="5000" step="100" value={orgSettings.depotRadius} onChange={(e) => setOrgSettings(s => ({ ...s, depotRadius: parseInt(e.target.value) }))} className="w-full mt-2" />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSavingSettings} className="font-bold">
                    {isSavingSettings ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Lagre Depot
                  </Button>
               </form>
            </CardContent>
          </Card>
        )}

        {/* AUDIT LOGS */}
        {organization && (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-6">
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" /> Sikkerhetslogg (Audit Trail)
                </CardTitle>
                <CardDescription>Overvåk kritiske hendelser og GDPR-samsvar.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <AuditLogViewer orgId={organization.id} />
            </CardContent>
          </Card>
        )}

        {/* DATA & BACKUP */}
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b p-6">
                <CardTitle className="font-headline text-xl">Datahåndtering & Eksport</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 border rounded-xl p-4 bg-slate-50">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2"><Download className="h-4 w-4" /> Eksport (JSON)</h4>
                        <DataExport orgId={organization?.id || ''} />
                    </div>
                    <div className="space-y-4 border rounded-xl p-4 bg-slate-50">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2"><Upload className="h-4 w-4" /> Import (Gjenopprett)</h4>
                        <DataImport orgId={organization?.id || ''} />
                    </div>
                </div>
            </CardContent>
        </Card>

        {organization && <DeleteOrganization orgId={organization.id} />}
      </div>
    </div>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
