'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, TrendingUp, Users, MapPin, Truck, Building2, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { superDB } from '@/lib/firebase/super'; 
import { Organization, Order, Vehicle, User } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card as TremorCard, Metric, Text, Flex, ProgressBar, AreaChart } from '@tremor/react';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, differenceInDays, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/**
 * Representasjon av månedsbasert statistikk for ordrevolum.
 */
interface MonthlyData {
    date: string;
    start: Date;
    end: Date;
    count: number;
}

/**
 * OwnerDashboard er hovedvisningen for organisasjonens eiere og ledelse.
 * 
 * Dashbordet gir en høynivå oversikt over:
 * - Kjerne-beregninger (Brukere, Adressedatabase, Flåte)
 * - Veksttrender (Ordrevolum over tid)
 * - Samsvarsstatus (Compliance for fartsskriver og sjåførkort)
 * - Abonnement og API-integrasjoner
 * 
 * Kompononentet håndterer automatisk autorisasjonssjekk (kun 'owner' eller 'super_admin')
 * og henter sanntidsdata fra organisasjonens samlinger.
 * 
 * @example
 * ```tsx
 * <OwnerDashboard />
 * ```
 */
export default function OwnerDashboard() {
  const { dbUser, loading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState({ users: 0, places: 0, vehicles: 0, orders: 0 });
  const [chartData, setChartData] = useState<{ date: string; Ordrer: number }[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
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

  /**
   * Henter alle nødvendige data for organisasjonen.
   * 
   * @param orgId - ID-en til organisasjonen som skal lastes.
   */
  const loadData = async (orgId: string) => {
    setIsLoading(true);
    try {
      const [org, orgStats, allOrders, allVehicles, allUsers] = await Promise.all([
        firebaseDB.getOrganization(orgId),
        superDB.getOrgStats(orgId),
        firebaseDB.getOrders(orgId),
        firebaseDB.getVehicles(orgId),
        firebaseDB.getUsers(orgId)
      ]);

      setOrganization(org);
      setStats(orgStats);
      setVehicles(allVehicles);
      setDrivers(allUsers.filter(u => u.role === 'driver' || u.role === 'contractor'));
      processChartData(allOrders);
      
    } catch (error: any) {
      console.error("Error loading owner data:", error);
      toast({
        title: "Feil ved lasting",
        description: "Kunne ikke hente organisasjonsdata.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Beregner månedlig ordrevolum for de siste 6 månedene.
   * 
   * @param orders - Listen over alle ordrer i organisasjonen.
   */
  const processChartData = (orders: Order[]) => {
      const last6Months: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
          const d = subMonths(new Date(), i);
          last6Months.push({
              date: format(d, 'MMM yy', { locale: nb }),
              start: startOfMonth(d),
              end: endOfMonth(d),
              count: 0
          });
      }

      orders.forEach(order => {
          let orderDate: Date;
          if (!order.createdAt) return;
          
          if ((order.createdAt as any).toDate) {
              orderDate = (order.createdAt as any).toDate();
          } else if (order.createdAt instanceof Date) {
              orderDate = order.createdAt;
          } else {
              return;
          }

          last6Months.forEach(month => {
              if (isWithinInterval(orderDate, { start: month.start, end: month.end })) {
                  month.count++;
              }
          });
      });

      setChartData(last6Months.map(m => ({
          date: m.date,
          Ordrer: m.count
      })));
  };

  /**
   * Beregner samsvarsstatus (Compliance) for flåte og sjåfører.
   * Returnerer prosentsatser for nedlastinger som er innenfor fristen.
   */
  const complianceStats = useMemo(() => {
    const today = new Date();
    
    // Fleet: 90 days requirement
    const heavyVehicles = vehicles.filter(v => v.type === 'truck' || v.type === 'tractor');
    const fleetCompliant = heavyVehicles.filter(v => {
        if (!v.lastTachoDownloadDate) return false;
        return differenceInDays(today, parseISO(v.lastTachoDownloadDate)) <= 90;
    }).length;
    
    // Drivers: 28 days requirement
    const driversCompliant = drivers.filter(d => {
        if (!d.lastTachoDownloadDate) return false;
        return differenceInDays(today, parseISO(d.lastTachoDownloadDate)) <= 28;
    }).length;

    return {
        fleet: heavyVehicles.length > 0 ? (fleetCompliant / heavyVehicles.length) * 100 : 100,
        drivers: drivers.length > 0 ? (driversCompliant / drivers.length) * 100 : 100,
        fleetTotal: heavyVehicles.length,
        driversTotal: drivers.length
    };
  }, [vehicles, drivers]);

  if (loading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase italic text-slate-800">
            {organization?.name || 'Executive'} <span className="text-slate-400">Oversikt</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Overordnet statistikk og samsvarsstatus for bedriften.
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

      {/* COMPLIANCE DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TremorCard className="shadow-sm border-slate-200 ring-0 border" decoration="left" decorationColor={complianceStats.fleet >= 95 ? "emerald" : "orange"}>
              <Flex alignItems="center" className="gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <ShieldCheck className={cn("h-6 w-6", complianceStats.fleet >= 95 ? "text-emerald-500" : "text-orange-500")} />
                  </div>
                  <div className="flex-1">
                      <Text className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Samsvar Flåte (90 dager)</Text>
                      <Metric className="text-xl font-black text-slate-800 mt-1">{complianceStats.fleet.toFixed(0)}%</Metric>
                  </div>
                  {complianceStats.fleet < 100 && <AlertCircle className="h-4 w-4 text-orange-400" />}
              </Flex>
              <ProgressBar value={complianceStats.fleet} color={complianceStats.fleet >= 95 ? "emerald" : "orange"} className="mt-4" />
              <Text className="mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  {complianceStats.fleetTotal} enheter under overvåkning
              </Text>
          </TremorCard>

          <TremorCard className="shadow-sm border-slate-200 ring-0 border" decoration="left" decorationColor={complianceStats.drivers >= 95 ? "emerald" : "orange"}>
              <Flex alignItems="center" className="gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Users className={cn("h-6 w-6", complianceStats.drivers >= 95 ? "text-emerald-500" : "text-orange-500")} />
                  </div>
                  <div className="flex-1">
                      <Text className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Samsvar Sjåførkort (28 dager)</Text>
                      <Metric className="text-xl font-black text-slate-800 mt-1">{complianceStats.drivers.toFixed(0)}%</Metric>
                  </div>
                  {complianceStats.drivers < 100 && <AlertCircle className="h-4 w-4 text-orange-400" />}
              </Flex>
              <ProgressBar value={complianceStats.drivers} color={complianceStats.drivers >= 95 ? "emerald" : "orange"} className="mt-4" />
              <Text className="mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  {complianceStats.driversTotal} sjåfører under overvåkning
              </Text>
          </TremorCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LIVE VISUALIZATION */}
          <TremorCard className="shadow-md border-slate-200">
              <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Vekst i Ordrer</CardTitle>
                  <CardDescription>Oversikt over ordrevolum de siste 6 månedene.</CardDescription>
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
