'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Globe, LayoutGrid, Zap, MoreVertical, Edit2, Trash2, Megaphone, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { superDB } from '@/lib/firebase/super';
import { Organization } from '@/lib/types';
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

export default function SuperAdminPage() {
  const [orgStats, setOrgStats] = useState<Record<string, any>>({});
  const { dbUser, loading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [globalStats, setGlobalStats] = useState({ total: 0, admins: 0, drivers: 0 });
  const { toast } = useToast();
  const router = useRouter();

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Partial<Organization> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

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
        superDB.getGlobalUserStats()
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
        analytics: false
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
      await superDB.updateOrganizationDetails(orgId, { plan });
      setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, plan } : o));
      toast({ title: "Abonnement oppdatert" });
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

  const handlePresetModules = async (orgId: string, preset: 'all' | 'logistics') => {
      const org = organizations.find(o => o.id === orgId);
      if (!org) return;
      
      const newModules = preset === 'all' 
          ? { places: true, learning: true, messages: true, fleet: true, workforce: true, logistics: true, analytics: true }
          : { places: true, learning: false, messages: false, fleet: false, workforce: false, logistics: true, analytics: false };
          
      try {
          await superDB.updateOrganizationModules(orgId, newModules);
          setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, modules: newModules } : o));
          toast({ title: "Moduler oppdatert", description: `Satt forhåndsvalg: ${preset === 'all' ? 'Enterprise' : 'Logistics Only'}` });
      } catch (error: any) {
          toast({ title: "Kunne ikke oppdatere", description: error.message, variant: "destructive" });
      }
  };

  const filteredOrganizations = organizations.filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) || org.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || (org.status || 'trial') === statusFilter;
      const matchesPlan = planFilter === 'all' || (org.plan || 'free') === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase italic flex items-center gap-2 sm:gap-3">
            <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            Super Admin <span className="text-slate-400">Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Global oversikt over alle organisasjoner og moduler.</p>
        </div>
        <div className="flex shrink-0">
            <Card className="px-4 py-2 sm:px-6 sm:py-2 border-2 border-slate-100 shadow-none w-full sm:w-auto">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Totale Brukere</p>
                <p className="text-xl sm:text-2xl font-black">{globalStats.total}</p>
            </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Søk etter navn eller ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
            />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-50 border-slate-200 focus:ring-indigo-500">
                    <Filter className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Alle Statuser</SelectItem>
                    <SelectItem value="active">Kun Aktive</SelectItem>
                    <SelectItem value="trial">Kun Prøve</SelectItem>
                    <SelectItem value="suspended">Kun Suspendert</SelectItem>
                </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-50 border-slate-200 focus:ring-indigo-500">
                    <Filter className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Alle Planer</SelectItem>
                    <SelectItem value="free">Kun Free</SelectItem>
                    <SelectItem value="pro">Kun Pro</SelectItem>
                    <SelectItem value="enterprise">Kun Enterprise</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

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
                        className="min-h-[100px] text-sm"
                    />
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleSendBroadcast} 
                            disabled={isSendingBroadcast || !broadcastMessage.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                        >
                            {isSendingBroadcast ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Megaphone className="h-4 w-4 mr-2" />}
                            Send til alle
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className={`overflow-hidden border-2 transition-all ${dbUser?.orgId === org.id ? 'border-blue-600 ring-4 ring-blue-600/5' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
            <div className="bg-slate-50 border-b p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white border flex items-center justify-center shadow-sm shrink-0">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-slate-800 uppercase tracking-tight truncate">{org.name}</h3>
                    {dbUser?.orgId === org.id && <Badge className="bg-blue-600 uppercase text-[8px] sm:text-[10px]">Aktiv i Dashboard</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[8px] sm:text-[10px] px-1.5 py-0">{org.id.substring(0, 8)}...</Badge>
                    <Badge className={`text-[8px] sm:text-[10px] px-1.5 py-0 ${org.status === 'active' ? 'bg-emerald-500' : org.status === 'suspended' ? 'bg-red-500' : 'bg-amber-500'}`}>
                      {org.status === 'active' ? 'Aktiv' : org.status === 'suspended' ? 'Suspendert' : 'Prøveperiode'}
                    </Badge>
                    <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1.5 py-0 uppercase bg-slate-50 text-slate-500 border-slate-200">
                      {org.plan || 'Free'}
                    </Badge>
                    {org.status === 'trial' && org.trialExpiresAt && (
                        <span className="text-[10px] text-slate-400 font-medium">Utløper: {new Date(org.trialExpiresAt.toDate ? org.trialExpiresAt.toDate() : org.trialExpiresAt).toLocaleDateString('no-NO')}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Desktop Buttons */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button 
                      variant={dbUser?.orgId === org.id ? "secondary" : "default"} 
                      size="sm" 
                      className="font-bold text-xs"
                      disabled={dbUser?.orgId === org.id || isSwitching !== null}
                      onClick={() => handleSwitchOrg(org.id)}
                  >
                      {isSwitching === org.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                      {dbUser?.orgId === org.id ? 'Valgt' : 'Logg inn'}
                  </Button>
                  
                  <Select value={org.plan || 'free'} onValueChange={(val: any) => handlePlanChange(org.id, val)}>
                    <SelectTrigger className="w-24 font-bold h-8 text-xs bg-slate-50">
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={org.status || 'trial'} onValueChange={(val: any) => handleStatusChange(org.id, val)}>
                    <SelectTrigger className="w-28 font-bold h-8 text-xs">
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
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingOrg(org); setIsEditModalOpen(true); }}>
                          <Edit2 className="h-4 w-4 mr-2" /> Rediger
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setOrgToDelete(org); setIsDeleteModalOpen(true); }} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Slett organisasjon
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Actions */}
                <div className="flex sm:hidden w-full gap-2">
                   <Button 
                      variant={dbUser?.orgId === org.id ? "secondary" : "default"} 
                      size="sm" 
                      className="flex-1 font-bold text-xs h-9"
                      disabled={dbUser?.orgId === org.id || isSwitching !== null}
                      onClick={() => handleSwitchOrg(org.id)}
                  >
                      {isSwitching === org.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                      {dbUser?.orgId === org.id ? 'Aktiv' : 'Bytt til org'}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(org.id, 'active')}>Sett Aktiv</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(org.id, 'trial')}>Sett Prøveperiode</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePlanChange(org.id, 'pro')}>Sett til Pro Plan</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(org.id, 'suspended')}>Suspendert</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setEditingOrg(org); setIsEditModalOpen(true); }}>Rediger</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setOrgToDelete(org); setIsDeleteModalOpen(true); }} className="text-destructive">Slett</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <LayoutGrid className="h-3 w-3" /> Moduler
                    </h4>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] uppercase font-bold tracking-tight text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700">Presets</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePresetModules(org.id, 'all')}>Enterprise (Alle)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePresetModules(org.id, 'logistics')}>Logistics Only</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {[
                      { id: 'places', label: 'RettSted (Steder)', core: true },
                      { id: 'learning', label: 'Læringsportal' },
                      { id: 'messages', label: 'Meldinger' },
                      { id: 'fleet', label: 'Bilpark / Flåte' },
                      { id: 'workforce', label: 'Timelister / Ansatte' },
                      { id: 'logistics', label: 'Logistikk (Rute/Scan)' },
                      { id: 'analytics', label: 'Statistikk / BI' },
                    ].map((mod) => (
                      <div key={mod.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 sm:bg-transparent border border-slate-100 sm:border-none">
                        <Label htmlFor={`${org.id}-${mod.id}`} className="text-xs sm:text-sm font-bold text-slate-700 cursor-pointer">
                          {mod.label}
                          {mod.core && <span className="ml-2 text-[8px] bg-slate-200 text-slate-500 px-1 rounded uppercase">Core</span>}
                        </Label>
                        <Switch
                          id={`${org.id}-${mod.id}`}
                          disabled={mod.core}
                          className="scale-75 sm:scale-100 origin-right"
                          checked={mod.core || !!(org.modules as any)?.[mod.id]}
                          onCheckedChange={() => handleModuleToggle(org.id, mod.id as any, !!(org.modules as any)?.[mod.id])}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="shadow-none border-slate-100 bg-white">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Brukere</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-black">{orgStats[org.id]?.users ?? <Loader2 className="h-4 w-4 animate-spin text-slate-300 inline-block"/>}</div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-slate-100 bg-white">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Steder</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-black">{orgStats[org.id]?.places ?? <Loader2 className="h-4 w-4 animate-spin text-slate-300 inline-block"/>}</div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-slate-100 bg-white">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kjøretøy</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-black">{orgStats[org.id]?.vehicles ?? <Loader2 className="h-4 w-4 animate-spin text-slate-300 inline-block"/>}</div>
                        </CardContent>
                      </Card>
                      <Card className="shadow-none border-slate-100 bg-white">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ordrer</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-black">{orgStats[org.id]?.orders ?? <Loader2 className="h-4 w-4 animate-spin text-slate-300 inline-block"/>}</div>
                        </CardContent>
                      </Card>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                Dette er en irreversibel handling. Sletting av {orgToDelete?.name} vil slette selve organisasjonsdokumentet. Merk at tilhørende brukere og subcollections kan bli liggende som foreldreløse dokumenter hvis de ikke ryddes via Cloud Functions.
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
