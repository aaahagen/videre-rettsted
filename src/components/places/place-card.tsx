import Image from 'next/image';
import Link from 'next/link';
import { Map, Edit, Clock } from 'lucide-react';
import type { DeliveryPlace } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { FavoriteButton } from './favorite-button';

export function PlaceCard({ place, priority = false }: { place: DeliveryPlace; priority?: boolean }) {
  // Check if coordinates exist and are not the default (0,0)
  const hasCoordinates = place.coordinates && (place.coordinates.lat !== 0 || place.coordinates.lng !== 0);
  
  const gmapsUrl = hasCoordinates 
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates?.lat},${place.coordinates?.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;

  return (
    <Card id={`place-${place.id}`} className="flex flex-col overflow-hidden transition-all hover:shadow-xl scroll-mt-24">
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={place.imageUrl || '/icon.png'}
              alt={place.name}
              fill
              className="object-cover"
              data-ai-hint={place.imageHint}
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </AspectRatio>
          <div className="absolute right-2 top-2">
            <FavoriteButton placeId={place.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4">
        <CardTitle className="font-headline text-lg">{place.name}</CardTitle>
        <CardDescription className="mt-1 flex-grow">
          {place.address}
        </CardDescription>
        <div className="mt-4 flex flex-wrap gap-2">
          {place.hashtags && place.hashtags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className="flex items-center text-sm font-medium text-slate-500">
            {place.estimatedDeliveryTime && place.estimatedDeliveryTime > 0 ? (
                <>
                    <Clock className="mr-1.5 h-4 w-4" />
                    {place.estimatedDeliveryTime} min
                </>
            ) : null}
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/places/${place.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Se mer
            </Link>
            </Button>
            <Button
            size="sm"
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                <Map className="mr-2 h-4 w-4" />
                Naviger
            </a>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}