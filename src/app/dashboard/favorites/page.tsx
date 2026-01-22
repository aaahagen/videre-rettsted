import { getFavoritePlaces } from '@/lib/data';
import { PlaceGrid } from '@/components/places/place-grid';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function FavoritesPage() {
  const favoritePlaces = await getFavoritePlaces();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Favorite Places
          </CardTitle>
          <CardDescription>
            Your most visited or important delivery locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceGrid places={favoritePlaces} />
        </CardContent>
      </Card>
    </div>
  );
}
