import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground',
        className
      )}
    >
      <MapPin className="h-6 w-6" />
    </div>
  );
}
