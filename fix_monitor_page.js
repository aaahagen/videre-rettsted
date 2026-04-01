const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/monitor/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// I accidentally replaced the wrong CardHeader. The first CardHeader is for the "Dagens Status" summary card.
// Let's revert the "Dagens Status" CardHeader to what it was.
const incorrectSummaryHeader = `<CardHeader className="pb-2 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => toggleRouteExpansion(route.id)}>
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

const correctSummaryHeader = `<CardHeader className="pb-2">
          <CardTitle className="text-xl">Dagens Status {searchQuery && '(Filtrert)'}</CardTitle>
        </CardHeader>`;

content = content.replace(incorrectSummaryHeader, correctSummaryHeader);

// Now apply the correct header for the individual route cards.
// First let's find it.
const oldRouteHeaderRegex = /<CardHeader className="pb-2">\s*<div className="flex items-start justify-between">\s*<div>\s*<CardTitle className="text-xl flex items-center gap-2">\s*\{route\.name\}\s*\{isFinished && <CheckCircle2 className="h-5 w-5 text-green-500" \/>\}\s*<\/CardTitle>\s*<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">\s*<span className="flex items-center gap-1"><Car className="h-4 w-4" \/> \{driverName\}<\/span>\s*\{route\.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" \/> \{route\.duration\}<\/span>\}\s*<\/div>\s*<\/div>\s*<Badge variant=\{isFinished \? 'default' : 'secondary'\} className=\{isFinished \? 'bg-green-500 hover:bg-green-600' : ''\}>\s*\{completedPlacesCount\} \/ \{totalStops\} fullført\s*<\/Badge>\s*<\/div>\s*<\/CardHeader>/;

const newRouteHeader = `<CardHeader className="pb-2 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => toggleRouteExpansion(route.id)}>
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
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label="Toggle Route Details" asChild>
                            <div>
                                {expandedRoutes[route.id] ? <ChevronUp className="h-4 w-4 pointer-events-none" /> : <ChevronDown className="h-4 w-4 pointer-events-none" />}
                            </div>
                        </Button>
                    </div>
                  </div>
                </CardHeader>`;

content = content.replace(oldRouteHeaderRegex, newRouteHeader);

fs.writeFileSync(filePath, content);
console.log('Fixed MonitorPage Route ID error');
