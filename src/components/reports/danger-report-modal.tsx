import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { firebaseDB } from '@/lib/firebase/database';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from './image-uploader';
import { DeliveryPlace } from '@/lib/types';

interface DangerReportModalProps {
  place: DeliveryPlace;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DangerReportModal({ place, isOpen, onClose, onSuccess }: DangerReportModalProps) {
  const { dbUser } = useAuth();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({ title: 'Mangler beskrivelse', description: 'Du må beskrive avviket.', variant: 'destructive' });
      return;
    }
    if (!dbUser?.orgId) return;

    setIsSubmitting(true);
    try {
      await firebaseDB.createReport({
        orgId: dbUser.orgId,
        placeId: place.id,
        placeName: place.name,
        reportedBy: dbUser.id,
        reportedByName: dbUser.name || 'Ukjent bruker',
        description,
        images,
      });

      toast({
        title: 'Avvik rapportert',
        description: 'Takk for at du sier ifra. Avviket er registrert.',
      });
      setDescription('');
      setImages([]);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Feil', description: 'Kunne ikke lagre rapporten.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Meld Avvik / Fare
          </DialogTitle>
          <DialogDescription>
            Rapporter et problem på <strong>{place.name}</strong>. Dette vil markere stedet frem til problemet er løst.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-bold">Beskrivelse av problemet</label>
            <Textarea
              placeholder="F.eks. Lasterampen er ødelagt, ekstremt glatt utenfor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Bilder (Valgfritt, maks 3)</label>
            {dbUser?.orgId && (
              <ImageUploader 
                orgId={dbUser.orgId} 
                onImagesChange={setImages} 
                maxImages={3} 
              />
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !description.trim()} className="bg-orange-600 hover:bg-orange-700 text-white">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Rapport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}