const fs = require('fs');
const file = 'src/components/layout/sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
const targetImport = `import { collection, query, where, onSnapshot as onSnapshotFirestore } from 'firebase/firestore';`;
const newImport = `import { collection, query, where, onSnapshot as onSnapshotFirestore } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase/database';`;

content = content.replace(targetImport, newImport);

// State for places to calculate progress
const targetState = `  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);`;

const newState = `  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalPlacesCount, setTotalPlacesCount] = useState(0);`;

content = content.replace(targetState, newState);

// Add places fetch
const targetEffect = `    if (dbUser?.orgId) {
      setOrgLoading(true);`;

const newEffect = `    if (dbUser?.orgId) {
      setOrgLoading(true);

      // Fetch places count for gamification
      firebaseDB.getPlaces(dbUser.orgId).then(places => {
          setTotalPlacesCount(places.length);
      }).catch(err => console.error("Error fetching places count:", err));
      `;

content = content.replace(targetEffect, newEffect);

// Add Progress Bar to DropdownMenuContent
const targetMenuContent = `                  <DropdownMenuContent
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  >
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">`;

const newMenuContent = `                  <DropdownMenuContent
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg pb-2"
                  >
                    {!isAdmin && totalPlacesCount > 0 && (
                        <div className="px-3 py-3 border-b border-slate-100 mb-1 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Utforsker-status</span>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded-full">
                                    {Math.round(((dbUser?.visitedPlaces?.length || 0) / totalPlacesCount) * 100)}%
                                </span>
                            </div>
                            <Progress value={((dbUser?.visitedPlaces?.length || 0) / totalPlacesCount) * 100} className="h-1.5 bg-slate-200" />
                            <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
                                Du har utforsket {dbUser?.visitedPlaces?.length || 0} av {totalPlacesCount} steder i din organisasjon.
                            </p>
                        </div>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive mt-1">`;

content = content.replace(targetMenuContent, newMenuContent);
fs.writeFileSync(file, content);

// Also remove from dashboard page
const pageFile = 'src/app/dashboard/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

const targetPageProgress = `      {/* Gamification Progress Bar */}
      {userData && places.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between relative z-10">
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
              </p>
          </div>
      )}`;

pageContent = pageContent.replace(targetPageProgress, '');
fs.writeFileSync(pageFile, pageContent);

