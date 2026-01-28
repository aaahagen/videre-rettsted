import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full bg-primary overflow-hidden',
        className
      )}
    >
      <Image
        src="/videre_icon.png.png"
        alt="Videre RettSted Logo"
        width={48}
        height={48}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
