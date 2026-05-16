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
import { Loader2, Copy, Check, MoreVertical, Pause, Play, User as UserIcon, Edit2, Search, Building2, CheckCircle2, Plus, Users, Download, Upload, ChevronDown, ChevronUp, Clock, MapPin, Hash, Save, UserX, LocateFixed, Shield, Settings2, Database, Trash2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

/**
 * Dropdown-meny for administrative handlinger på en spesifikk bruker.
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
        <DropdownMenuItem onClick={onEditName}><Edit2 className="mr-2 h-4 w-4" />Endre Navn</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
          {user.status === 'paused' ? <><Play className="mr-2 h-4 w-4" />Aktiver</> : <><Pause className="mr-2 h-4 w-4" />Sett på pause</>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteUser(user.id)}><UserX className="mr-2 h-4 w-4" />Slett Bruker</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * AdminDashboardContent er kontrollpanelet for organisasjonsadministratorer.
 */
export default function AdminDashboardContent({ authUser }: { authUser?: FirebaseUser }) {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  
  // Basic State
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
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [orgSettings, setOrgSettings] = useState({
    name: '',
    orgNumber: '',
    // Field settings
    descEnabled: true, descLabel: '', descPlaceholder: '',
    notesEnabled: true, notesLabel: '', notesPlaceholder: '',
    field3Enabled: false, field3Label: '', field3Placeholder: '',
    field4Enabled: false, field4Label: '', field4Placeholder: '',
    doorCodeEnabled: false, doorCodeLabel: '', doorCodePlaceholder: '',
    contactPersonsEnabled: false, contactPersonsLabel: '', contactPersonsPlaceholder: '', 
    // Depot
    depotAddress: '', depotLat: '', depotLng: '', depotRadius: 500,
    // Place numbering
    autoGenerateCustomerNumbers: false, customerNumberPrefix: '', nextCustomerNumber: 1000
  });

  useEffect(() => {
    let unsubscribe: () => void;
    const setupData = async () => {
      setIsLoadingUsers(true);
      const uid = authUser?.uid || dbUser?.id;
      if (!uid) return;

      const userDoc = await firebaseDB.getUser(uid);
      if (userDoc?.orgId) {
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

        const q = query(collection(db, 'users'), where('orgId', '==', userDoc.orgId));
        unsubscribe = onSnapshot(q, (snap) => {
          const orgUsers = snap.docs.map(d => ({ ...d.data(), id: d.id } as User));
          orgUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setUsers(orgUsers);
          setIsLoadingUsers(false);
        });
      }
    };
    setupData();
    return () => unsubscribe?.();
  }, [authUser, dbUser]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredUsers(users.filter(u => (u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))));
  }, [searchQuery, users]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
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
      toast({ title: "Lagret", description: "Innstillinger er oppdatert." });
    } catch (error: any) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleInviteUser = async () => {
    if (!email || !role) return;
    setIsSubmitting(true);
    try {
      const link = await firebaseAuth.inviteUser(email, role, name, organization?.id);
      setInviteLink(link);
      toast({ title: 'Invitasjon opprettet' });
      setEmail(''); setName(''); setRole('driver'); setIsInviteOpen(false);
    } catch (e: any) {
      toast({ title: 'Feil', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (uid: string, newRole: any) => {
      try { await updateDoc(doc(db, 'users', uid), { role: newRole }); toast({ title: "Oppdatert" }); } 
      catch (e: any) { toast({ title: "Feil", variant: "destructive" }); }
  };

  const handleToggleStatus = async (uid: string, current: any) => {
      try { await updateDoc(doc(db, 'users', uid), { status: current === 'paused' ? 'active' : 'paused' }); toast({ title: "Status endret" }); }
      catch (e: any) { toast({ title: "Feil", variant: "destructive" }); }
  };

  const handleDeleteUser = async (uid: string) => {
      if (!confirm("Slette permanent?")) return;
      try { await firebaseAuth.deleteUser(uid); toast({ title: "Slettet" }); }
      catch (e: any) { toast({ title: "Feil", variant: "destructive" }); }
  };

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(pos => {
        setOrgSettings(s => ({ ...s, depotLat: pos.coords.latitude.toString(), depotLng: pos.coords.longitude.toString() }));
        toast({ title: "Posisjon hentet" });
    });
  };

  const handleGeocode = async () => {
      const coords = await geocodeAddress(orgSettings.depotAddress);
      if (coords) setOrgSettings(s => ({ ...s, depotLat: coords.lat.toString(), depotLng: coords.lng.toString() }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 w-full">
        <h1 className="text-3xl font-bold font-headline">Adminpanel</h1>

        {/* 1. USERS & ACCESS */}
        <Collapsible open={isUsersOpen} onOpenChange={setIsUsersOpen} className="space-y-2">
            <Card className="overflow-hidden border-slate-200">
                <CardHeader className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-slate-50/50">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsUsersOpen(!isUsersOpen)}>
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-primary/30 transition-colors">
                            <Users className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-xl">Brukere & Tilganger</CardTitle>
                            {!isUsersOpen && <CardDescription className="text-xs">Administrer tilgang</CardDescription>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                            <DialogTrigger asChild><Button size="sm" className="h-9 font-bold"><Plus className="mr-1 h-4 w-4" />Ny bruker</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Inviter ny bruker</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input placeholder="Navn" value={name} onChange={e => setName(e.target.value)} />
                                    <Input placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} />
                                    <Select value={role} onValueChange={(v: any) => setRole(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="driver">Sjåfør</SelectItem><SelectItem value="contractor">Innleid</SelectItem>
                                            <SelectItem value="loader">Laster</SelectItem><SelectItem value="planner">Planlegger</SelectItem>
                                            <SelectItem value="salesman">Selger</SelectItem><SelectItem value="hms_responsible">HMS Ansvarlig</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem><SelectItem value="owner">Eier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter><Button onClick={handleInviteUser} disabled={isSubmitting}>Opprett Invitasjon</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="h-9 w-9 p-0 border hover:bg-white">{isUsersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button></CollapsibleTrigger>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="p-4 sm:p-6 space-y-4 border-t">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Søk brukere..." className="pl-10 h-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="rounded-xl border divide-y overflow-hidden">
                            {filteredUsers.map(u => (
                                <div key={u.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="col-span-4"><p className="font-bold text-sm">{u.name || 'Ufullført'}</p><p className="text-[10px] text-slate-500">{u.email}</p></div>
                                    <div className="col-span-3"><Select disabled={u.id === dbUser?.id} value={u.role} onValueChange={v => handleUpdateRole(u.id, v)}><SelectTrigger className="h-8 text-[10px] bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="driver">Sjåfør</SelectItem><SelectItem value="contractor">Innleid</SelectItem><SelectItem value="loader">Laster</SelectItem><SelectItem value="planner">Planlegger</SelectItem><SelectItem value="salesman">Selger</SelectItem><SelectItem value="hms_responsible">HMS Ansvarlig</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="owner">Eier</SelectItem></SelectContent></Select></div>
                                    <div className="col-span-3"><Badge className={u.status === 'paused' ? 'bg-amber-500' : 'bg-green-500'}>{u.status || 'Aktiv'}</Badge></div>
                                    <div className="col-span-2 text-right"><UserActionsDropdown user={u} handleToggleStatus={handleToggleStatus} handleDeleteUser={handleDeleteUser} onEditName={() => { setEditingUser(u); setNewName(u.name || ''); }} /></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>

        {organization && <PendingInvitations orgId={organization.id} />}

        {/* 2. PLACE CARD SETTINGS */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-6">
                <div className="flex items-center gap-3">
                    <Settings2 className="h-5 w-5 text-blue-600" />
                    <div>
                        <CardTitle className="font-headline text-xl">Tilpasning av Leveringssteder</CardTitle>
                        <CardDescription className="text-xs">Endre navn og synlighet for felt i appen</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> Kundenummerering</h3>
                  <div className="p-4 rounded-xl border bg-slate-50/50 space-y-6 max-w-3xl">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5"><Label className="text-sm font-bold">Auto-generer kundenummer</Label><p className="text-xs text-muted-foreground">Nye steder får tildelt nummer automatisk.</p></div>
                        <Switch checked={orgSettings.autoGenerateCustomerNumbers} onCheckedChange={(v: boolean) => setOrgSettings(s => ({ ...s, autoGenerateCustomerNumbers: v }))} />
                    </div>
                    {orgSettings.autoGenerateCustomerNumbers && (
                        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-top-1">
                            <div className="space-y-2"><Label>Prefix (f.eks. K-)</Label><Input value={orgSettings.customerNumberPrefix} onChange={e => setOrgSettings(s => ({ ...s, customerNumberPrefix: e.target.value }))} /></div>
                            <div className="space-y-2"><Label>Neste nummer</Label><Input type="number" value={orgSettings.nextCustomerNumber} onChange={e => setOrgSettings(s => ({ ...s, nextCustomerNumber: parseInt(e.target.value) || 1000 }))} /></div>
                        </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-4">Felt i "Nytt Sted"-skjema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        <FieldConfig label="Felt 1" enabled={orgSettings.descEnabled} onEnabledChange={(v: boolean) => setOrgSettings(s => ({ ...s, descEnabled: v }))} name={orgSettings.descLabel} onNameChange={(v: string) => setOrgSettings(s => ({ ...s, descLabel: v }))} placeholder={orgSettings.descPlaceholder} onPlaceholderChange={(v: string) => setOrgSettings(s => ({ ...s, descPlaceholder: v }))} />
                        <FieldConfig label="Felt 2" enabled={orgSettings.notesEnabled} onEnabledChange={(v: boolean) => setOrgSettings(s => ({ ...s, notesEnabled: v }))} name={orgSettings.notesLabel} onNameChange={(v: string) => setOrgSettings(s => ({ ...s, notesLabel: v }))} placeholder={orgSettings.notesPlaceholder} onPlaceholderChange={(v: string) => setOrgSettings(s => ({ ...s, notesPlaceholder: v }))} />
                        <FieldConfig label="Felt 3" enabled={orgSettings.field3Enabled} onEnabledChange={(v: boolean) => setOrgSettings(s => ({ ...s, field3Enabled: v }))} name={orgSettings.field3Label} onNameChange={(v: string) => setOrgSettings(s => ({ ...s, field3Label: v }))} placeholder={orgSettings.field3Placeholder} onPlaceholderChange={(v: string) => setOrgSettings(s => ({ ...s, field3Placeholder: v }))} />
                        <FieldConfig label="Felt 4" enabled={orgSettings.field4Enabled} onEnabledChange={(v: boolean) => setOrgSettings(s => ({ ...s, field4Enabled: v }))} name={orgSettings.field4Label} onNameChange={(v: string) => setOrgSettings(s => ({ ...s, field4Label: v }))} placeholder={orgSettings.field4Placeholder} onPlaceholderChange={(v: string) => setOrgSettings(s => ({ ...s, field4Placeholder: v }))} />
                        <FieldConfig label="Dørkode" enabled={orgSettings.doorCodeEnabled} onEnabledChange={(v: boolean) => setOrgSettings(s => ({ ...s, doorCodeEnabled: v }))} name={orgSettings.doorCodeLabel} onNameChange={(v: string) => setOrgSettings(s => ({ ...s, doorCodeLabel: v }))} placeholder={orgSettings.doorCodePlaceholder} onPlaceholderChange={(v: string) => setOrgSettings(s => ({ ...s, doorCodePlaceholder: v }))} />
                        <FieldConfig label="Kontaktpersoner" enabled={orgSettings.contactPersonsEnabled} onEnabledChange={(v: boolean) => setOrgSettings(s => ({ ...s, contactPersonsEnabled: v }))} name={orgSettings.contactPersonsLabel} onNameChange={(v: string) => setOrgSettings(s => ({ ...s, contactPersonsLabel: v }))} />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* 3. DEPOT & GEOFENCING */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-6">
                <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-indigo-500" />
                    <CardTitle className="font-headline text-xl">Hoveddepot & Geofencing</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 max-w-2xl">
                <div className="space-y-4">
                    <div className="space-y-2"><Label>Adresse</Label><Input value={orgSettings.depotAddress} onChange={e => setOrgSettings(s => ({ ...s, depotAddress: e.target.value }))} /><div className="grid grid-cols-2 gap-2 mt-2"><Button variant="outline" onClick={handleGeocode} className="font-bold border-indigo-100"><Search className="h-4 w-4 mr-2" />Hent koordinater</Button><Button variant="outline" onClick={handleGetLocation} className="font-bold border-emerald-100"><LocateFixed className="h-4 w-4 mr-2" />Bruk GPS</Button></div></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Lat</Label><Input value={orgSettings.depotLat} onChange={e => setOrgSettings(s => ({ ...s, depotLat: e.target.value }))} /></div>
                        <div className="space-y-2"><Label>Lng</Label><Input value={orgSettings.depotLng} onChange={e => setOrgSettings(s => ({ ...s, depotLng: e.target.value }))} /></div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border space-y-2"><div className="flex justify-between"><Label>Stemplingsradius</Label><Badge variant="secondary">{orgSettings.depotRadius}m</Badge></div><input type="range" min="100" max="5000" step="100" value={orgSettings.depotRadius} onChange={e => setOrgSettings(s => ({ ...s, depotRadius: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg accent-primary" /></div>
                </div>
            </CardContent>
        </Card>

        {/* 4. AUDIT & DATA */}
        {organization && (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b p-6 flex flex-row items-center gap-3"><Shield className="h-5 w-5 text-amber-600" /><CardTitle className="font-headline text-xl">Sikkerhetslogg (Audit Trail)</CardTitle></CardHeader>
                <AuditLogViewer orgId={organization.id} />
            </Card>
        )}

        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-6">
                <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-slate-600" />
                    <CardTitle className="font-headline text-xl">Datahåndtering</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-xl bg-slate-50 space-y-3"><h4 className="font-bold flex items-center gap-2"><Download className="h-4 w-4" />Eksport (JSON)</h4><DataExport orgId={organization?.id || ''} /></div>
                    <div className="p-4 border rounded-xl bg-slate-50 space-y-3"><h4 className="font-bold flex items-center gap-2"><Upload className="h-4 w-4" />Import (JSON)</h4><DataImport orgId={organization?.id || ''} /></div>
                </div>
            </CardContent>
        </Card>

        {organization && <DeleteOrganization orgId={organization.id} />}

        <div className="sticky bottom-6 flex justify-center z-50">
            <Button size="lg" className="px-12 font-black shadow-2xl h-14 text-lg bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSaveSettings()} disabled={isSavingSettings}>
                {isSavingSettings ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <Save className="mr-2 h-6 w-6" />}Lagre Alle Endringer
            </Button>
        </div>

        {/* User Name Dialog */}
        <Dialog open={!!editingUser} onOpenChange={o => !o && setEditingUser(null)}>
            <DialogContent>
                <DialogHeader><DialogTitle>Endre Navn</DialogTitle></DialogHeader>
                <Input value={newName} onChange={e => setNewName(e.target.value)} />
                <DialogFooter><Button onClick={async () => { if(!editingUser) return; await updateDoc(doc(db, 'users', editingUser.id), { name: newName }); setEditingUser(null); toast({ title: "Navn oppdatert" }); }}>Lagre</Button></DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Link Dialog */}
        <Dialog open={!!inviteLink} onOpenChange={o => !o && setInviteLink(null)}>
            <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Invitasjonslenke Klar</DialogTitle></DialogHeader>
                <div className="flex gap-2 items-center"><Input value={inviteLink || ''} readOnly className="h-11 font-mono text-xs" /><Button className="h-11 px-6 font-bold" onClick={() => { navigator.clipboard.writeText(inviteLink!); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); toast({ title: "Kopiert til utklippstavle" }); }}>{isCopied ? <Check className="h-5 w-5" /> : 'Kopier'}</Button></div>
            </DialogContent>
        </Dialog>
    </div>
  );
}

function FieldConfig({ label, enabled, onEnabledChange, name, onNameChange, placeholder, onPlaceholderChange }: any) {
    return (
        <div className="space-y-4 p-4 rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between"><Label className="text-sm font-bold uppercase text-slate-700">{label}</Label><Switch checked={enabled} onCheckedChange={onEnabledChange} /></div>
            <div className={cn("space-y-3", !enabled && "opacity-30 pointer-events-none")}>
                <div className="space-y-1"><Label className="text-[10px] font-bold text-slate-400 uppercase">Navn i appen</Label><Input value={name} onChange={e => onNameChange(e.target.value)} className="h-9 text-xs bg-slate-50 border-none font-bold" /></div>
                {onPlaceholderChange && <div className="space-y-1"><Label className="text-[10px] font-bold text-slate-400 uppercase">Hjelpetekst</Label><Input value={placeholder} onChange={e => onPlaceholderChange(e.target.value)} className="h-9 text-xs bg-slate-50 border-none" /></div>}
            </div>
        </div>
    );
}
