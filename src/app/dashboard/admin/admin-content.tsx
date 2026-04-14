'use client';
import { SplashScreen } from "@/components/ui/splash-screen";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { UserProfile, Organization, Invitation, DriverProfile } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Users, Settings, LogOut, Download, FileJson, Mail, X, Check, Search, Upload, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { firebaseAuth } from '@/lib/firebase/auth';
import { DataExport } from '@/components/admin/data-export';
import { DataImport } from '@/components/admin/data-import';
import { DeleteOrganization } from '@/components/admin/delete-org';

export default function AdminContent() {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<DriverProfile[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'driver' | 'contractor' | 'loader' | 'planner'>('driver');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (dbUser?.orgId && dbUser.role === 'admin') {
      loadData();
    }
  }, [dbUser]);

  const loadData = async () => {
    if (!dbUser?.orgId) return;
    setIsLoading(true);
    try {
      // Load org data
      const orgDoc = await getDocs(query(collection(db, 'organizations'), where('__name__', '==', dbUser.orgId)));
      if (!orgDoc.empty) {
        setOrganization({ id: orgDoc.docs[0].id, ...orgDoc.docs[0].data() } as Organization);
      }

      // Load users
      const orgUsers = await firebaseDB.getUsers(dbUser.orgId);
      setUsers(orgUsers as DriverProfile[]);

    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste inn data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!dbUser?.orgId || !inviteEmail) return;

    setIsInviting(true);
    try {
      await firebaseAuth.inviteUser(inviteEmail.toLowerCase(), inviteRole);
      
      toast({
        title: "Invitasjon sendt",
        description: `En invitasjon har blitt opprettet for ${inviteEmail}. Be dem gå til registeringssiden.`,
      });
      
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('driver');
      
      loadData();

    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke opprette invitasjon.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({ title: "Rolle oppdatert", description: "Brukerens rolle ble endret." });
      loadData();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({ title: "Feil", description: "Kunne ikke oppdatere rolle.", variant: "destructive" });
    }
  };

  const handleToggleUserStatus = async (user: DriverProfile) => {
    try {
      const newStatus = user.disabled ? false : true;
      await updateDoc(doc(db, 'users', user.id), { disabled: newStatus });
      toast({ 
        title: newStatus ? "Bruker deaktivert" : "Bruker aktivert", 
        description: "Brukerstatus ble endret." 
      });
      loadData();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({ title: "Feil", description: "Kunne ikke endre status.", variant: "destructive" });
    }
  };


  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="space-y-6">
      
      {/* ORGANIZATION SETTINGS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Organisasjon</CardTitle>
          <CardDescription>Innstillinger for din bedrift</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bedriftsnavn</Label>
              <Input value={organization?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Organisasjonsnummer</Label>
              <Input value={organization?.orgNumber || ''} disabled />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" disabled>Endre bedriftsinfo (Kommer)</Button>
          </div>
        </CardContent>
      </Card>

      {/* USER MANAGEMENT */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Brukere & Tilganger</CardTitle>
            <CardDescription>Administrer hvem som har tilgang til systemet</CardDescription>
          </div>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Inviter Bruker</Button>
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
                  <Label htmlFor="email">E-postadresse</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="navn@bedrift.no" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rolle</Label>
                  <Select 
                    value={inviteRole} 
                    onValueChange={(val: any) => setInviteRole(val)}
                  >
                    <SelectTrigger id="role" className="w-full">
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
                <Button onClick={handleInviteUser} disabled={!inviteEmail || isInviting}>
                  {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Opprett Invitasjon
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
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
              <div className="grid grid-cols-12 gap-4 p-4 font-semibold border-b bg-muted/50 text-sm">
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
                    <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                      <div className="col-span-4">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="col-span-3">
                        <Select 
                          disabled={user.id === dbUser?.id}
                          value={user.role} 
                          onValueChange={(val) => handleUpdateRole(user.id, val)}
                        >
                          <SelectTrigger className="h-8 text-xs">
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
                      <div className="col-span-3 flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.disabled ? 'bg-red-500' : 'bg-green-500'}`} />
                        {user.disabled ? 'Deaktivert' : 'Aktiv'}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Switch 
                          checked={!user.disabled}
                          disabled={user.id === dbUser?.id}
                          onCheckedChange={() => handleToggleUserStatus(user)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DATA MANAGEMENT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DatabaseIcon className="h-5 w-5" /> Datahåndtering</CardTitle>
          <CardDescription>Importer eller eksporter data fra din organisasjon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            
            {dbUser?.orgId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 border rounded-xl p-4 bg-slate-50">
                        <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <Download className="h-4 w-4" /> Eksport (Backup)
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                                Last ned en komplett kopi av dine steder, ruter og kjøretøy som en JSON-fil. 
                                Du kan bruke denne filen som en sikkerhetskopi.
                            </p>
                        </div>
                        <DataExport orgId={dbUser.orgId} />
                    </div>

                    <div className="space-y-4 border rounded-xl p-4 bg-slate-50">
                        <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <Upload className="h-4 w-4" /> Import (Gjenopprett)
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                                Last opp en tidligere eksportert JSON-fil for å gjenopprette data. 
                                <span className="font-bold text-amber-600 block mt-1">Advarsel: Dette vil overskrive eksisterende data.</span>
                            </p>
                        </div>
                        <DataImport orgId={dbUser.orgId} />
                    </div>
                </div>
            )}

            <div className="pt-6 border-t">
                {dbUser?.orgId && <DeleteOrganization orgId={dbUser.orgId} />}
            </div>

        </CardContent>
      </Card>
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
