import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-24 w-24 items-center justify-center bg-transparent overflow-hidden',
        className
      )}
    >
      <Image
        src="/icon.png"
        alt="VIDERE RettSted Logo"
        width={96}
        height={96}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  );
}
