const fs = require('fs');

const routesDetailsFile = 'src/app/dashboard/routes/[id]/page.tsx';
let code = fs.readFileSync(routesDetailsFile, 'utf8');

const originalSaveFn = `  const handleSave = async () => {
    if (!route) return;
    setIsSaving(true);
    try {
      const updatedRoute = {
        ...route,
        places: routePlaces.map(p => p.id),
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? null : duration,
      };`;

const replacementSaveFn = `  const handleSave = async () => {
    if (!route) return;
    setIsSaving(true);
    try {
      const updatedRoute = {
        ...route,
        places: routePlaces.map(p => p.id),
        prepTimeStart,
        prepTimeEnd,
        breakTime,
        fuelServiceTime,
        duration: duration === 'N/A' ? null : duration,
        distanceString: distance === 'N/A' || distance === 'Error' ? null : distance,
      };`;

code = code.replace(originalSaveFn, replacementSaveFn);
fs.writeFileSync(routesDetailsFile, code);

// -------------------------------------------------------------
// Update types.ts

const typesFile = 'src/lib/types.ts';
let typesCode = fs.readFileSync(typesFile, 'utf8');

const originalRouteType = `export interface Route {
  id: string;
  name: string;
  orgId: string; // Database field is orgId
  organizationId?: string;
  places: string[]; // array of placeIds
  driverId?: string;
  distance?: number; // in kilometers
  duration?: string; // e.g., "1 t 23 min"
  prepTimeStart?: number; // in minutes
  prepTimeEnd?: number; // in minutes
  breakTime?: number; // in minutes
  fuelServiceTime?: number; // in minutes
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}`;

const replacementRouteType = `export interface Route {
  id: string;
  name: string;
  orgId: string; // Database field is orgId
  organizationId?: string;
  places: string[]; // array of placeIds
  driverId?: string;
  distance?: number; // in kilometers
  distanceString?: string; // e.g. "10.5 km"
  duration?: string; // e.g., "1 t 23 min"
  prepTimeStart?: number; // in minutes
  prepTimeEnd?: number; // in minutes
  breakTime?: number; // in minutes
  fuelServiceTime?: number; // in minutes
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}`;

typesCode = typesCode.replace(originalRouteType, replacementRouteType);
fs.writeFileSync(typesFile, typesCode);

// -------------------------------------------------------------
// Update the Routes list page card

const routesOverviewFile = 'src/app/dashboard/routes/page.tsx';
let overviewCode = fs.readFileSync(routesOverviewFile, 'utf8');

const originalStatsRow = `{/* Stats Row */}
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
                        {route.duration ? route.duration : '--'}
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

const newStatsRow = `{/* Stats Row */}
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

overviewCode = overviewCode.replace(originalStatsRow, newStatsRow);
fs.writeFileSync(routesOverviewFile, overviewCode);
