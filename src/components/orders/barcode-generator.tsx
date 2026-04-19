'use client';

import { useState } from 'react';
import bwipjs from 'bwip-js';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
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
        // We include item count in the barcode data if multiple items: BARCODE-1/5, BARCODE-2/5 etc.
        // Or keep it simple with just the barcode if the loader UI handles the count.
        // Let's keep it simple with just the barcode but add visual text for the item number.
        const barcodeData = order.barcode || order.id;
        
        await bwipjs.toCanvas(canvas, {
          bcid: 'code128',       // Barcode type
          text: barcodeData,    // Text to encode
          scale: 3,              // 3x scaling factor
          height: 10,            // Bar height, in millimeters
          includetext: true,     // Show human-readable text
          textxalign: 'center',  // Always good to set this
        });

        // Create a printable label layout on a canvas
        const labelCanvas = document.createElement('canvas');
        const ctx = labelCanvas.getContext('2d');
        if (!ctx) continue;

        // Label Size (approx 100mm x 50mm at 300dpi = 1181 x 590)
        // Let's use smaller for better display 600x300
        labelCanvas.width = 600;
        labelCanvas.height = 350;

        // Background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
        
        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, labelCanvas.width - 10, labelCanvas.height - 10);

        // Header - Destination Name
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px sans-serif';
        const name = place?.name || 'Ukjent mottaker';
        ctx.fillText(name.substring(0, 35), 20, 40);

        // Address
        ctx.font = '18px sans-serif';
        const address = place?.address || '';
        ctx.fillText(address.substring(0, 45), 20, 70);

        // Barcode Image
        const barcodeScale = 0.8;
        const barcodeWidth = canvas.width * barcodeScale;
        const barcodeHeight = canvas.height * barcodeScale;
        const x = (labelCanvas.width - barcodeWidth) / 2;
        ctx.drawImage(canvas, x, 90, barcodeWidth, barcodeHeight);

        // Item count footer
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Kollinr: ${i} / ${itemCount}`, 20, 330);
        
        // Weight/Volume if exists
        ctx.font = '16px sans-serif';
        let meta = '';
        if (order.details?.weight) meta += `${order.details.weight}kg `;
        if (order.details?.form) meta += `[${order.details.form}]`;
        ctx.textAlign = 'right';
        ctx.fillText(meta, labelCanvas.width - 20, 330);

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
      @page { size: landscape; margin: 0; }
      body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; }
      .label-container { 
        width: 100mm; 
        height: 60mm; 
        page-break-after: always; 
        display: flex; 
        justify-content: center; 
        align-items: center;
        padding: 5mm;
        box-sizing: border-box;
      }
      img { max-width: 100%; max-height: 100%; object-fit: contain; }
    `);
    printWindow.document.write('</style></head><body>');
    
    labelUrls.forEach(url => {
      printWindow.document.write(`<div class="label-container"><img src="${url}" /></div>`);
    });
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    // Give it a moment to load images before printing
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
        <Button variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Skriv ut etiketter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Forhåndsvisning av Etiketter</DialogTitle>
          <DialogDescription>
            Genererer {order.details?.numberOfItems || 1} etikett(er) for ordre {order.barcode || order.id}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 rounded-lg space-y-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Genererer etiketter...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labelUrls.map((url, idx) => (
                <div key={idx} className="bg-white p-2 rounded border shadow-sm flex flex-col gap-2">
                  <div className="relative aspect-[100/60] w-full">
                    <img src={url} alt={`Etikett ${idx + 1}`} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-tighter">
                    Etikett {idx + 1} av {labelUrls.length}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Avbryt</Button>
          <Button 
            disabled={isGenerating || labelUrls.length === 0}
            onClick={handlePrint}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <Printer className="h-4 w-4" />
            Skriv ut alle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}