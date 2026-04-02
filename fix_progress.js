const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetImport = `import { PlaceGrid } from '@/components/places/place-grid';
import { Loader2, Star, SearchX } from 'lucide-react';
import { DeliveryPlace, User } from '@/lib/types';
import { Button } from '@/components/ui/button';`;

const newImport = `import { PlaceGrid } from '@/components/places/place-grid';
import { Loader2, Star, SearchX, Trophy } from 'lucide-react';
import { DeliveryPlace, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';`;

content = content.replace(targetImport, newImport);

const targetRender = `      {filteredPlaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">`;

const newRender = `      {/* Gamification Progress Bar */}
      {userData && places.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-yellow-500" />
                     <h2 className="font-semibold text-sm sm:text-base text-slate-800">Din Utforsker-status</h2>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {Math.round((userData.favorites?.length || 0) / places.length * 100)}% Låst opp
                  </span>
              </div>
              
              <div className="relative z-10">
                 <Progress value={(userData.favorites?.length || 0) / places.length * 100} className="h-2 bg-slate-100" />
              </div>
              
              <p className="text-xs text-muted-foreground relative z-10">
                  Du har lagret {userData.favorites?.length || 0} av {places.length} steder. Utforsk mer for å fylle baren!
              </p>
          </div>
      )}

      {filteredPlaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">`;

content = content.replace(targetRender, newRender);
fs.writeFileSync(file, content);
