'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { ingestThirdPartyPackage } from '@/lib/db/orders';
import { Route, Place } from '@/lib/types';
import { 
  QrCode, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Loader2,
  Volume2,
  VolumeX,
  History,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ScanHistory {
  barcode: string;
  timestamp: Date;
  status: 'success' | 'error';
  isNew: boolean;
}

export default function ScanToReceivePage() {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const [barcode, setBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('none');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dbUser?.orgId) {
      firebaseDB.getRoutes(dbUser.orgId).then(setRoutes);
    }
  }, [dbUser]);

  useEffect(() => {
    // Keep input focused
    const handleFocus = () => inputRef.current?.focus();
    window.addEventListener('click', handleFocus);
    handleFocus();
    return () => window.removeEventListener('click', handleFocus);
  }, []);

  const playSound = (type: 'success' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(type === 'success' ? '/sounds/success.mp3' : '/sounds/error.mp3');
      audio.play();
    } catch (e) {
      // Audio might fail due to browser policies if user hasn't interacted
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || isProcessing) return;

    const scannedValue = barcode.trim();
    setBarcode('');
    setIsProcessing(true);

    try {
      const result = await ingestThirdPartyPackage({
        orgId: dbUser!.orgId,
        barcode: scannedValue,
        routeId: selectedRouteId === 'none' ? undefined : selectedRouteId
      });

      playSound('success');
      setHistory(prev => [{
        barcode: scannedValue,
        timestamp: new Date(),
        status: 'success' as const,
        isNew: result.isNew
      }, ...prev].slice(0, 50));

      toast({
        title: result.isNew ? "Ny pakke registrert" : "Pakke oppdatert",
        description: `Barcode: ${scannedValue}`,
        className: "bg-green-50 border-green-200",
      });

    } catch (error) {
      console.error(error);
      playSound('error');
      setHistory(prev => [{
        barcode: scannedValue,
        timestamp: new Date(),
        status: 'error' as const,
        isNew: false
      }, ...prev].slice(0, 50));

      toast({
        title: "Feil ved scanning",
        description: "Kunne ikke registrere pakken.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full p-4 space-y-6">
      
      {/* HEADER & CONTROLS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/loader">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-black text-slate-900">Inngående Mottak</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(soundEnabled ? "text-indigo-600" : "text-slate-400")}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      </div>

      {/* SCANNING ZONE */}
      <Card className="border-2 border-indigo-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-indigo-50 border-b border-indigo-100 pb-4">
          <CardTitle className="text-sm font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Skanningsinnstillinger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 ml-1">Tildel til rute (Valgfritt)</label>
            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
              <SelectTrigger className="h-12 text-base font-semibold bg-white border-2 border-slate-200">
                <SelectValue placeholder="Velg rute for automatisk tildeling" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ingen tildeling (Hub)</SelectItem>
                {routes.filter(r => r.status !== 'completed').map(route => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleScan} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {isProcessing ? (
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
              ) : (
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              )}
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Skann 3. parts strekkode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="h-16 pl-12 text-xl font-black border-4 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 bg-slate-50 focus:bg-white transition-all shadow-inner"
              disabled={isProcessing}
              autoComplete="off"
            />
          </form>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Klar for scanning
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HISTORY ZONE */}
      <div className="flex-1 flex flex-col min-h-0 space-y-3">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2 ml-1">
            <History className="h-4 w-4" />
            Siste skanninger
          </h2>
          {history.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setHistory([])}
              className="text-[10px] font-black uppercase h-7 px-2"
            >
              Tøm historikk
            </Button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pb-4 scrollbar-hide">
          {history.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed rounded-xl">
              <Package className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-tight">Venter på skanning...</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div 
                key={`${item.barcode}-${idx}`}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border animate-in slide-in-from-top-4 duration-300",
                  item.status === 'success' ? "bg-white border-slate-200" : "bg-red-50 border-red-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    item.status === 'success' ? "bg-slate-50 text-slate-700" : "bg-red-100 text-red-600"
                  )}>
                    {item.status === 'success' ? <Package className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 font-mono tracking-tight">{item.barcode}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {item.isNew && (
                        <Badge className="bg-emerald-500 text-[8px] h-3 px-1 hover:bg-emerald-500">NY</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {item.status === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
