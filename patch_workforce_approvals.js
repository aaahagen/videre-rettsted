const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
content = content.replace("import { WorkforceTimeline } from \"@/components/workforce/workforce-timeline\";", "import { WorkforceTimeline } from \"@/components/workforce/workforce-timeline\";\nimport { TimeApprovals } from \"@/components/workforce/time-approvals\";");

// 2. Update viewMode type and icons
content = content.replace("const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');", "const [viewMode, setViewMode] = useState<'cards' | 'timeline' | 'approvals'>('cards');");
content = content.replace("LayoutGrid, List", "LayoutGrid, List, ClipboardCheck");

// 3. Add Approvals Button to the toggle group
const oldToggleGroup = `<div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button 
                            variant={viewMode === "cards" ? "default" : "ghost"} 
                            size="sm" 
                            onClick={() => setViewMode('cards')}
                            className={cn("h-8 px-3 text-xs font-medium", viewMode === 'cards' && "shadow-sm")}
                        >
                            <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                            Kort
                        </Button>
                        <Button 
                            variant={viewMode === "timeline" ? "default" : "ghost"} 
                            size="sm" 
                            onClick={() => setViewMode('timeline')}
                            className={cn("h-8 px-3 text-xs font-medium", viewMode === 'timeline' && "shadow-sm")}
                        >
                            <List className="h-3.5 w-3.5 mr-1.5" />
                            Tidslinje
                        </Button>
                    </div>`;

const newToggleGroup = `<div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button 
                            variant={viewMode === "cards" ? "default" : "ghost"} 
                            size="sm" 
                            onClick={() => setViewMode('cards')}
                            className={cn("h-8 px-3 text-xs font-medium", viewMode === 'cards' && "shadow-sm")}
                        >
                            <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                            Kort
                        </Button>
                        <Button 
                            variant={viewMode === "timeline" ? "default" : "ghost"} 
                            size="sm" 
                            onClick={() => setViewMode('timeline')}
                            className={cn("h-8 px-3 text-xs font-medium", viewMode === 'timeline' && "shadow-sm")}
                        >
                            <List className="h-3.5 w-3.5 mr-1.5" />
                            Tidslinje
                        </Button>
                        {dbUser?.role === 'admin' && (
                        <Button 
                            variant={viewMode === "approvals" ? "default" : "ghost"} 
                            size="sm" 
                            onClick={() => setViewMode('approvals')}
                            className={cn("h-8 px-3 text-xs font-medium", viewMode === 'approvals' && "shadow-sm")}
                        >
                            <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
                            Godkjenninger
                        </Button>
                        )}
                    </div>`;

content = content.replace(oldToggleGroup, newToggleGroup);

// 4. Update the render logic at the bottom
const oldRenderLogic = `{viewMode === 'cards' ? (
                    <>`;

const newRenderLogic = `{viewMode === 'approvals' ? (
                    <TimeApprovals orgId={dbUser!.orgId} drivers={drivers} />
                ) : viewMode === 'cards' ? (
                    <>`;

content = content.replace(oldRenderLogic, newRenderLogic);

fs.writeFileSync(filePath, content);
console.log('Added Time Approvals view to WorkforcePage');
