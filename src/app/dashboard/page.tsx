import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { getPlaces } from '@/lib/data';
import { PlaceGrid } from '@/components/places/place-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function DashboardPage() {
  const places = await getPlaces();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">
              Delivery Places
            </CardTitle>
            <CardDescription>
              Search and manage your delivery locations.
            </CardDescription>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/dashboard/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Place
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by name, address, or #hashtag..."
              className="max-w-lg"
            />
          </div>
          <PlaceGrid places={places} />
        </CardContent>
      </Card>
    </div>
  );
}
