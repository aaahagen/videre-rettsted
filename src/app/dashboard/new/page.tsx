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
            Opprett Nytt Leveringssted
          </CardTitle>
          <CardDescription>
            Legg til en ny lokasjon med alle nødvendige detaljer for fremtidige leveringer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceForm />
        </CardContent>
      </Card>
    </div>
  );
}
