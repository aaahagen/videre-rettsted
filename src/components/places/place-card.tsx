import Image from 'next/image';
import Link from 'next/link';
import { Map, Edit } from 'lucide-react';
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

export function PlaceCard({ place }: { place: DeliveryPlace }) {
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={place.imageUrl}
              alt={place.name}
              fill
              className="object-cover"
              data-ai-hint={place.imageHint}
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
          {place.hashtags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/places/${place.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
        <Button
          size="sm"
          asChild
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
            <Map className="mr-2 h-4 w-4" />
            Navigate
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
