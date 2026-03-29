import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        className
      )}
      style={{ width: '40px', height: '40px' }} // Explicit size for the container
    >
      <Image
        src="/icon.png"
        alt="VIDERE RettSted Logo"
        fill // Use fill to make image cover the container
        sizes="40px" // Hint for Next.js image optimization
        className="object-contain" // Keep aspect ratio
        priority
      />
    </div>
  );
}
