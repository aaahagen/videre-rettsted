'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/firebase';
import { firebaseDB, toggleFavorite } from '@/lib/firebase/database';
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

  const handleToggleFavorite = async () => {
    if (!authUser || isPending) return;

    setIsPending(true);
    const optimisticFavoriteState = !isFavorite;
    setIsFavorite(optimisticFavoriteState);

    try {
      await toggleFavorite(authUser.uid, placeId);
      // Refresh user data to get the true state
      await fetchUser();
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      // Revert optimistic update on error
      setIsFavorite(!optimisticFavoriteState);
    } finally {
      setIsPending(false);
    }
  };

  if (loading) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
        disabled
      >
        <Star className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleToggleFavorite}
      disabled={isPending}
      className={cn(
        'h-10 w-10 rounded-full bg-black/30 text-white transition-colors hover:bg-black/50 hover:text-white',
        isFavorite && 'text-yellow-400 hover:text-yellow-300',
        isPending && 'animate-pulse'
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={cn('h-5 w-5 transition-transform', isFavorite && 'fill-current')}
      />
    </Button>
  );
}
