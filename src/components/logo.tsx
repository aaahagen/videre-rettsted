import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-24 w-24 items-center justify-center rounded-lg bg-primary overflow-hidden',
        className
      )}
    >
      <Image
        src="/icon.png"
        alt="Videre RettSted Logo"
        width={96}
        height={96}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
