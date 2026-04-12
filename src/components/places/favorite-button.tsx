'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { firebaseDB } from '@/lib/firebase/database';
import { User } from '@/lib/types';

export function FavoriteButton({ placeId }: { placeId: string }) {
  const [authUser, loading] = useAuthState(auth);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const fetchUser = async () => {
    if (authUser) {
      const userData = await firebaseDB.getUser(authUser.uid);
      setDbUser(userData);
      if (userData?.favorites) {
        setIsFavorite(userData.favorites.includes(placeId));
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [authUser, placeId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authUser || isPending) return;

    setIsPending(true);
    try {
      await firebaseDB.toggleFavorite(authUser.uid, placeId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsPending(false);
    }
  };

  if (loading || !authUser) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "h-8 w-8 rounded-full bg-white/80 hover:bg-white",
        isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-gray-600"
      )}
    >
      <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
    </Button>
  );
}
