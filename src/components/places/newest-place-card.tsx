'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { Place } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface NewestPlaceCardProps {
  orgId: string;
}

export const NewestPlaceCard = ({ orgId }: NewestPlaceCardProps) => {
  const [newestPlace, setNewestPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) {
        setLoading(false);
        return;
    };

    const q = query(
        collection(db, 'places'), 
        where('orgId', '==', orgId),
        orderBy('createdAt', 'desc'), 
        limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const placeDoc = snapshot.docs[0];
        setNewestPlace({ id: placeDoc.id, ...placeDoc.data() } as Place);
      } else {
        setNewestPlace(null);
      }
      setLoading(false);
    }, (error) => {
        // If it's the specific "index building" error, we might just want to silently fail 
        // or show a specific message. For now, just logging it is fine.
        console.error("Error fetching newest place:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [orgId]);

  if (loading) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse flex flex-col h-full">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-slate-200 rounded w-full mb-4"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-full mt-auto"></div>
        </div>
    );
  }

  if (!newestPlace) {
    return null; 
  }

  const mainImage = newestPlace.images?.find(img => img.isMain)?.url || newestPlace.images?.[0]?.url;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Nyeste Sted
            </h3>
        </div>

        {mainImage ? (
             <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                 <Image 
                     src={mainImage} 
                     alt={`Bilde av ${newestPlace.name}`}
                     fill
                     className="object-cover"
                 />
             </div>
        ) : (
            <div className="w-full h-32 mb-4 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                 <ImageIcon className="h-8 w-8 text-slate-300" />
            </div>
        )}

        <div className="mb-4">
            <p className="font-bold text-slate-800 truncate">{newestPlace.name}</p>
            <p className="text-sm text-slate-500 truncate">{newestPlace.address}</p>
        </div>

        <div className="mt-auto pt-2 shrink-0">
            <Button asChild size="sm" className="w-full">
                <Link href={`/dashboard/places/${newestPlace.id}`}>
                    Se Detaljer <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
            </Button>
        </div>
    </div>
  );
};
