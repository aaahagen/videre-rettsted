const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetProgress = `<div className="flex items-center justify-between relative z-10">
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
              </p>`;

const newProgress = `<div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-yellow-500" />
                     <h2 className="font-semibold text-sm sm:text-base text-slate-800">Din Utforsker-status</h2>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {Math.round((userData.visitedPlaces?.length || 0) / (places.length || 1) * 100)}% Utforsket
                  </span>
              </div>
              
              <div className="relative z-10">
                 <Progress value={(userData.visitedPlaces?.length || 0) / (places.length || 1) * 100} className="h-2 bg-slate-100" />
              </div>
              
              <p className="text-xs text-muted-foreground relative z-10">
                  Du har levert til {userData.visitedPlaces?.length || 0} av organisasjonens {places.length} steder. Utforsk mer for å fylle baren!
              </p>`;

content = content.replace(targetProgress, newProgress);
fs.writeFileSync(file, content);
