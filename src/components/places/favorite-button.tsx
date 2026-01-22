'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { toggleFavorite } from '@/lib/data';

export function FavoriteButton({ placeId }: { placeId: string }) {
  const { user, loading } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (user) {
      setIsFavorite(user.favoritePlaces.includes(placeId));
    }
  }, [user, placeId]);

  const handleToggleFavorite = async () => {
    if (!user || isPending) return;

    setIsPending(true);
    const optimisticFavoriteState = !isFavorite;
    setIsFavorite(optimisticFavoriteState);

    try {
      await toggleFavorite(placeId);
      // In a real app with a real backend, you might re-fetch user data
      // or trust the optimistic update.
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
        <Heart className="h-5 w-5" />
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
        isFavorite && 'text-red-500 hover:text-red-400',
        isPending && 'animate-pulse'
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn('h-5 w-5 transition-transform', isFavorite && 'fill-current')}
      />
    </Button>
  );
}
