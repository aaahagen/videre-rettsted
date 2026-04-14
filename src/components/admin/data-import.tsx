'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertTriangle, FileJson, FileArchive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseDB } from '@/lib/firebase/database';
import { firebaseStorage } from '@/lib/firebase/storage';
import JSZip from 'jszip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DataImportProps {
  orgId: string;
}

export function DataImport({ orgId }: DataImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
  
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setJsonFile(e.target.files[0]);
    } else {
      setJsonFile(null);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setZipFile(e.target.files[0]);
    } else {
      setZipFile(null);
    }
  };

  const handleImport = async () => {
    if (!jsonFile) {
      toast({
        title: "Feil",
        description: "Du må laste opp en JSON-fil.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setProgress({ current: 0, total: 0, stage: "Leser filer..." });

    try {
      // 1. Read JSON
      const jsonText = await jsonFile.text();
      let places: any[];
      try {
        places = JSON.parse(jsonText);
        if (!Array.isArray(places)) throw new Error("JSON must be an array");
      } catch (err) {
        throw new Error("Ugyldig JSON-format. Filen må være en valid eksport-fil.");
      }

      setProgress({ current: 0, total: places.length, stage: "Forbereder import..." });

      // 2. Read ZIP (Optional, but highly recommended if they exported it)
      let zipFiles: { [key: string]: JSZip.JSZipObject } = {};
      if (zipFile) {
        const zipData = await zipFile.arrayBuffer();
        const jszip = new JSZip();
        const unzipped = await jszip.loadAsync(zipData);
        zipFiles = unzipped.files;
      }

      let successCount = 0;
      let failCount = 0;

      // 3. Process each place
      for (let i = 0; i < places.length; i++) {
        const p = places[i];
        setProgress({ current: i + 1, total: places.length, stage: `Importerer sted: ${p.name || 'Ukjent'}` });

        try {
          // Prepare new place data (strip out IDs and export metadata)
          const newPlaceData: any = {
             name: p.name || "Importert Sted",
             address: p.address || "",
             description: p.description || "",
             notes: p.notes || "",
             field3: p.field3 || "",
             hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
             orgId: orgId, // Force to the CURRENT organization
             authorId: "system_import",
             authorName: "System Import",
             images: [],
          };

          if (p.coordinates) {
              newPlaceData.coordinates = p.coordinates;
          } else if (p.location) {
              newPlaceData.location = p.location;
          }

          // Handle Images if ZIP is provided and metadata exists
          if (zipFile && p._backupFolderName && Array.isArray(p._imageFiles)) {
             for (const imgMeta of p._imageFiles) {
                const zipPath = `${p._backupFolderName}/${imgMeta.backupFilename}`;
                const zipFileRef = zipFiles[zipPath];

                if (zipFileRef && !zipFileRef.dir) {
                    const blob = await zipFileRef.async('blob');
                    // Create a valid File object for the uploader
                    const file = new File([blob], imgMeta.backupFilename, { type: blob.type || 'image/jpeg' });
                    
                    // Generate a unique path in storage
                    const uniqueId = Math.random().toString(36).substring(2, 15);
                    const storagePath = `organizations/${orgId}/places/import_${uniqueId}_${file.name}`;
                    
                    const downloadUrl = await firebaseStorage.uploadFile(storagePath, file);
                    
                    // Look for the original description in the original images array based on URL
                    const originalImgDef = p.images?.find((img: any) => img.url === imgMeta.originalUrl);
                    
                    newPlaceData.images.push({
                       url: downloadUrl,
                       description: originalImgDef?.description || ""
                    });
                }
             }
          } else if (!zipFile && p.images && p.images.length > 0) {
             console.warn(`Skipping images for ${p.name} because no ZIP was provided.`);
          }

          // Create the place in Firestore
          await firebaseDB.createPlace(newPlaceData);
          successCount++;

        } catch (err) {
            console.error(`Failed to import place ${p.name}:`, err);
            failCount++;
        }
      }

      toast({
        title: "Import fullført",
        description: `Opprettet ${successCount} nye steder. Feilet: ${failCount}.`,
        variant: failCount > 0 ? "destructive" : "default"
      });
      
      // Reset form
      setJsonFile(null);
      setZipFile(null);
      if (jsonInputRef.current) jsonInputRef.current.value = '';
      if (zipInputRef.current) zipInputRef.current.value = '';

    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import feilet",
        description: error.message || "En feil oppstod under importen.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
         <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
                <strong>Viktig informasjon om import:</strong> Når du importerer data, vil systemet opprette <strong>nye steder</strong> basert på innholdet i JSON-filen. 
                Dersom du har eksisterende steder i systemet, vil disse <strong>ikke</strong> bli slettet eller overskrevet. For å unngå duplikater, bør du kun importere steder som ikke allerede finnes i systemet.
            </p>
         </div>

         <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <Label htmlFor="json-upload" className="font-semibold flex items-center gap-2 text-sm">
                    <FileJson className="h-4 w-4 text-blue-600" /> 1. Last opp JSON
                </Label>
                <p className="text-[10px] text-muted-foreground mb-1">Inneholder tekst og koordinater (Påkrevd).</p>
                <Input 
                    id="json-upload" 
                    type="file" 
                    accept=".json,application/json" 
                    onChange={handleJsonChange}
                    ref={jsonInputRef}
                    disabled={isImporting}
                    className="text-xs"
                />
            </div>

            <div className="space-y-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <Label htmlFor="zip-upload" className="font-semibold flex items-center gap-2 text-sm">
                    <FileArchive className="h-4 w-4 text-amber-600" /> 2. Bilder ZIP
                </Label>
                <p className="text-[10px] text-muted-foreground mb-1">Inkluder hvis du vil gjenopprette bilder.</p>
                <Input 
                    id="zip-upload" 
                    type="file" 
                    accept=".zip,application/zip" 
                    onChange={handleZipChange}
                    ref={zipInputRef}
                    disabled={isImporting}
                    className="text-xs"
                />
            </div>
         </div>

         {progress && (
            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs border border-blue-200">
               <div className="flex items-center justify-between mb-1">
                 <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="font-medium">{progress.stage}</span>
                 </div>
                 {progress.total > 0 && (
                     <span className="font-bold">{progress.current} / {progress.total}</span>
                 )}
               </div>
               {progress.total > 0 && (
                   <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                   </div>
               )}
            </div>
         )}

        <div className="flex justify-end">
            <Button 
                onClick={handleImport}
                disabled={isImporting || !jsonFile}
            >
                {isImporting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importerer...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Start Import
                    </>
                )}
            </Button>
        </div>
    </div>
  );
}