'use client';

import { useState } from 'react';
import bwipjs from 'bwip-js';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, Info } from 'lucide-react';
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
import { Order, Place } from '@/lib/types';

interface BarcodeGeneratorProps {
  order: Order;
  place?: Place | null;
}

export function BarcodeGenerator({ order, place }: BarcodeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [labelUrls, setLabelUrls] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const generateLabels = async () => {
    setIsGenerating(true);
    const urls: string[] = [];
    const itemCount = order.details?.numberOfItems || 1;
    
    try {
      for (let i = 1; i <= itemCount; i++) {
        const canvas = document.createElement('canvas');
        const barcodeData = order.barcode || order.id;
        
        await bwipjs.toCanvas(canvas, {
          bcid: 'code128',
          text: barcodeData,
          scale: 3,
          height: 12,
          includetext: true,
          textxalign: 'center',
        });

        const labelCanvas = document.createElement('canvas');
        const ctx = labelCanvas.getContext('2d');
        if (!ctx) continue;

        // Standard Label Size: 100mm x 75mm (approx 4x3 inches)
        labelCanvas.width = 800;
        labelCanvas.height = 600;

        // Background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
        
        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, labelCanvas.width - 20, labelCanvas.height - 20);

        // Header - VIDERE RettSted Branding (Small)
        ctx.fillStyle = '#6366f1';
        ctx.font = 'black 18px sans-serif';
        ctx.fillText('VIDERE RettSted', 30, 45);

        // --- SECTION 1: DESTINATION ---
        ctx.fillStyle = 'black';
        ctx.font = 'bold 36px sans-serif';
        const name = place?.name || 'Mottaker Ukjent';
        ctx.fillText(name.toUpperCase().substring(0, 30), 30, 95);

        ctx.font = '28px sans-serif';
        const address = place?.address || '';
        ctx.fillText(address.substring(0, 40), 30, 135);
        
        // Postal Code (Big and Clear for sorting)
        const postalCode = address.match(/\d{4}/)?.[0] || '----';
        ctx.font = 'black 72px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(postalCode, labelCanvas.width - 40, 115);
        ctx.textAlign = 'left';

        // Horizontal Line
        ctx.beginPath();
        ctx.moveTo(30, 160);
        ctx.lineTo(labelCanvas.width - 30, 160);
        ctx.stroke();

        // --- SECTION 2: BARCODE ---
        const barcodeScale = 1.1;
        const barcodeWidth = canvas.width * barcodeScale;
        const barcodeHeight = canvas.height * barcodeScale;
        const x = (labelCanvas.width - barcodeWidth) / 2;
        ctx.drawImage(canvas, x, 180, barcodeWidth, barcodeHeight);

        // --- SECTION 3: PHYSICAL SPECS ---
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`KOLLI: ${i} / ${itemCount}`, 30, 460);

        ctx.textAlign = 'right';
        let specs = '';
        if (order.details?.weight) specs += `${order.details.weight} KG  `;
        if (order.details?.volume) specs += `${order.details.volume} M3`;
        ctx.fillText(specs, labelCanvas.width - 40, 460);
        ctx.textAlign = 'left';

        // --- SECTION 4: ROUTING HINT (The persistent part) ---
        // We use a "Zone" or "Zip" based hint instead of Route Name
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(30, 490, labelCanvas.width - 60, 80);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('SKANN FOR LASTERAMPE-INFO', 50, 525);
        
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('Denne etiketten er persistent. Rute og bil tildeles digitalt ved skanning.', 50, 555);

        urls.push(labelCanvas.toDataURL('image/png'));
      }
      setLabelUrls(urls);
    } catch (err) {
      console.error('Barcode generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Print Etiketter</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @page { size: portrait; margin: 0; }
      body { margin: 0; padding: 0; }
      .label-container { 
        width: 100%; 
        height: 100vh;
        page-break-after: always; 
        display: flex; 
        justify-content: center; 
        align-items: center;
        padding: 0;
        box-sizing: border-box;
      }
      img { width: 100%; height: auto; object-fit: contain; }
    `);
    printWindow.document.write('</style></head><body>');
    
    labelUrls.forEach(url => {
      printWindow.document.write(`<div class="label-container"><img src="${url}" /></div>`);
    });
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      setIsOpen(val);
      if (val && labelUrls.length === 0) {
        generateLabels();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 border-slate-200 shadow-sm font-bold">
          <Printer className="h-4 w-4 text-indigo-600" />
          Skriv ut etiketter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col border-none shadow-2xl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-black text-slate-900">Forhåndsvisning av Etiketter</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Genererer {order.details?.numberOfItems || 1} etikett(er) for ordre {order.barcode || order.id}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-xs">Genererer etiketter...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {labelUrls.map((url, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xl flex flex-col gap-4">
                  <div className="relative w-full">
                    <img src={url} alt={`Etikett ${idx + 1}`} className="w-full h-auto rounded-lg" />
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <Badge variant="outline" className="bg-slate-100 border-none font-bold text-slate-600">
                      ETIKETT {idx + 1} AV {labelUrls.length}
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Info className="h-3 w-3" /> Standard Format 100x75mm
                    </div>
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
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 shadow-lg shadow-indigo-100"
          >
            <Printer className="h-4 w-4" />
            Skriv ut alle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
