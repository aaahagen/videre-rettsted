import { PlaceForm } from '@/components/places/place-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NewPlacePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Create New Delivery Place
          </CardTitle>
          <CardDescription>
            Add a new location with all the necessary details for future
            deliveries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceForm />
        </CardContent>
      </Card>
    </div>
  );
}
