'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileJson, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { Place } from '@/lib/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DataExportProps {
  orgId: string;
}

export function DataExport({ orgId }: DataExportProps) {
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingImages, setIsExportingImages] = useState(false);
  const { toast } = useToast();

  const getBackupFolderName = (place: Place) => {
    return `${place.name.replace(/[^a-z0-9]/gi, '_').trim()}_${place.id}`;
  };

  const handleExportJson = async () => {
    setIsExportingJson(true);
    try {
      const places = await firebaseDB.getPlaces(orgId);
      
      // Enrich places with backup metadata
      const enrichedPlaces = places.map(place => ({
        ...place,
        _backupFolderName: getBackupFolderName(place),
        _imageFiles: place.images?.map((img, index) => ({
            originalUrl: img.url,
            backupFilename: `image_${index + 1}.jpg` // Assuming jpg for simplicity in metadata, actual ext might vary
        }))
      }));

      const data = JSON.stringify(enrichedPlaces, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      saveAs(blob, `videre-rettsted-data-${new Date().toISOString().split('T')[0]}.json`);
      toast({
        title: "Eksport fullført",
        description: "JSON-filen er lastet ned. Den inneholder referanser til backup-mappene.",
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Eksport feilet",
        description: error.message || "Kunne ikke eksportere data.",
        variant: "destructive"
      });
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleExportImages = async () => {
    setIsExportingImages(true);
    try {
      const places = await firebaseDB.getPlaces(orgId);
      const zip = new JSZip();
      
      let imageCount = 0;
      const downloadPromises: Promise<void>[] = [];

      places.forEach((place) => {
        if (place.images && place.images.length > 0) {
          const folderName = getBackupFolderName(place);
          const folder = zip.folder(folderName);
          
          if (folder) {
            place.images.forEach((img, index) => {
              if (img.url) {
                const promise = fetch(img.url)
                  .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch ${img.url}`);
                    return response.blob();
                  })
                  .then(blob => {
                    // Try to guess extension from blob type, default to jpg
                    const ext = blob.type.split('/')[1] || 'jpg';
                    const fileName = `image_${index + 1}.${ext}`;
                    folder.file(fileName, blob);
                    imageCount++;
                  })
                  .catch(err => {
                    console.error(`Failed to download image for ${place.name}:`, err);
                  });
                downloadPromises.push(promise);
              }
            });
          }
        }
      });

      if (downloadPromises.length === 0) {
        toast({
            title: "Ingen bilder funnet",
            description: "Det er ingen bilder å eksportere.",
        });
        setIsExportingImages(false);
        return;
      }

      toast({
        title: "Forbereder nedlasting",
        description: `Laster ned og pakker ${downloadPromises.length} bilder. Dette kan ta litt tid...`,
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `videre-rettsted-images-${new Date().toISOString().split('T')[0]}.zip`);
      
      toast({
        title: "Backup fullført",
        description: `${imageCount} bilder er lastet ned i en ZIP-fil.`,
      });

    } catch (error: any) {
      console.error("Image backup error:", error);
      toast({
        title: "Backup feilet",
        description: error.message || "Kunne ikke laste ned bilder.",
        variant: "destructive"
      });
    } finally {
      setIsExportingImages(false);
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="font-headline text-xl sm:text-2xl">
          Dataeksport & Backup
        </CardTitle>
        <CardDescription>
          Last ned all data for din organisasjon. JSON-filen inneholder referanser til mappene i ZIP-filen.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto h-auto py-4 flex flex-col gap-2 items-center justify-center"
            onClick={handleExportJson}
            disabled={isExportingJson || isExportingImages}
          >
            {isExportingJson ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
                <FileJson className="h-6 w-6 text-primary" />
            )}
            <div className="text-center">
                <span className="block font-semibold">Last ned JSON</span>
                <span className="text-xs text-muted-foreground">Stedsdata med referanser</span>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full sm:w-auto h-auto py-4 flex flex-col gap-2 items-center justify-center"
            onClick={handleExportImages}
            disabled={isExportingJson || isExportingImages}
          >
            {isExportingImages ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
                <ImageIcon className="h-6 w-6 text-primary" />
            )}
            <div className="text-center">
                <span className="block font-semibold">Backup av Bilder (ZIP)</span>
                <span className="text-xs text-muted-foreground">Alle bilder sortert i mapper</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
