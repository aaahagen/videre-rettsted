'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Globe, LayoutGrid, Zap, MoreVertical, Edit2, Trash2, Megaphone, Search, PlusCircle, Users, UserX, ShieldCheck, Mail, Briefcase, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { superDB } from '@/lib/firebase/super';
import { Organization, User } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { firebaseAuth } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils';

/**
 * SuperAdminPage er plattformens kontrollpanel for Super Admins.
 * Her administreres alle organisasjoner, modultilganger, og globale brukere.
 */
export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState('organizations');
  const { dbUser, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Organizations State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgStats, setOrgStats] = useState<Record<string, any>>({});
  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, totalPlaces: 0, completedRoutes: 0 });
  
  // Users State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Partial<Organization> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isCreating, setIsCreateSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Search State for Organizations
  const [orgSearchQuery, setOrgSearchQuery] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!dbUser || dbUser.role !== 'super_admin') {
        router.push('/dashboard');
      } else {
        loadData();
      }
    }
  }, [dbUser, loading, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [orgs, stats] = await Promise.all([
        superDB.getAllOrganizations(),
        superDB.getGlobalPlatformStats()
      ]);
      setOrganizations(orgs);
      setGlobalStats(stats);
      
      // Fetch stats for all orgs in parallel
      const statsPromises = orgs.map(async (org) => {
        const orgStatsData = await superDB.getOrgStats(org.id);
        return { id: org.id, stats: orgStatsData };
      });
      const resolvedStats = await Promise.all(statsPromises);
      const statsMap: Record<string, any> = {};
      resolvedStats.forEach(item => {
        statsMap[item.id] = item.stats;
      });
      setOrgStats(statsMap);
    } catch (error: any) {
      toast({
        title: "Feil ved lasting",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setIsUsersLoading(true);
    try {
      const users = await superDB.getGlobalUsers();
      setAllUsers(users);
    } catch (error: any) {
      toast({ title: "Feil ved lasting av brukere", description: error.message, variant: "destructive" });
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && allUsers.length === 0) {
      loadAllUsers();
    }
  }, [activeTab]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.id.includes(userSearchQuery)
    );
  }, [allUsers, userSearchQuery]);

  const handleDeleteUserGlobal = async (uid: string) => {
    if (!confirm("Vil du slette denne brukeren permanent fra hele plattformen?")) return;
    try {
      await firebaseAuth.deleteUser(uid);
      setAllUsers(prev => prev.filter(u => u.id !== uid));
      toast({ title: "Bruker slettet" });
    } catch (error: any) {
      toast({ title: "Feil ved sletting", description: error.message, variant: "destructive" });
    }
  };

  const handleSendBroadcast = async () => {
      if (!broadcastMessage.trim() || !dbUser) return;
      setIsSendingBroadcast(true);
      try {
          await superDB.sendGlobalBroadcast(dbUser.id, broadcastMessage.trim());
          toast({ title: "Melding sendt", description: "Systemmelding er sendt ut til alle organisasjoner." });
          setBroadcastMessage('');
      } catch (error: any) {
          toast({ title: "Kunne ikke sende", description: error.message, variant: "destructive" });
      } finally {
          setIsSendingBroadcast(false);
      }
  };

  const handleModuleToggle = async (orgId: string, module: keyof NonNullable<Organization['modules']>, currentVal: boolean) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org) return;

    const updatedModules = {
      ...(org.modules || {
        places: true,
        learning: false,
        messages: false,
        fleet: false,
        workforce: false,
        logistics: false,
        analytics: false,
        hms: false,
        danger_reports: false
      }),
      [module]: !currentVal
    };

    try {
      await superDB.updateOrganizationModules(orgId, updatedModules);
      setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, modules: updatedModules } : o));
      toast({ title: "Modul oppdatert", description: `Modulen ${module} ble endret for ${org.name}.` });
    } catch (error: any) {
      toast({ title: "Kunne ikke oppdatere", description: error.message, variant: "destructive" });
    }
  };

  const handlePlanChange = async (orgId: string, plan: Organization['plan']) => {
    try {
      let newModules = undefined;
      if (plan === 'enterprise') {
          newModules = { places: true, learning: true, messages: true, fleet: true, workforce: true, logistics: true, analytics: true, hms: true, danger_reports: true };
      } else if (plan === 'pro') {
          newModules = { places: true, learning: false, messages: true, fleet: true, workforce: true, logistics: true, analytics: false, hms: true, danger_reports: true };
      } else if (plan === 'free') {
          newModules = { places: true, learning: false, messages: false, fleet: false, workforce: false, logistics: true, analytics: false, hms: false, danger_reports: false };
      }

      const updates: Partial<Organization> = { plan };
      if (newModules) updates.modules = newModules;

      await superDB.updateOrganizationDetails(orgId, updates);
      
      setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, plan, ...(newModules ? {modules: newModules} : {}) } : o));
      toast({ title: "Abonnement oppdatert", description: `Satt til ${plan} og oppdaterte moduler.` });
    } catch (error: any) {
      toast({ title: "Kunne ikke oppdatere abonnement", variant: "destructive" });
    }
  };

  const handleStatusChange = async (orgId: string, status: Organization['status']) => {
    try {
      await superDB.updateOrganizationStatus(orgId, status);
      setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, status } : o));
      toast({ title: "Status oppdatert" });
    } catch (error: any) {
      toast({ title: "Kunne ikke oppdatere status", variant: "destructive" });
    }
  };

  const handleSwitchOrg = async (orgId: string) => {
    if (!dbUser) return;
    setIsSwitching(orgId);
    try {
      await superDB.switchToOrganization(dbUser.id, orgId);
      toast({
        title: "Byttet organisasjon",
        description: "Du ser nå data for den valgte organisasjonen.",
      });
      setTimeout(() => {
          router.push('/dashboard');
      }, 500);
    } catch (error: any) {
      toast({
        title: "Kunne ikke bytte",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSwitching(null);
    }
  };

  const handleCreateOrg = async () => {
      if (!newOrgName.trim()) return;
      setIsCreateSaving(true);
      try {
          const newId = await superDB.createOrganization(newOrgName.trim());
          toast({ title: "Organisasjon opprettet", description: `${newOrgName} har blitt opprettet med ID: ${newId}` });
          setNewOrgName('');
          setIsCreateModalOpen(false);
          loadData();
      } catch (error: any) {
          toast({ title: "Feil ved opprettelse", description: error.message, variant: "destructive" });
      } finally {
          setIsCreateSaving(false);
      }
  };

  const handleSaveEdit = async () => {
      if (!editingOrg || !editingOrg.id) return;
      setIsSaving(true);
      try {
          await superDB.updateOrganizationDetails(editingOrg.id, {
              name: editingOrg.name,
              orgNumber: editingOrg.orgNumber
          });
          setOrganizations(prev => prev.map(o => o.id === editingOrg.id ? { ...o, ...editingOrg } : o));
          toast({ title: "Organisasjon oppdatert" });
          setIsEditModalOpen(false);
      } catch (error: any) {
          toast({ title: "Feil ved oppdatering", description: error.message, variant: "destructive" });
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteOrg = async () => {
      if (!orgToDelete) return;
      if (deleteConfirmation !== orgToDelete.name) {
          toast({ title: "Feil bekreftelse", description: "Du må skrive inn nøyaktig navn for å slette.", variant: "destructive" });
          return;
      }

      setIsDeleting(true);
      try {
          await superDB.deleteOrganizationHard(orgToDelete.id);
          setOrganizations(prev => prev.filter(o => o.id !== orgToDelete.id));
          toast({ title: "Organisasjon slettet", description: `${orgToDelete.name} er nå fjernet.` });
          setIsDeleteModalOpen(false);
          setOrgToDelete(null);
          setDeleteConfirmation('');
      } catch (error: any) {
          toast({ title: "Feil ved sletting", description: error.message, variant: "destructive" });
      } finally {
          setIsDeleting(false);
      }
  };

  const filteredOrganizations = organizations.filter(org => {
      return org.name.toLowerCase().includes(orgSearchQuery.toLowerCase()) || org.id.includes(orgSearchQuery);
  });

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase italic flex items-center gap-2 sm:gap-3">
            <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            Super Admin <span className="text-slate-400">Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Global oversikt over alle organisasjoner og moduler.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold h-10 shadow-none"
            >
                <PlusCircle className="h-4 w-4 mr-2" /> Ny Organisasjon
            </Button>

            <Card className="p-3 border-2 border-slate-100 shadow-none w-full sm:w-auto flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Totale Brukere</span>
                    <span className="text-sm font-black leading-none">{globalStats.totalUsers}</span>
                </div>
                <div className="flex flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Totale Steder</span>
                    <span className="text-sm font-black leading-none">{globalStats.totalPlaces}</span>
                </div>
                <div className="flex flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fullførte Ruter</span>
                    <span className="text-sm font-black leading-none">{globalStats.completedRoutes}</span>
                </div>
            </Card>
        </div>
      </div>

      <Tabs defaultValue="organizations" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100 p-1">
              <TabsTrigger value="organizations" className="font-bold uppercase text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Building2 className="h-3.5 w-3.5 mr-2" /> Organisasjoner
              </TabsTrigger>
              <TabsTrigger value="users" className="font-bold uppercase text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Users className="h-3.5 w-3.5 mr-2" /> Global Brukerliste
              </TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    <Card className="border-2 border-slate-100 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b p-4">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Megaphone className="h-4 w-4 text-indigo-500" /> Systemmelding (Global Broadcast)
                            </CardTitle>
                            <CardDescription className="text-xs">Send en viktig melding til alle brukere på tvers av alle organisasjoner.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <Textarea 
                                placeholder="Skriv inn meldingsteksten her..." 
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                className="min-h-[80px] text-sm"
                            />
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleSendBroadcast} 
                                    disabled={isSendingBroadcast || !broadcastMessage.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 font-bold h-9"
                                >
                                    {isSendingBroadcast ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Megaphone className="h-4 w-4 mr-2" />}
                                    Send til alle
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col justify-end">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Søk organisasjon..." 
                            value={orgSearchQuery}
                            onChange={(e) => setOrgSearchQuery(e.target.value)}
                            className="pl-9 h-11 bg-white border-slate-200 shadow-sm rounded-xl font-bold"
                        />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {filteredOrganizations.map((org) => (
                  <Card key={org.id} className={`overflow-hidden border-2 transition-all ${dbUser?.orgId === org.id ? 'border-blue-600 ring-4 ring-blue-600/5' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
                    <div className="bg-white border-b p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-black text-base sm:text-lg text-slate-800 uppercase tracking-tight truncate">{org.name}</h3>
                            {dbUser?.orgId === org.id && <Badge className="bg-blue-600 uppercase text-[8px] sm:text-[10px]">Aktiv</Badge>}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="font-mono text-[8px] sm:text-[10px] px-1.5 py-0 bg-slate-50 text-slate-500 border-slate-200">{org.id.substring(0, 8)}</Badge>
                            <Badge className={`text-[8px] sm:text-[10px] px-1.5 py-0 ${org.status === 'active' ? 'bg-emerald-500' : org.status === 'suspended' ? 'bg-red-500' : 'bg-amber-500'}`}>
                              {org.status === 'active' ? 'Aktiv' : org.status === 'suspended' ? 'Suspendert' : 'Prøveperiode'}
                            </Badge>
                            <Badge variant="outline" className={`text-[8px] sm:text-[10px] px-1.5 py-0 uppercase border-slate-200 ${org.plan === 'enterprise' ? 'bg-indigo-50 text-indigo-700' : org.plan === 'pro' ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'}`}>
                              {org.plan || 'Free'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="hidden sm:flex items-center gap-2">
                          <Button 
                              variant={dbUser?.orgId === org.id ? "secondary" : "default"} 
                              size="sm" 
                              className="font-bold text-xs shadow-none"
                              disabled={dbUser?.orgId === org.id || isSwitching !== null}
                              onClick={() => handleSwitchOrg(org.id)}
                          >
                              {isSwitching === org.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                              {dbUser?.orgId === org.id ? 'Valgt' : 'Logg inn'}
                          </Button>
                          
                          <Select value={org.plan || 'free'} onValueChange={(val: any) => handlePlanChange(org.id, val)}>
                            <SelectTrigger className="w-24 font-bold h-8 text-xs bg-slate-50 shadow-none border-slate-200">
                              <SelectValue placeholder="Plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select value={org.status || 'trial'} onValueChange={(val: any) => handleStatusChange(org.id, val)}>
                            <SelectTrigger className="w-28 font-bold h-8 text-xs shadow-none border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Aktiv</SelectItem>
                              <SelectItem value="trial">Prøve</SelectItem>
                              <SelectItem value="suspended">Suspendert</SelectItem>
                            </SelectContent>
                          </Select>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 shadow-none border-slate-200">
                                <MoreVertical className="h-4 w-4 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingOrg(org); setIsEditModalOpen(true); }}>
                                  <Edit2 className="h-4 w-4 mr-2" /> Rediger Org
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setOrgToDelete(org); setIsDeleteModalOpen(true); }} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" /> Slett organisasjon
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-0">
                      <div className="grid grid-cols-4 divide-x border-b bg-slate-50/50">
                          <div className="p-3 sm:p-4 text-center">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Brukere</p>
                              <p className="text-lg sm:text-xl font-black text-slate-800">{orgStats[org.id]?.users ?? <Loader2 className="h-4 w-4 animate-spin text-slate-300 mx-auto"/>}</p>
                          </div>
                          <div className="p-3 sm:p-4 text-center">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Steder</p>
                              <p className="text-lg sm:text-xl font-black text-slate-800">{orgStats[org.id]?.places ?? <Loader2 className="h-4 w-4 animate-spin text-slate-300 mx-auto"/>}</p>
                          </div>
                          <div className="p-3 sm:p-4 text-center">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Kjøretøy</p>
                              <p className="text-lg sm:text-xl font-black text-slate-800">{orgStats[org.id]?.vehicles ?? <Loader2 className="h-4 w-4 animate-spin text-slate-300 mx-auto"/>}</p>
                          </div>
                          <div className="p-3 sm:p-4 text-center">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Ordrer</p>
                              <p className="text-lg sm:text-xl font-black text-slate-800">{orgStats[org.id]?.orders ?? <Loader2 className="h-4 w-4 animate-spin text-slate-300 mx-auto"/>}</p>
                          </div>
                      </div>

                      <div className="p-4 sm:p-5 space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                              <LayoutGrid className="h-3 w-3" /> Moduler
                          </h4>
                          <div className="flex flex-wrap gap-2">
                          {[
                              { id: 'places', label: 'RettSted', core: true },
                              { id: 'logistics', label: 'Logistikk' },
                              { id: 'fleet', label: 'Flåte' },
                              { id: 'workforce', label: 'Ansatte' },
                              { id: 'learning', label: 'Læring' },
                              { id: 'messages', label: 'Meldinger' },
                              { id: 'hms', label: 'HMS' },
                              { id: 'danger_reports', label: 'Avvik' },
                              { id: 'analytics', label: 'Statistikk' },
                          ].map((mod) => (
                              <div key={mod.id} className={`flex items-center pr-3 py-1 rounded-full border ${mod.core || (org.modules as any)?.[mod.id] ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                              <Switch
                                  id={`${org.id}-${mod.id}`}
                                  disabled={mod.core}
                                  className="scale-50 origin-left ml-1 data-[state=checked]:bg-indigo-600"
                                  checked={mod.core || !!(org.modules as any)?.[mod.id]}
                                  onCheckedChange={() => handleModuleToggle(org.id, mod.id as any, !!(org.modules as any)?.[mod.id])}
                              />
                              <Label htmlFor={`${org.id}-${mod.id}`} className={`text-[10px] sm:text-xs font-black uppercase tracking-tight cursor-pointer -ml-1 ${mod.core || (org.modules as any)?.[mod.id] ? 'text-indigo-700' : 'text-slate-400'}`}>
                                  {mod.label}
                              </Label>
                              </div>
                          ))}
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-6">
              <Card className="border-2 border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b p-4 sm:p-6">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg text-white">
                              <Users className="h-5 w-5" />
                          </div>
                          <div>
                              <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tight">Global Brukerliste</CardTitle>
                              <CardDescription className="text-xs font-medium">Oversikt over alle registrerte brukere på plattformen.</CardDescription>
                          </div>
                      </div>
                      <div className="relative w-full md:w-80">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                              placeholder="Søk navn, e-post eller ID..." 
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              className="pl-9 h-11 bg-white border-slate-200 rounded-xl font-bold shadow-sm"
                          />
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isUsersLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="w-full">
                            {/* Desktop View: Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b">
                                        <tr>
                                            <th className="px-6 py-4">Bruker</th>
                                            <th className="px-6 py-4">Organisasjon</th>
                                            <th className="px-6 py-4">Rolle</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Handlinger</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{u.name || 'Uten navn'}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="font-bold text-[10px] bg-white border-slate-200 text-slate-600 px-2">
                                                        {organizations.find(o => o.id === u.orgId)?.name || u.orgId?.substring(0, 8)}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn(
                                                        "uppercase text-[10px] font-black px-2 py-0.5",
                                                        u.role === 'super_admin' ? 'bg-purple-600' : 
                                                        u.role === 'owner' || u.role === 'admin' ? 'bg-blue-600' : 'bg-slate-500'
                                                    )}>
                                                        {u.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn(
                                                        "text-[10px] font-black uppercase px-2 py-0.5",
                                                        u.status === 'paused' ? 'bg-amber-500' : 'bg-emerald-500'
                                                    )}>
                                                        {u.status || 'active'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {u.role === 'super_admin' ? (
                                                            <ShieldCheck className="h-5 w-5 text-purple-600" />
                                                        ) : (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="h-8 text-destructive hover:text-white hover:bg-red-500 font-bold text-xs"
                                                                onClick={() => handleDeleteUserGlobal(u.id)}
                                                            >
                                                                <UserX className="h-4 w-4 mr-2" /> Slett
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 text-xs font-bold border-slate-200" 
                                                            onClick={() => handleSwitchOrg(u.orgId)}
                                                        >
                                                            <ExternalLink className="h-3 w-3 mr-2" /> Gå til org
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile/Tablet View: Stacked Layout */}
                            <div className="lg:hidden divide-y divide-slate-100">
                                {filteredUsers.map((u) => (
                                    <div key={u.id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate">{u.name || 'Uten navn'}</h4>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-medium">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">{u.email}</span>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "shrink-0 text-[10px] font-black uppercase px-2",
                                                u.status === 'paused' ? 'bg-amber-500' : 'bg-emerald-500'
                                            )}>
                                                {u.status || 'active'}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                                <Building2 className="h-3 w-3" />
                                                {organizations.find(o => o.id === u.orgId)?.name || 'Ukjent org'}
                                            </div>
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase text-white",
                                                u.role === 'super_admin' ? 'bg-purple-600' : 
                                                u.role === 'owner' || u.role === 'admin' ? 'bg-blue-600' : 'bg-slate-500'
                                            )}>
                                                <Briefcase className="h-3 w-3" />
                                                {u.role}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                            {u.role !== 'super_admin' ? (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full text-destructive hover:bg-red-50 border-slate-200 font-bold h-9"
                                                    onClick={() => handleDeleteUserGlobal(u.id)}
                                                >
                                                    <UserX className="h-4 w-4 mr-2" /> Slett bruker
                                                </Button>
                                            ) : (
                                                <div className="flex items-center justify-center h-9 text-[10px] font-black uppercase text-purple-600">
                                                    <ShieldCheck className="h-4 w-4 mr-2" /> Systembeskyttet
                                                </div>
                                            )}
                                            <Button 
                                                variant="default" 
                                                size="sm" 
                                                className="w-full h-9 font-bold shadow-none bg-slate-900" 
                                                onClick={() => handleSwitchOrg(u.orgId)}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" /> Gå til org
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredUsers.length === 0 && (
                                <div className="py-20 text-center text-slate-400 font-medium">
                                    Ingen brukere matchet søket.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
              </Card>
          </TabsContent>
      </Tabs>

      {/* Create Organization Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Opprett Ny Organisasjon</DialogTitle>
            <DialogDescription>
                Dette vil opprette en ny organisasjon på plattformen. Du må invitere den første eieren manuelt etterpå.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Organisasjonsnavn</Label>
              <Input 
                placeholder="F.eks. Transport AS"
                value={newOrgName} 
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Avbryt</Button>
            <Button onClick={handleCreateOrg} disabled={isCreating || !newOrgName.trim()} className="bg-blue-600 hover:bg-blue-700">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Opprett
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger Organisasjon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Organisasjonsnavn</Label>
              <Input 
                value={editingOrg?.name || ''} 
                onChange={(e) => setEditingOrg(prev => prev ? {...prev, name: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Organisasjonsnummer</Label>
              <Input 
                value={editingOrg?.orgNumber || ''} 
                onChange={(e) => setEditingOrg(prev => prev ? {...prev, orgNumber: e.target.value} : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Avbryt</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving || !editingOrg?.name}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Lagre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={(open) => {
          if (!open) {
              setDeleteConfirmation('');
              setOrgToDelete(null);
          }
          setIsDeleteModalOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Slett Organisasjon Permanent</DialogTitle>
            <DialogDescription>
                Dette er en irreversibel handling. Sletting av {orgToDelete?.name} vil slette selve organisasjonsdokumentet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>For å bekrefte, skriv inn: <strong>{orgToDelete?.name}</strong></Label>
              <Input 
                value={deleteConfirmation} 
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={orgToDelete?.name}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Avbryt</Button>
            <Button 
                variant="destructive" 
                onClick={handleDeleteOrg} 
                disabled={isDeleting || deleteConfirmation !== orgToDelete?.name}
            >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Slett Permanent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
