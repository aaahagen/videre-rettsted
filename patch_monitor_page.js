const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/monitor/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add ChevronDown, ChevronUp, ExternalLink to imports
content = content.replace(
    /Route as RouteIcon, Activity \} from 'lucide-react';/,
    "Route as RouteIcon, Activity, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';"
);

// 2. Add Link to imports
if (!content.includes("import Link from 'next/link';")) {
    content = content.replace(
        "import { useRouter } from 'next/navigation';",
        "import { useRouter } from 'next/navigation';\nimport Link from 'next/link';"
    );
}

// 3. Add state for expanded routes
content = content.replace(
    /const \{ query: searchQuery, setContext \} = useSearch\(\);/,
    "const { query: searchQuery, setContext } = useSearch();\n  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});\n\n  const toggleRouteExpansion = (routeId: string) => {\n    setExpandedRoutes(prev => ({ ...prev, [routeId]: !prev[routeId] }));\n  };"
);

// 4. Update the Route Card rendering
const oldCardHeaderContentRegex = /<CardHeader className="pb-2">[\s\S]*?<\/CardHeader>/;

const newCardHeaderContent = `<CardHeader className="pb-2 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => toggleRouteExpansion(route.id)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {route.name}
                        {isFinished && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                         <span className="flex items-center gap-1"><Car className="h-4 w-4" /> {driverName}</span>
                         {route.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {route.duration}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant={isFinished ? 'default' : 'secondary'} className={isFinished ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {completedPlacesCount} / {totalStops} fullført
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {expandedRoutes[route.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                </CardHeader>`;

content = content.replace(oldCardHeaderContentRegex, newCardHeaderContent);


// 5. Update the Places List rendering inside the card
const oldPlacesListRegex = /<div className="relative border-l-2 border-slate-100 ml-3 pl-4 space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/CardContent>/;

const newPlacesList = `<div className="relative border-l-2 border-slate-100 ml-3 pl-4 space-y-4">
                          {route.places?.map((placeId, index) => {
                             const isCompleted = route.completedStops?.includes(\`place_\${placeId}\`);
                             const place = places[placeId];
                             
                             const firstUncompletedIndex = route.places.findIndex(id => !(route.completedStops?.includes(\`place_\${id}\`)));
                             const isCurrent = index === firstUncompletedIndex;
                             
                             const isExpanded = expandedRoutes[route.id];
                             const shouldShow = isExpanded || index === 0 || index === totalStops - 1 || isCurrent || index === firstUncompletedIndex - 1 || index === firstUncompletedIndex + 1;
                             
                             if (!shouldShow) {
                                if (index === 1 && firstUncompletedIndex > 2) return <div key={\`ellipsis-\${index}\`} className="text-xs text-muted-foreground pl-2 py-1">... \${firstUncompletedIndex - 1} fullførte stopp skjult ...</div>;
                                if (index === firstUncompletedIndex + 2 && index < totalStops - 1) return <div key={\`ellipsis-\${index}\`} className="text-xs text-muted-foreground pl-2 py-1">... \${totalStops - 1 - (firstUncompletedIndex + 1)} gjenstående stopp skjult ...</div>;
                                return null;
                             }

                             return (
                               <div key={placeId} className={\`relative flex items-center justify-between p-2 rounded-md \${isCurrent ? 'bg-primary/5 border border-primary/20 shadow-sm -ml-5 pl-5 z-10' : ''} \${isCompleted ? 'opacity-60' : 'hover:bg-slate-50'}\`}>
                                  <div className={\`absolute -left-[21px] flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-white \${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary animate-pulse' : 'bg-slate-300'}\`} />
                                  
                                  <div className="flex flex-col min-w-0 pr-4">
                                      <Link href={\`/dashboard/places/\${placeId}\`} className="hover:underline flex items-center gap-2 group">
                                          <span className={\`text-sm font-medium truncate \${isCompleted ? 'line-through text-slate-500' : isCurrent ? 'text-primary' : 'text-slate-700'}\`}>
                                              {place?.name || 'Laster sted...'}
                                          </span>
                                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                      </Link>
                                      {place?.address && <span className="text-xs text-muted-foreground truncate">{place.address}</span>}
                                  </div>
                                  
                                  <div className="shrink-0 flex items-center gap-2">
                                      {/* Timestamp placeholder - requires data model update to be real */}
                                      {isCompleted && <span className="text-[10px] text-muted-foreground hidden sm:inline-block">Fullført</span>}
                                      {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : isCurrent ? <Badge variant="default" className="text-[10px] h-5">Neste</Badge> : <Circle className="h-4 w-4 text-slate-200" />}
                                  </div>
                               </div>
                             );
                          })}
                          
                          {totalStops === 0 && (
                             <div className="text-sm text-muted-foreground py-2 italic flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Ruten har ingen stopp enda.
                             </div>
                          )}
                      </div>
                   </div>
                </CardContent>`;

content = content.replace(oldPlacesListRegex, newPlacesList);

// 6. Add completion timestamp message
const finalStatusCheckRegex = /<Progress value=\{progress\} className="h-2 mb-4 bg-slate-100" \/>/;
const newFinalStatus = `<Progress value={progress} className="h-2 bg-slate-100 mb-2" />
                   {isFinished && <div className="text-xs text-green-600 font-medium mb-4 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Rute ferdigstilt</div>}
                   {!isFinished && <div className="h-6 mb-4"></div>}`;

content = content.replace(finalStatusCheckRegex, newFinalStatus);


fs.writeFileSync(filePath, content);
console.log('Patched MonitorPage with UI refinements');
