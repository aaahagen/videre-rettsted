'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Users, ShieldCheck, Settings, Globe, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { superDB } from '@/lib/firebase/super';
import { Organization } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
  const { dbUser, loading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ total: 0, admins: 0, drivers: 0 });
  const { toast } = useToast();
  const router = useRouter();

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

  const handleStatusChange = async (orgId: string, status: Organization['status']) => {
    try {
      await superDB.updateOrganizationStatus(orgId, status);
      setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, status } : o));
      toast({ title: "Status oppdatert" });
    } catch (error: any) {
      toast({ title: "Kunne ikke oppdatere status", variant: "destructive" });
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <Globe className="h-10 w-10 text-blue-600" />
            Super Admin <span className="text-slate-400">Control</span>
          </h1>
          <p className="text-slate-500 font-medium">Global oversikt over alle organisasjoner og moduler.</p>
        </div>
        <div className="flex gap-4">
            <Card className="px-6 py-2 border-2 border-slate-100 shadow-none">
                <p className="text-[10px] font-black uppercase text-slate-400">Totale Brukere</p>
                <p className="text-xl font-black">{globalStats.total}</p>
            </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {organizations.map((org) => (
          <Card key={org.id} className="overflow-hidden border-2 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-50 border-b p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white border flex items-center justify-center shadow-sm">
                  <Building2 className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{org.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{org.id}</Badge>
                    <Badge className={org.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}>
                      {org.status || 'trial'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select value={org.status || 'trial'} onValueChange={(val: any) => handleStatusChange(org.id, val)}>
                  <SelectTrigger className="w-32 font-bold h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="trial">Prøveperiode</SelectItem>
                    <SelectItem value="suspended">Suspendert</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="font-bold">Se Detaljer</Button>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <LayoutGrid className="h-3 w-3" /> Moduler
                  </h4>
                  <div className="space-y-3">
                    {[
                      { id: 'places', label: 'RettSted (Steder)', core: true },
                      { id: 'learning', label: 'Læringsportal' },
                      { id: 'messages', label: 'Meldinger' },
                      { id: 'fleet', label: 'Bilpark / Flåte' },
                      { id: 'workforce', label: 'Timelister / Ansatte' },
                      { id: 'logistics', label: 'Logistikk (Rute/Scan)' },
                      { id: 'analytics', label: 'Statistikk / BI' },
                    ].map((mod) => (
                      <div key={mod.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <Label htmlFor={`${org.id}-${mod.id}`} className="text-sm font-bold text-slate-700 cursor-pointer">
                          {mod.label}
                          {mod.core && <span className="ml-2 text-[8px] bg-slate-200 text-slate-500 px-1 rounded uppercase">Core</span>}
                        </Label>
                        <Switch
                          id={`${org.id}-${mod.id}`}
                          disabled={mod.core}
                          checked={mod.core || !!(org.modules as any)?.[mod.id]}
                          onCheckedChange={() => handleModuleToggle(org.id, mod.id as any, !!(org.modules as any)?.[mod.id])}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-3">
                    <div className="bg-slate-50/50 rounded-xl border border-dashed p-8 flex flex-col items-center justify-center text-center">
                        <ShieldCheck className="h-12 w-12 text-slate-200 mb-4" />
                        <h4 className="font-black text-slate-400 uppercase tracking-tighter">Organisasjons-oversikt</h4>
                        <p className="text-xs text-slate-400 max-w-xs mt-2 font-medium">
                            Her kan vi legge til spesifikk statistikk for denne organisasjonen, som antall steder opprettet, aktive ruter i dag, og siste innlogging.
                        </p>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
