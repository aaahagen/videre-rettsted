'use client';

import { useState, useEffect } from 'react';
import bwipjs from 'bwip-js';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, ListChecks, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Order, Place, Organization } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { cn } from '@/lib/utils';

interface BulkBarcodeGeneratorProps {
  orders: Order[];
  places: Record<string, Place>;
  onComplete?: () => void;
  buttonLabel?: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function BulkBarcodeGenerator({ orders, places, onComplete, buttonLabel, variant = 'default', className }: BulkBarcodeGeneratorProps) {
  const { dbUser } = useAuth();
  const [org, setOrganization] = useState<Organization | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [labelUrls, setLabelUrls] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!dbUser?.orgId) return;
    return onSnapshot(doc(db, 'organizations', dbUser.orgId), (doc) => {
      if (doc.exists()) setOrganization({ id: doc.id, ...doc.data() } as Organization);
    });
  }, [dbUser?.orgId]);

  const generateAllLabels = async () => {
    setIsGenerating(true);
    const urls: string[] = [];
    const format = org?.labelSettings?.format || 'barcode';

    try {
      for (const order of orders) {
        const place = places[order.placeId];
        const itemCount = order.details?.numberOfItems || 1;

        // 1. GENERATE A BATCH HEADER FOR THIS ORDER
        const headerCanvas = document.createElement('canvas');
        headerCanvas.width = 800;
        headerCanvas.height = 600;
        const hCtx = headerCanvas.getContext('2d');
        if (hCtx) {
            hCtx.fillStyle = '#f1f5f9';
            hCtx.fillRect(0, 0, 800, 600);
            hCtx.strokeStyle = 'black';
            hCtx.lineWidth = 10;
            hCtx.strokeRect(20, 20, 760, 560);
            
            hCtx.fillStyle = 'black';
            hCtx.font = 'black 40px sans-serif';
            hCtx.textAlign = 'center';
            hCtx.fillText('--- START NY ORDRE ---', 400, 100);
            
            hCtx.font = 'bold 60px sans-serif';
            hCtx.fillText(place?.name?.toUpperCase() || 'UKJENT MOTTAKER', 400, 250);
            
            hCtx.font = 'bold 40px sans-serif';
            hCtx.fillText(`${itemCount} KOLLI TOTALT`, 400, 350);
            
            hCtx.font = 'bold 30px sans-serif';
            hCtx.fillText(`Ordre Ref: ${order.barcode || order.id.slice(0,8)}`, 400, 450);
            
            urls.push(headerCanvas.toDataURL('image/png'));
        }

        // 2. GENERATE INDIVIDUAL COLLIE LABELS
        for (let i = 1; i <= itemCount; i++) {
          const canvas = document.createElement('canvas');
          const barcodeData = order.barcode || order.id;
          
          await bwipjs.toCanvas(canvas, {
            bcid: format === 'qrcode' ? 'qrcode' : 'code128',
            text: barcodeData,
            scale: 3,
            height: format === 'qrcode' ? 30 : 12,
            width: format === 'qrcode' ? 30 : undefined,
            includetext: format !== 'qrcode',
            textxalign: 'center',
          });

          const labelCanvas = document.createElement('canvas');
          const ctx = labelCanvas.getContext('2d');
          if (!ctx) continue;

          labelCanvas.width = 800;
          labelCanvas.height = 600;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 800, 600);
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 4;
          ctx.strokeRect(10, 10, 780, 580);

          if (org?.labelSettings?.includeBranding !== false) {
            ctx.fillStyle = '#6366f1';
            ctx.font = 'black 18px sans-serif';
            ctx.fillText('VIDERE RettSted', 30, 45);
          }

          ctx.fillStyle = 'black';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText((place?.name || 'Mottaker Ukjent').toUpperCase().substring(0, 30), 30, 95);
          ctx.font = '28px sans-serif';
          ctx.fillText((place?.address || '').substring(0, 40), 30, 135);
          
          const postalCode = place?.address?.match(/\d{4}/)?.[0] || '----';
          ctx.font = 'black 72px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(postalCode, 760, 115);
          ctx.textAlign = 'left';

          ctx.beginPath(); ctx.moveTo(30, 160); ctx.lineTo(770, 160); ctx.stroke();

          if (format === 'qrcode') {
            ctx.drawImage(canvas, 280, 180, 240, 240);
            ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
            ctx.fillText(barcodeData, 400, 440); ctx.textAlign = 'left';
          } else {
            ctx.drawImage(canvas, (800 - canvas.width * 1.1) / 2, 180, canvas.width * 1.1, canvas.height * 1.1);
          }

          ctx.font = 'bold 24px sans-serif';
          ctx.fillText(`KOLLI: ${i} / ${itemCount}`, 30, 480);
          ctx.textAlign = 'right';
          let specs = '';
          if (order.details?.weight) specs += `${order.details.weight} KG  `;
          if (order.details?.volume) specs += `${order.details.volume} M3`;
          ctx.fillText(specs, 760, 480); ctx.textAlign = 'left';

          ctx.fillStyle = '#f8fafc'; ctx.fillRect(30, 510, 740, 65);
          ctx.fillStyle = 'black'; ctx.font = 'bold 18px sans-serif';
          ctx.fillText('SKANN FOR LASTERAMPE-INFO', 50, 535);
          ctx.font = '14px sans-serif'; ctx.fillStyle = '#64748b';
          ctx.fillText('Rute og bil tildeles digitalt. Gjenbrukbar etikett.', 50, 558);

          urls.push(labelCanvas.toDataURL('image/png'));
        }
      }
      setLabelUrls(urls);
    } catch (err) {
      console.error('Bulk generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Bulk Print</title><style>@page { size: portrait; margin: 0; } body { margin: 0; padding: 0; } .label-container { width: 100%; height: 100vh; page-break-after: always; display: flex; justify-content: center; align-items: center; } img { width: 100%; height: auto; object-fit: contain; }</style></head><body>');
    labelUrls.forEach(url => printWindow.document.write(`<div class="label-container"><img src="${url}" /></div>`));
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); onComplete?.(); setIsOpen(false); }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (val) generateAllLabels(); }}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn("gap-2 font-bold", className)}>
          <Printer className="h-4 w-4" />
          {buttonLabel || `Skriv ut ${orders.length} ordrer`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col border-none shadow-2xl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <ListChecks className="h-6 w-6 text-indigo-600" />
              Bulk-utskrift av etiketter
          </DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Forbereder utskrift for {orders.length} ordrer. Vi har lagt til skille-etiketter mellom hver ordre for å unngå rot.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-xs">Behandler køen...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {labelUrls.map((url, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border shadow-sm relative group">
                  <img src={url} alt={`Etikett ${idx}`} className="w-full h-auto rounded" />
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge className="bg-indigo-600 text-[8px] h-4">#{idx + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-white gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="font-bold">Avbryt</Button>
          <Button 
            disabled={isGenerating || labelUrls.length === 0}
            onClick={handlePrint}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 shadow-lg"
          >
            <Printer className="h-4 w-4" />
            Start Utskrift ({labelUrls.length} sider)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
