import Image from 'next/image';
import Link from 'next/link';
import { Map, Edit, Clock, Hash, MapPin, Shield, ShieldAlert, AlertTriangle, Leaf, Building2 } from 'lucide-react';
import type { DeliveryPlace, Organization } from '@/lib/types';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { firebaseDB } from '@/lib/firebase/database';
import { DangerReportModal } from '../reports/danger-report-modal';
import { useAuth } from '../auth-provider';
import { cn } from '@/lib/utils';

export function PlaceCard({ place, priority = false, orgSettings }: { place: DeliveryPlace; priority?: boolean; orgSettings?: Organization }) {
  const { dbUser } = useAuth();
  const [hasOpenReport, setHasOpenReport] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Feature Gating: 
  // 1. Module Level (Managed by Super Admin in modules object)
  const isModuleActive = orgSettings?.modules?.danger_reports === true;
  
  // 2. Functionality Level (Managed by Org Admin via dangerReportsEnabled toggle)
  const isFunctionalityEnabled = orgSettings?.dangerReportsEnabled !== false;
  
  // The feature is only shown if both the module is active AND the admin has not disabled the functionality
  const showDangerReports = isModuleActive && isFunctionalityEnabled;

  useEffect(() => {
    // Check for open danger reports only if the feature is active
    const checkReports = async () => {
       if(!place.orgId || !showDangerReports) {
           setHasOpenReport(false);
           return;
       }
       try {
           const reports = await firebaseDB.getReports(place.orgId);
           const openForThisPlace = reports.some(r => r.placeId === place.id && r.status === 'open');
           setHasOpenReport(openForThisPlace);
       } catch (error) {
           console.error("Failed to fetch reports", error);
       }
    };
    checkReports();
  }, [place.id, place.orgId, showDangerReports]);

  // Check if coordinates exist and are not the default (0,0)
  const hasCoordinates = place.coordinates && (place.coordinates.lat !== 0 || place.coordinates.lng !== 0);
  
  // Check if HMS checklist is filled
  const hasHmsData = place.hmsData && (
    (place.hmsData.answers && Object.keys(place.hmsData.answers).length > 0) || 
    place.hmsData.comment
  );

  const isSalesMessageActive = () => {
    if (!place.salesMessage) return false;
    if (!place.salesMessageValidUntil) return true; // No expiration = always active
    const validUntil = new Date(place.salesMessageValidUntil);
    return validUntil >= new Date();
  };

  const gmapsUrl = hasCoordinates 
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates?.lat},${place.coordinates?.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;

  const showHmsButton = !hasHmsData && orgSettings?.hmsSettings?.enabled;

  return (
    <>
    <Card 
      id={`place-${place.id}`} 
      className={`flex flex-col overflow-hidden transition-all hover:shadow-xl scroll-mt-24 ${showDangerReports && hasOpenReport ? 'border-2 border-red-500 shadow-red-500/20 shadow-lg' : ''}`}
    >
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
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            <FavoriteButton placeId={place.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="font-headline text-lg break-words leading-tight flex-1">{place.name}</CardTitle>
            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                {place.estimatedDeliveryTime && place.estimatedDeliveryTime > 0 ? (
                    <Badge variant="outline" className="text-[10px] font-bold tracking-tight text-slate-500 flex items-center gap-1 bg-white">
                        <Clock className="h-3 w-3" />
                        {place.estimatedDeliveryTime} min
                    </Badge>
                ) : null}
            </div>
        </div>
        <CardDescription className="mt-1 flex-grow">
          {place.address}
        </CardDescription>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {place.customerNumber && (
                <Badge className="bg-slate-100 text-slate-700 border-slate-200 shadow-sm hover:bg-slate-200 flex items-center gap-1 font-mono text-[10px] px-2 py-0.5">
                    <Hash className="h-3 w-3" />
                    {place.customerNumber}
                </Badge>
            )}
            {hasHmsData && (
                <Badge className="bg-red-50 text-red-600 border-red-100 shadow-sm flex items-center justify-center font-bold text-[10px] w-6 h-6 p-0 rounded-md" title="HMS Sjekkliste er utfylt">
                    <Shield className="h-3.5 w-3.5 fill-red-50" />
                </Badge>
            )}
            {hasCoordinates && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 shadow-sm flex items-center justify-center font-bold text-[10px] w-6 h-6 p-0 rounded-md" title="Koordinater registrert - Klar for ruteplanlegging">
                    <MapPin className="h-3.5 w-3.5" />
                </Badge>
            )}
            {place.isCityCenter && (
                <Badge className="bg-blue-50 text-blue-600 border-blue-100 shadow-sm flex items-center justify-center font-bold text-[10px] w-6 h-6 p-0 rounded-md" title="Sentrumskjerne">
                    <Building2 className="h-3.5 w-3.5" />
                </Badge>
            )}
            {place.isZeroEmissionZone && (
                <Badge className="bg-green-50 text-green-600 border-green-100 shadow-sm flex items-center justify-center font-bold text-[10px] w-6 h-6 p-0 rounded-md" title="Nullutslippssone">
                    <Leaf className="h-3.5 w-3.5" />
                </Badge>
            )}
        </div>

        {isSalesMessageActive() && (
            <Alert className="mt-3 bg-amber-50 border-amber-200 py-2">
              <AlertDescription className="text-amber-800 text-xs font-bold leading-snug">
                {place.salesMessage}
              </AlertDescription>
            </Alert>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {place.hashtags && place.hashtags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 p-4 pt-0">
        {showHmsButton && (
            <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className={cn(
                    "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
                    !showDangerReports ? "col-span-2" : "col-span-1"
                )}
            >
                <Link href={`/dashboard/places/${place.id}?tab=hms`}>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Fyll ut HMS
                </Link>
            </Button>
        )}
        {showDangerReports && (
            <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                    "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
                    !showHmsButton ? "col-span-2" : "col-span-1"
                )}
                onClick={() => setIsReportModalOpen(true)}
            >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Meld Avvik
            </Button>
        )}
        <Button variant="outline" size="sm" asChild className="col-span-1">
            <Link href={`/dashboard/places/${place.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Se mer
            </Link>
        </Button>
        <Button
            size="sm"
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90 col-span-1"
        >
            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                <Map className="mr-2 h-4 w-4" />
                Naviger
            </a>
        </Button>
      </CardFooter>
    </Card>

    <DangerReportModal 
        place={place} 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSuccess={() => setHasOpenReport(true)} 
    />
    </>
  );
}
