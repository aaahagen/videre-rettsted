import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Loader2, UploadCloud, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseStorage } from '@/lib/firebase/storage';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  orgId: string;
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ orgId, onImagesChange, maxImages = 3 }: ImageUploaderProps) {
  const [images, setImages] = useState<{ file?: File; preview: string; url?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = (file: File, callback: (preview: string, resizedFile: File) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const preview = canvas.toDataURL('image/jpeg', 0.8);
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
              callback(preview, resizedFile);
            }
          }, 'image/jpeg', 0.8);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const newImages = [...images];
      const newUrls: string[] = [];

      for (const file of filesToProcess) {
        await new Promise<void>((resolve, reject) => {
          processFile(file, async (preview, resizedFile) => {
            try {
              const fileName = `reports/${orgId}/${uuidv4()}-${file.name}`;
              const url = await firebaseStorage.uploadFile(fileName, resizedFile);
              newImages.push({ preview, url });
              newUrls.push(url);
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        });
      }

      setImages(newImages);
      // We need to pass back all existing URLs plus the new ones
      const allUrls = newImages.map(img => img.url).filter(Boolean) as string[];
      onImagesChange(allUrls);
    } catch (error) {
      console.error(error);
      toast({
        title: "Opplasting feilet",
        description: "Kunne ikke laste opp bilde.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    onImagesChange(newImages.map(img => img.url).filter(Boolean) as string[]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-slate-100 border">
            <Image src={img.preview} alt="Opplastet bilde" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            className="h-full aspect-square border-dashed flex flex-col gap-2 relative overflow-hidden text-slate-500 hover:text-slate-700"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UploadCloud className="h-5 w-5" />
                <span className="text-[10px]">Legg til</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleAddImages}
            />
          </Button>
        )}
      </div>
      
      <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          ref={cameraInputRef}
          onChange={handleAddImages}
        />
        <Button 
            type="button" 
            variant="secondary" 
            size="sm"
            className="w-full"
            onClick={(e) => {
                e.preventDefault();
                cameraInputRef.current?.click();
            }}
            disabled={images.length >= maxImages || isUploading}
        >
            <Camera className="h-4 w-4 mr-2" /> 
            Ta bilde med kamera
        </Button>
    </div>
  );
}