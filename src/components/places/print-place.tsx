'use client';

import { Place, Organization } from '@/lib/types';
import { MapPin, Clipboard, FileText, Tag, User, Info } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface PrintPlaceProps {
  place: Place;
  organization: Organization | null;
}

export function PrintPlace({ place, organization }: PrintPlaceProps) {
  const descEnabled = organization?.fieldSettings?.description?.enabled ?? true;
  const descLabel = organization?.fieldSettings?.description?.label || "Beskrivelse & Instruksjoner 1";
  
  const notesEnabled = organization?.fieldSettings?.notes?.enabled ?? true;
  const notesLabel = organization?.fieldSettings?.notes?.label || "Beskrivelse & Instruksjoner 2";

  const field3Enabled = organization?.fieldSettings?.field3?.enabled ?? false;
  const field3Label = organization?.fieldSettings?.field3?.label || "Ekstra Informasjon";

  const formatDate = (dateValue: any) => {
    if (!dateValue) return '';
    const date = dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue);
    return format(date, 'PPP', { locale: nb });
  };

  return (
    <div className="print-place-container hidden print:block print:w-full print:h-full bg-white text-black p-8 page-break-after-always">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight">{place.name}</h1>
          <div className="flex items-center text-lg mt-2 font-medium">
            <MapPin className="mr-2 h-5 w-5" />
            {place.address}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8">
          
          {/* Left Column: Text Info */}
          <div className="space-y-6">
            
            {descEnabled && (place.description || !place.notes) && (
                <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                    <Clipboard className="mr-2 h-4 w-4" />
                    {descLabel}
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {place.description || 'Ingen info.'}
                </p>
                </div>
            )}

            {notesEnabled && place.notes && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {notesLabel}
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {place.notes}
                </p>
              </div>
            )}

            {field3Enabled && place.field3 && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  {field3Label}
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {place.field3}
                </p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2 flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                Hashtags
              </h2>
              <div className="flex flex-wrap gap-2 text-sm">
                {place.hashtags && place.hashtags.length > 0 ? (
                  place.hashtags.map(tag => `#${tag}`).join(', ')
                ) : (
                  '-'
                )}
              </div>
            </div>

            <div className="pt-8 text-xs text-gray-500">
                <p>Utskriftsdato: {new Date().toLocaleDateString('nb-NO')}</p>
                <p>Opprettet: {formatDate(place.createdAt)}</p>
                {place.coordinates && (place.coordinates.lat !== 0 || place.coordinates.lng !== 0) && (
                    <p>GPS: {place.coordinates.lat.toFixed(5)}, {place.coordinates.lng.toFixed(5)}</p>
                )}
            </div>
          </div>

          {/* Right Column: Images */}
          <div className="space-y-4">
            {place.images && place.images.length > 0 ? (
                place.images.slice(0, 4).map((img, index) => (
                    <div key={index} className="border border-gray-200 p-1">
                        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                            {/* We use standard img tag for print to avoid next/image complexity with external domains during print if not configured perfectly, 
                                though next/image usually works. Let's try regular img for reliability in print mode. */}
                            <img 
                                src={img.url} 
                                alt={img.description || `Bilde ${index + 1}`}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {img.description && (
                            <p className="text-xs text-center mt-1 italic text-gray-600">{img.description}</p>
                        )}
                    </div>
                ))
            ) : (
                <div className="border border-dashed border-gray-300 p-8 text-center text-gray-400">
                    Ingen bilder.
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Page break handling via CSS class */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          body { visibility: hidden; }
          .print-place-container { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
          .page-break-after-always { page-break-after: always; }
          /* Hide everything else */
          nav, header, footer, .container, .sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}