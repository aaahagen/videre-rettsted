import { Logo } from '@/components/logo';

export function SplashScreen() {
  return (
    <div className="flex flex-col h-[50vh] min-h-[400px] w-full items-center justify-center animate-in fade-in duration-500">
      <div className="relative flex flex-col items-center">
        {/* Pulsing ring effect behind logo */}
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ transform: 'scale(1.5)' }} />
        
        {/* Main logo */}
        <Logo className="w-16 h-16 sm:w-20 sm:h-20" />
        
        {/* Loading text (optional, commented out for cleaner look) */}
        {/* <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse">Laster...</p> */}
      </div>
    </div>
  );
}
