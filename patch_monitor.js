const fs = require('fs');
const file = 'src/app/dashboard/monitor/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetImport = `import { Loader2, Clock, MapPin, Car, CheckCircle2, Circle, AlertCircle, Route as RouteIcon, Activity, ChevronDown, ChevronUp, ExternalLink, Users } from 'lucide-react';`;
const newImport = `import { Loader2, Clock, MapPin, Car, CheckCircle2, Circle, AlertCircle, Route as RouteIcon, Activity, ChevronDown, ChevronUp, ExternalLink, Users } from 'lucide-react';
import { format } from 'date-fns';`;
content = content.replace(targetImport, newImport);

const targetRender = `                                  <div className="shrink-0 flex items-center gap-2">
                                      {/* Timestamp placeholder - requires data model update to be real */}
                                      {isCompleted && <span className="text-[10px] text-muted-foreground hidden sm:inline-block">Fullført</span>}
                                      {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : isCurrent ? <Badge variant="default" className="text-[10px] h-5">Neste</Badge> : <Circle className="h-4 w-4 text-slate-200" />}
                                  </div>`;

const newRender = `                                  <div className="shrink-0 flex flex-col items-end justify-center gap-1">
                                      <div className="flex items-center gap-2">
                                          {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : isCurrent ? <Badge variant="default" className="text-[10px] h-5">Neste</Badge> : <Circle className="h-4 w-4 text-slate-200" />}
                                      </div>
                                      {isCompleted && route.completedStopEvents && route.completedStopEvents[\`place_\${placeId}\`] && (
                                          <div className="flex flex-col items-end">
                                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                  {format(new Date((route.completedStopEvents[\`place_\${placeId}\`].timestamp as any)?.toDate?.() || route.completedStopEvents[\`place_\${placeId}\`].timestamp), "HH:mm")}
                                              </span>
                                              {route.completedStopEvents[\`place_\${placeId}\`].coordinates && (
                                                  <a 
                                                    href={\`https://www.google.com/maps/search/?api=1&query=\${route.completedStopEvents[\`place_\${placeId}\`].coordinates.lat},\${route.completedStopEvents[\`place_\${placeId}\`].coordinates.lng}\`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                      <MapPin className="h-2 w-2" /> Vis kart
                                                  </a>
                                              )}
                                          </div>
                                      )}
                                  </div>`;

content = content.replace(targetRender, newRender);
fs.writeFileSync(file, content);
