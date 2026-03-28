const fs = require('fs');

const routesOverviewFile = 'src/app/dashboard/routes/page.tsx';
let code = fs.readFileSync(routesOverviewFile, 'utf8');

// Modify the Stats Row to include duration
const originalStatsRow = `{/* Stats Row */}
                <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stopp</span>
                      <span className="text-lg font-bold text-slate-700 leading-none">{route.places?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-200" />
                  
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sjåfør</span>
                      <span className="text-sm font-semibold text-slate-700 leading-none truncate max-w-[100px]" title={organizationUsers.find(u => u.id === route.driverId)?.name || 'Ingen'}>
                         {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name?.split(' ')[0] || 'Tildelt') : <span className="text-amber-500 italic">Mangler</span>}
                      </span>
                    </div>
                  </div>
                </div>`;

const newStatsRow = `{/* Stats Row */}
                <div className="flex items-center gap-4 sm:gap-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-indigo-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stopp</span>
                      <span className="text-lg font-bold text-slate-700 leading-none">{route.places?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-200 shrink-0" />

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tid</span>
                      <span className="text-sm font-semibold text-slate-700 leading-none">
                        {route.duration || '--'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-200 shrink-0" />
                  
                  <div className="flex items-center gap-2 min-w-0">
                    <Car className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sjåfør</span>
                      <span className="text-sm font-semibold text-slate-700 leading-none truncate" title={organizationUsers.find(u => u.id === route.driverId)?.name || 'Ingen'}>
                         {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name?.split(' ')[0] || 'Tildelt') : <span className="text-rose-500 italic text-xs">Mangler</span>}
                      </span>
                    </div>
                  </div>
                </div>`;

code = code.replace(originalStatsRow, newStatsRow);
fs.writeFileSync(routesOverviewFile, code);
