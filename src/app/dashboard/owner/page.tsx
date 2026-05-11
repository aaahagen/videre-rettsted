'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, TrendingUp, Users, MapPin, Truck, Building2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { superDB } from '@/lib/firebase/super'; 
import { Organization, User } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card as TremorCard, Metric, Text, Flex, ProgressBar, AreaChart } from '@tremor/react';

export default function OwnerDashboard() {
  const { dbUser, loading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState({ users: 0, places: 0, vehicles: 0, orders: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!dbUser || (dbUser.role !== 'owner' && dbUser.role !== 'super_admin')) {
        router.push('/dashboard');
      } else if (dbUser.orgId) {
        loadData(dbUser.orgId);
      }
    }
  }, [dbUser, loading, router]);

  const loadData = async (orgId: string) => {
    setIsLoading(true);
    try {
      const org = await firebaseDB.getOrganization(orgId);
      setOrganization(org);
      
      const orgStats = await superDB.getOrgStats(orgId);
      setStats(orgStats);
    } catch (error: any) {
      toast({
        title: "Feil ved lasting",
        description: "Kunne ikke hente organisasjonsdata.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const chartData = [
    { date: 'Jan 24', Ordrer: 167 },
    { date: 'Feb 24', Ordrer: 254 },
    { date: 'Mar 24', Ordrer: 450 },
    { date: 'Apr 24', Ordrer: 680 },
    { date: 'Mai 24', Ordrer: 910 },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase italic text-slate-800">
            {organization?.name || 'Executive'} <span className="text-slate-400">Oversikt</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Overordnet statistikk og abonnement for bedriften.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="uppercase font-black text-slate-400 border-slate-200 shadow-none text-[10px] py-1 px-2">
                Kunde: {organization?.id.substring(0,8)}
            </Badge>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <Users className="h-3 w-3" /> Aktive Brukere
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-slate-800">{stats.users}</div>
            </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Adressedatabase
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-slate-800">{stats.places}</div>
            </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <Truck className="h-3 w-3" /> Flåtestørrelse
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-3xl font-black text-slate-800">{stats.vehicles}</div>
            </CardContent>
        </Card>
        
        {/* PILOT: Tremor Metric Card */}
        <TremorCard className="shadow-sm border-slate-200 ring-0 border" decoration="top" decorationColor="indigo">
            <Flex alignItems="start">
                <div className="truncate">
                    <Text className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Totale Ordrer</Text>
                    <Metric className="font-black text-indigo-600 leading-none mt-1">{stats.orders}</Metric>
                </div>
                <TrendingUp className="h-4 w-4 text-indigo-400" />
            </Flex>
            <Flex className="mt-4">
                <Text className="truncate text-[10px] uppercase font-bold text-slate-400">Måloppnåelse</Text>
                <Text className="text-[10px] font-black text-slate-600">{(stats.orders / 1000 * 100).toFixed(0)}%</Text>
            </Flex>
            <ProgressBar value={(stats.orders / 1000 * 100)} color="indigo" className="mt-2" />
        </TremorCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LIVE VISUALIZATION */}
          <TremorCard className="shadow-md border-slate-200">
              <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Vekst i Ordrer</CardTitle>
                  <CardDescription>Oversikt over ordrevolum de siste 5 månedene.</CardDescription>
              </CardHeader>
              <AreaChart
                className="h-72 mt-4"
                data={chartData}
                index="date"
                categories={['Ordrer']}
                colors={['indigo']}
                valueFormatter={(number) => `${Intl.NumberFormat('no').format(number).toString()}`}
                yAxisWidth={60}
              />
          </TremorCard>

          {/* Subscription Card */}
          <Card className="shadow-md border-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Globe className="h-48 w-48 text-indigo-900" />
              </div>
              <CardHeader className="bg-slate-50 border-b p-6">
                  <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-indigo-500" /> Abonnement & API
                  </CardTitle>
                  <CardDescription>Administrer planen din og integrasjoner.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6 relative z-10">
                  <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aktiv Plan</p>
                      <div className="flex items-center gap-3">
                          <span className="text-2xl font-black capitalize text-slate-800">{organization?.plan || 'Free'}</span>
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">Aktiv</Badge>
                      </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Integrasjoner</p>
                      <Button variant="outline" className="w-full justify-between font-bold" onClick={() => toast({title: "Kommer snart", description: "API Nøkler vil bli tilgjengelig i fase 7."})}>
                          Generer API Nøkkel for Eksport
                          <ExternalLink className="h-4 w-4 ml-2 text-slate-400" />
                      </Button>
                      <Button variant="outline" className="w-full justify-between font-bold" onClick={() => toast({title: "Kommer snart", description: "Faktureringsportal vil bli tilgjengelig i fase 7."})}>
                          Gå til Faktureringsportal (Stripe)
                          <ExternalLink className="h-4 w-4 ml-2 text-slate-400" />
                      </Button>
                  </div>
              </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card className="shadow-md border-slate-200 lg:col-span-2">
              <CardHeader className="bg-slate-50 border-b p-6">
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Kjernefunksjoner</CardTitle>
                  <CardDescription>Direkte tilgang til bedriftens masterdata.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/dashboard/places" className="block">
                          <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center justify-between group h-full">
                              <div>
                                  <h4 className="font-black text-slate-800 group-hover:text-indigo-700">Adressedatabasen (RettSted)</h4>
                                  <p className="text-xs text-slate-500">Søk i, opprett eller rediger bedriftens lokasjoner.</p>
                              </div>
                              <ExternalLink className="h-5 w-5 text-slate-300 group-hover:text-indigo-400" />
                          </div>
                      </Link>
                      
                      <Link href="/dashboard/admin" className="block">
                          <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center justify-between group h-full">
                              <div>
                                  <h4 className="font-black text-slate-800 group-hover:text-indigo-700">Administrasjon & Ansatte</h4>
                                  <p className="text-xs text-slate-500">Gå til daglig admin for å invitere ansatte eller endre tilganger.</p>
                              </div>
                              <ExternalLink className="h-5 w-5 text-slate-300 group-hover:text-indigo-400" />
                          </div>
                      </Link>
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
