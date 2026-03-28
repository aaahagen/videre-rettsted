const fs = require('fs');

const routesOverviewFile = 'src/app/dashboard/routes/page.tsx';
let code = fs.readFileSync(routesOverviewFile, 'utf8');

// 1. Change the top border line color
const originalLineColor = `<div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />`;
const newLineColor = `<div className="h-2 w-full bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500" />`;
code = code.replace(originalLineColor, newLineColor);

// 2. Change icon/title colors from indigo to blue
const originalIconColor = `<div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">`;
const newIconColor = `<div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">`;
code = code.replace(originalIconColor, newIconColor);

const originalTitleColor = `<CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">`;
const newTitleColor = `<CardTitle className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">`;
code = code.replace(originalTitleColor, newTitleColor);

// 3. Re-organize the stats into two rows
const originalStatsRow = `{/* Stats Row */}
                <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-x-auto custom-scrollbar pb-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <MapPin className="h-5 w-5 text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stopp</span>
                      <span className="text-sm font-bold text-slate-700 leading-none">{route.places?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-200 shrink-0" />
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <RouteIcon className="h-5 w-5 text-cyan-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distanse</span>
                      <span className="text-sm font-semibold text-slate-700 leading-none">
                        {route.distanceString || '--'}
                      </span>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-slate-200 shrink-0" />

                  <div className="flex items-center gap-2 shrink-0">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tid</span>
                      <span className="text-sm font-semibold text-slate-700 leading-none">
                        {route.duration || '--'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-200 shrink-0" />
                  
                  <div className="flex items-center gap-2 shrink-0 max-w-[120px]">
                    <Car className="h-5 w-5 text-emerald-400" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sjåfør</span>
                      <span className="text-sm font-semibold text-slate-700 leading-none truncate" title={organizationUsers.find(u => u.id === route.driverId)?.name || 'Ingen'}>
                         {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name?.split(' ')[0] || 'Tildelt') : <span className="text-rose-500 italic text-xs">Mangler</span>}
                      </span>
                    </div>
                  </div>
                </div>`;

const newStatsRow = `{/* Stats Rows */}
                <div className="flex flex-col gap-2">
                  {/* Row 1: Stops & Distance */}
                  <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100 w-full">
                    <div className="flex-1 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stopp</span>
                        <span className="text-sm font-bold text-slate-700 leading-none">{route.places?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-slate-200 mx-2 shrink-0" />
                    
                    <div className="flex-1 flex items-center gap-2 justify-start">
                      <RouteIcon className="h-5 w-5 text-cyan-500 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distanse</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none">
                          {route.distanceString || '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Time & Driver */}
                  <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100 w-full">
                    <div className="flex-1 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Tid</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none">
                          {route.duration || '--'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-slate-200 mx-2 shrink-0" />
                    
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <Car className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sjåfør</span>
                        <span className="text-sm font-semibold text-slate-700 leading-none truncate" title={organizationUsers.find(u => u.id === route.driverId)?.name || 'Ingen'}>
                           {route.driverId ? (organizationUsers.find(u => u.id === route.driverId)?.name?.split(' ')[0] || 'Tildelt') : <span className="text-rose-500 italic text-xs">Mangler</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>`;

code = code.replace(originalStatsRow, newStatsRow);
fs.writeFileSync(routesOverviewFile, code);
