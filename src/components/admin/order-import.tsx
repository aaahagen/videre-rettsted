'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertTriangle, FileSpreadsheet, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/db/orders';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface OrderImportProps {
  orgId: string;
}

interface OrderPreview {
  barcode: string;
  placeId: string; // Destination name/address
  description: string;
  weight?: number;
  numberOfItems: number;
  status: 'valid' | 'invalid';
  error?: string;
}

export function OrderImport({ orgId }: OrderImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<OrderPreview[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return []; // Header only or empty

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Mapping helper
    const getVal = (row: string[], search: string[]) => {
        const index = headers.findIndex(h => search.includes(h));
        return index !== -1 ? row[index]?.trim() : '';
    };

    const results: OrderPreview[] = lines.slice(1).map(line => {
      const row = line.split(',').map(v => v.trim());
      const barcode = getVal(row, ['barcode', 'strekkode', 'id', 'referanse']);
      const placeName = getVal(row, ['place', 'sted', 'mottaker', 'navn', 'adresse']);
      const description = getVal(row, ['description', 'beskrivelse', 'innhold']);
      const weight = parseFloat(getVal(row, ['weight', 'vekt'])) || 0;
      const items = parseInt(getVal(row, ['items', 'kolli', 'antall'])) || 1;

      let status: 'valid' | 'invalid' = 'valid';
      let error = '';

      if (!barcode) {
        status = 'invalid';
        error = 'Mangler strekkode';
      } else if (!placeName) {
        status = 'invalid';
        error = 'Mangler mottaker/adresse';
      }

      return {
        barcode,
        placeId: placeName,
        description: description || `Bulk import: ${barcode}`,
        weight,
        numberOfItems: items,
        status,
        error
      };
    });

    setPreview(results);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCsvFile(file);
      parseCSV(file);
    } else {
      setCsvFile(null);
      setPreview([]);
    }
  };

  const handleImport = async () => {
    const validOrders = preview.filter(p => p.status === 'valid');
    if (validOrders.length === 0) return;

    setIsImporting(true);
    setProgress({ current: 0, total: validOrders.length });

    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < validOrders.length; i++) {
        const p = validOrders[i];
        setProgress({ current: i + 1, total: validOrders.length });

        try {
          await createOrder({
            orgId,
            barcode: p.barcode,
            placeId: 'pending_hub', // In a real scenario, we'd lookup or create a Place here
            status: 'pending',
            details: {
              description: p.description,
              weight: p.weight,
              numberOfItems: p.numberOfItems,
              form: 'package'
            }
          });
          successCount++;
        } catch (err) {
          console.error("Failed to import order", p.barcode, err);
          failCount++;
        }
      }

      toast({
        title: "Import fullført",
        description: `Opprettet ${successCount} nye ordrer. Feilet: ${failCount}.`,
        variant: failCount > 0 ? "destructive" : "default"
      });

      setPreview([]);
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error: any) {
      toast({
        title: "Kritisk feil",
        description: error.message || "Noe gikk galt under importen.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <Info className="h-5 w-5 shrink-0 text-blue-600" />
        <div className="space-y-1">
          <p className="font-black uppercase tracking-tight">Bulk-import av ordrer</p>
          <p className="font-medium opacity-90">
            Last opp en CSV-fil med kolonner for <strong>Strekkode</strong>, <strong>Mottaker</strong>, og <strong>Antall Kolli</strong>. 
            Systemet vil automatisk opprette ordreskall som kan tildeles ruter senere.
          </p>
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-upload" className="font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> 
            Velg CSV-fil
          </Label>
          <Input 
            id="csv-upload" 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isImporting}
          />
        </div>

        {preview.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest flex items-center gap-2">
                Forhåndsvisning 
                <Badge variant="secondary" className="font-mono">{preview.length} linjer</Badge>
              </h3>
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                  {preview.filter(p => p.status === 'valid').length} Gyldige
                </Badge>
                {preview.some(p => p.status === 'invalid') && (
                  <Badge variant="destructive">
                    {preview.filter(p => p.status === 'invalid').length} Feil
                  </Badge>
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-100">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase">Strekkode</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Mottaker/Sted</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Kolli</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.slice(0, 20).map((p, idx) => (
                    <TableRow key={idx} className={cn(p.status === 'invalid' && "bg-red-50/50")}>
                      <TableCell className="font-mono text-xs font-bold">{p.barcode}</TableCell>
                      <TableCell className="text-xs">{p.placeId}</TableCell>
                      <TableCell className="text-xs font-black">{p.numberOfItems}</TableCell>
                      <TableCell>
                        {p.status === 'valid' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                            <XCircle className="h-3 w-3" /> {p.error}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {preview.length > 20 && (
                <div className="p-2 text-center text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-tighter">
                  ... og {preview.length - 20} flere linjer ...
                </div>
              )}
            </div>

            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-blue-600">
                  <span>Importerer ordrer...</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setPreview([]); setCsvFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                Avbryt
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || !preview.some(p => p.status === 'valid')}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Importer {preview.filter(p => p.status === 'valid').length} ordrer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
