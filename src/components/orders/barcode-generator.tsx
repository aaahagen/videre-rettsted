'use client';

import { useState, useEffect } from 'react';
import bwipjs from 'bwip-js';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, Info, QrCode as QrIcon, Barcode as BarcodeIcon } from 'lucide-react';
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
import { useAuth } from '@/components/auth-provider';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Organization } from '@/lib/types';

interface BarcodeGeneratorProps {
  order: Order;
  place?: Place | null;
}

export function BarcodeGenerator({ order, place }: BarcodeGeneratorProps) {
  const { dbUser } = useAuth();
  const [org, setOrganization] = useState<Organization | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [labelUrls, setLabelUrls] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Listen to organization settings for real-time format changes
  useEffect(() => {
    if (!dbUser?.orgId) return;
    return onSnapshot(doc(db, 'organizations', dbUser.orgId), (doc) => {
      if (doc.exists()) setOrganization({ id: doc.id, ...doc.data() } as Organization);
    });
  }, [dbUser?.orgId]);

  const generateLabels = async () => {
    setIsGenerating(true);
    const urls: string[] = [];
    const itemCount = order.details?.numberOfItems || 1;
    const format = org?.labelSettings?.format || 'barcode';
    
    try {
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

        // Background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
        
        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, labelCanvas.width - 20, labelCanvas.height - 20);

        // Header - Branding
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

        // --- SECTION 2: BARCODE / QR ---
        if (format === 'qrcode') {
            const qrSize = 240;
            const x = (labelCanvas.width - qrSize) / 2;
            ctx.drawImage(canvas, x, 180, qrSize, qrSize);
            
            // Human readable text for QR
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(barcodeData, labelCanvas.width / 2, 440);
            ctx.textAlign = 'left';
        } else {
            const barcodeScale = 1.1;
            const barcodeWidth = canvas.width * barcodeScale;
            const barcodeHeight = canvas.height * barcodeScale;
            const x = (labelCanvas.width - barcodeWidth) / 2;
            ctx.drawImage(canvas, x, 180, barcodeWidth, barcodeHeight);
        }

        // --- SECTION 3: PHYSICAL SPECS ---
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`KOLLI: ${i} / ${itemCount}`, 30, 480);

        ctx.textAlign = 'right';
        let specs = '';
        if (order.details?.weight) specs += `${order.details.weight} KG  `;
        if (order.details?.volume) specs += `${order.details.volume} M3`;
        ctx.fillText(specs, labelCanvas.width - 40, 480);
        ctx.textAlign = 'left';

        // --- SECTION 4: INSTRUCTION ---
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(30, 510, labelCanvas.width - 60, 65);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('SKANN FOR LASTERAMPE-INFO', 50, 535);
        
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Rute og bil tildeles digitalt. Gjenbrukbar etikett.', 50, 558);

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
      if (val) {
        setLabelUrls([]); // Clear old if format changed
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
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900">Forhåndsvisning</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Ordre {order.barcode || order.id.slice(0,8)} • {org?.labelSettings?.format === 'qrcode' ? 'QR-kode' : 'Strekkode'}
              </DialogDescription>
            </div>
            {org?.labelSettings?.format === 'qrcode' ? (
                <QrIcon className="h-8 w-8 text-indigo-100" />
            ) : (
                <BarcodeIcon className="h-8 w-8 text-indigo-100" />
            )}
          </div>
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
