import { Logo } from '@/components/logo';

export function SplashScreen() {
  return (
    <div className="flex flex-col h-[50vh] min-h-[400px] w-full items-center justify-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6">
        
        {/* Bouncing logo */}
        <div className="animate-bounce">
          <Logo className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" />
        </div>
        
        {/* Slogan */}
        <div className="flex flex-col items-center gap-2 text-center mt-2">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-800 uppercase">
            Videre RettSted
          </h2>
          <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">
            Presisjon helt frem til døren
          </p>
        </div>

      </div>
    </div>
  );
}
