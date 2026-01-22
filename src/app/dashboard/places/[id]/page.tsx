import { getPlaceById } from '@/lib/data';
import { PlaceForm } from '@/components/places/place-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { notFound } from 'next/navigation';

export default async function EditPlacePage({
  params,
}: {
  params: { id: string };
}) {
  const place = await getPlaceById(params.id);

  if (!place) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Edit: {place.name}
          </CardTitle>
          <CardDescription>
            Update the details for this delivery location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* In a real app, PlaceForm would take the 'place' prop
              and pre-fill the form fields. */}
          <PlaceForm />
        </CardContent>
      </Card>
    </div>
  );
}
