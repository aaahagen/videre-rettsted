'use client';

import { useEffect } from 'react';
import useUpdateNotifier from '@/hooks/useUpdateNotifier';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function UpdateNotifier() {
  const { isUpdateAvailable, refreshPage } = useUpdateNotifier();
  const { toast } = useToast();

  useEffect(() => {
    if (isUpdateAvailable) {
      toast({
        title: "Oppdatering tilgjengelig",
        description: "En ny versjon av appen er klar. Vennligst oppdater for å få de nyeste funksjonene.",
        duration: Infinity,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshPage}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Oppdater nå
          </Button>
        ),
      });
    }
  }, [isUpdateAvailable, refreshPage, toast]);

  return null;
}
