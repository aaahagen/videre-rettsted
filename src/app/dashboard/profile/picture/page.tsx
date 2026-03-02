'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { firebaseAuth } from '@/lib/firebase/auth';
import { firebaseStorage } from '@/lib/firebase/storage';
import { firebaseDB } from '@/lib/firebase/database';
import { Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';

export default function ProfilePicturePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (user?.photoURL) {
      setPreview(user.photoURL);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const path = `users/${currentUser.uid}/avatar_${Date.now()}`;
      const url = await firebaseStorage.uploadFile(path, file);

      await firebaseAuth.updateProfile({ photoURL: url });
      await firebaseDB.updateUser(currentUser.uid, { avatarUrl: url });

      toast({
        title: 'Profilbilde oppdatert',
        description: 'Ditt nye profilbilde er lagret.',
      });

      router.refresh();
      router.push('/dashboard'); 
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: 'Feil ved opplasting',
        description: `Kunne ikke laste opp profilbilde: ${error.message || 'Ukjent feil'}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Endre profilbilde</CardTitle>
          <CardDescription>
            Last opp et nytt bilde for å vise hvem du er.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div 
            className="relative group cursor-pointer"
            onClick={triggerFileInput}
          >
            <Avatar className="h-32 w-32 border-4 border-muted">
              <AvatarImage src={preview || ''} className="object-cover" />
              <AvatarFallback className="text-4xl">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="grid w-full gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={triggerFileInput} className="w-full">
              Velg bilde
            </Button>
          </div>

          <div className="flex w-full gap-2">
            <Button 
              variant="default" 
              className="w-full" 
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lagre profilbilde
            </Button>
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => router.push('/dashboard')}
              disabled={uploading}
            >
              Avbryt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
