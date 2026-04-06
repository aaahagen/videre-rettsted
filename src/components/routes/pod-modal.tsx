'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Camera, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ProofOfDelivery } from "@/lib/types";
import { compressImage } from "@/lib/utils";

interface ProofOfDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (podData: Partial<ProofOfDelivery>, filesToUpload: File[]) => void;
  placeName: string;
}

export function ProofOfDeliveryModal({ isOpen, onClose, onConfirm, placeName }: ProofOfDeliveryModalProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<ProofOfDelivery['deliveryMethod']>('handed_to_recipient');
  const [status, setStatus] = useState<ProofOfDelivery['status']>('successful');
  const [failureReason, setFailureReason] = useState<ProofOfDelivery['failureReason']>();
  
  const [photos, setPhotos] = useState<{file: File, preview: string, type: string}[]>([]);
  const [signatureName, setSignatureName] = useState('');
  const [notes, setNotes] = useState('');
  const [damageReported, setDamageReported] = useState(false);
  const [damageDetails, setDamageDetails] = useState('');
  
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'package_in_situ' | 'door_number' | 'damage_proof' | 'general' = 'general') => {
    if (e.target.files && e.target.files.length > 0) {
      setIsCompressing(true);
      try {
        const file = e.target.files[0];
        const compressedFile = await compressImage(file, 1024, 800);
        const previewUrl = URL.createObjectURL(compressedFile);
        
        setPhotos(prev => [...prev, { file: compressedFile as File, preview: previewUrl, type }]);
      } catch (error) {
        console.error("Error compressing image:", error);
      } finally {
        setIsCompressing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (status === 'successful' && deliveryMethod === 'left_at_door' && photos.length === 0) {
       alert("Du må ta minst ett bilde når pakken settes igjen.");
       return;
    }
    if (status === 'failed_attempt' && !failureReason) {
       alert("Du må oppgi en årsak til at leveringen feilet.");
       return;
    }

    const filesToUpload = photos.map(p => p.file);
    const photoMetadata = photos.map(p => ({ url: '', type: p.type as any }));

    const podData: Partial<ProofOfDelivery> = {
      status,
      deliveryMethod: status === 'successful' ? deliveryMethod : undefined,
      signatureName: signatureName || undefined,
      notes: notes || undefined,
      damageReported,
      damageDetails: damageReported ? damageDetails : undefined,
      failureReason: status !== 'successful' ? failureReason : undefined,
      photos: photoMetadata.length > 0 ? photoMetadata : undefined,
    };

    onConfirm(podData, filesToUpload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Leveringsbekreftelse</DialogTitle>
          <DialogDescription>
            {placeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <Label className="text-base font-semibold">Status på levering</Label>
            <RadioGroup value={status} onValueChange={(val) => setStatus(val as any)} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 bg-white p-3 rounded border border-slate-200 cursor-pointer">
                <RadioGroupItem value="successful" id="status-success" />
                <Label htmlFor="status-success" className="flex items-center gap-2 font-medium cursor-pointer w-full"><CheckCircle2 className="h-4 w-4 text-green-500"/> Vellykket</Label>
              </div>
              <div className="flex items-center space-x-2 bg-white p-3 rounded border border-slate-200 cursor-pointer">
                <RadioGroupItem value="failed_attempt" id="status-failed" />
                <Label htmlFor="status-failed" className="flex items-center gap-2 font-medium cursor-pointer w-full"><AlertTriangle className="h-4 w-4 text-red-500"/> Feilet / Ikke levert</Label>
              </div>
            </RadioGroup>
          </div>

          {status === 'failed_attempt' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
              <Label className="text-base font-semibold">Årsak til feilet levering</Label>
              <RadioGroup value={failureReason} onValueChange={(val) => setFailureReason(val as any)} className="space-y-2">
                <div className="flex items-center space-x-2"><RadioGroupItem value="recipient_unavailable" id="fr-unavail" /><Label htmlFor="fr-unavail" className="cursor-pointer">Mottaker ikke tilstede</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="access_denied" id="fr-access" /><Label htmlFor="fr-access" className="cursor-pointer">Låst / Ingen tilgang</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="address_not_found" id="fr-address" /><Label htmlFor="fr-address" className="cursor-pointer">Fant ikke adresse</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="package_damaged_refused" id="fr-refused" /><Label htmlFor="fr-refused" className="cursor-pointer">Pakke skadet / Nektet mottatt</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="fr-other" /><Label htmlFor="fr-other" className="cursor-pointer">Annet</Label></div>
              </RadioGroup>
            </div>
          )}

          {status === 'successful' && (
            <>
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                <Label className="text-base font-semibold">Overleveringsmetode</Label>
                <RadioGroup value={deliveryMethod} onValueChange={(val) => setDeliveryMethod(val as any)} className="grid grid-cols-2 gap-2">
                  <div className="flex items-start space-x-2 border p-3 rounded-lg"><RadioGroupItem value="handed_to_recipient" id="dm-handed" className="mt-1" /><Label htmlFor="dm-handed" className="leading-snug cursor-pointer">Levert til mottaker</Label></div>
                  <div className="flex items-start space-x-2 border p-3 rounded-lg"><RadioGroupItem value="left_at_door" id="dm-door" className="mt-1" /><Label htmlFor="dm-door" className="leading-snug cursor-pointer">Satt ved dør</Label></div>
                  <div className="flex items-start space-x-2 border p-3 rounded-lg"><RadioGroupItem value="mailroom_reception" id="dm-mailroom" className="mt-1" /><Label htmlFor="dm-mailroom" className="leading-snug cursor-pointer">Resepsjon / Varemottak</Label></div>
                  <div className="flex items-start space-x-2 border p-3 rounded-lg"><RadioGroupItem value="neighbor" id="dm-neighbor" className="mt-1" /><Label htmlFor="dm-neighbor" className="leading-snug cursor-pointer">Nabo</Label></div>
                </RadioGroup>
              </div>

              {(deliveryMethod === 'handed_to_recipient' || deliveryMethod === 'mailroom_reception' || deliveryMethod === 'neighbor') && (
                <div className="space-y-2">
                  <Label>Mottakers Navn</Label>
                  <Input 
                    placeholder="F.eks. Ola Nordmann" 
                    value={signatureName} 
                    onChange={e => setSignatureName(e.target.value)} 
                  />
                </div>
              )}

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Fotobevis</Label>
                  {deliveryMethod === 'left_at_door' && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Påkrevd</span>}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden border border-slate-200">
                      <img src={photo.preview} alt="POD Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {photos.length < 3 && (
                    <Button 
                      variant="outline" 
                      className="aspect-square flex flex-col items-center justify-center gap-2 h-auto text-muted-foreground hover:text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressing}
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-xs text-center">{isCompressing ? 'Laster...' : 'Ta bilde'}</span>
                    </Button>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={(e) => handleFileChange(e, 'general')} 
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-start space-x-3">
              <Checkbox id="damage" checked={damageReported} onCheckedChange={(c) => setDamageReported(c as boolean)} />
              <div className="space-y-1 leading-none">
                <Label htmlFor="damage" className="font-medium text-red-600 flex items-center gap-1 cursor-pointer">
                  <AlertTriangle className="h-3 w-3" /> Registrer skade på gods
                </Label>
              </div>
            </div>
            
            {damageReported && (
              <Textarea 
                placeholder="Beskriv skaden..." 
                value={damageDetails} 
                onChange={e => setDamageDetails(e.target.value)} 
                className="border-red-200 bg-red-50 focus-visible:ring-red-500"
              />
            )}

            <div className="space-y-2">
               <Label>Egne notater (valgfritt)</Label>
               <Textarea 
                 placeholder="F.eks. porten var treg..." 
                 value={notes} 
                 onChange={e => setNotes(e.target.value)} 
               />
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Avbryt</Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto">Lagre & Fullfør Stopp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
