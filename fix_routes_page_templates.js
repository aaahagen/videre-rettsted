const fs = require('fs');
const file = 'src/app/dashboard/routes/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Tabs import
const targetImport = `import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';`;
const newImport = `import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';`;

content = content.replace(targetImport, newImport);

// Add Tab state
const targetState = `  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const { query: searchQuery, setContext } = useSearch();`;
const newState = `  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);
  const { query: searchQuery, setContext } = useSearch();
  const [activeTab, setActiveTab] = useState("active");`;

content = content.replace(targetState, newState);

// Update grid rendering to use Tabs
const targetGrid = `{displayedRoutes.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <SearchX className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700">Ingen treff for "{searchQuery}"</h2>
            <p className="text-slate-500 mt-2 max-w-md">Prøv et annet søkeord eller fjern filteret.</p>
            <Button variant="outline" className="mt-6" onClick={() => setContext('Ruter', '/dashboard/routes/new')}>Nullstill søk</Button>
          </div>
        ) : displayedRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <RouteIcon className="h-10 w-10 text-primary opacity-80" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ingen ruter enda</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto mb-6 text-sm">Opprett din første rute for å planlegge leveranser og optimalisere kjøringen.</p>
            {userData?.role === 'admin' && (
              <Button size="lg" className="rounded-full shadow-md font-semibold" onClick={() => router.push('/dashboard/routes/new')}>
                <Plus className="mr-2 h-5 w-5" />
                Planlegg Ny Rute
              </Button>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">`;

const newGrid = `
        <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Aktive Ruter</TabsTrigger>
            <TabsTrigger value="templates">Maler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
          {displayedRoutes.filter(r => r.status !== 'template').length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <RouteIcon className="h-10 w-10 text-primary opacity-80" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ingen aktive ruter</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto mb-6 text-sm">Opprett din første rute for å planlegge leveranser og optimalisere kjøringen.</p>
            {userData?.role === 'admin' && (
              <Button size="lg" className="rounded-full shadow-md font-semibold" onClick={() => router.push('/dashboard/routes/new')}>
                <Plus className="mr-2 h-5 w-5" />
                Planlegg Ny Rute
              </Button>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">`;

content = content.replace(targetGrid, newGrid);

// Close TabsContent and add template tab content
const targetCloseGrid = `        </div>
        )}
      </div>

      <Dialog open={routeToDelete !== null} onOpenChange={(open) => !open && setRouteToDelete(null)}>`;

const newCloseGrid = `        </div>
        )}
        </TabsContent>
        
        <TabsContent value="templates">
          {displayedRoutes.filter(r => r.status === 'template').length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ingen maler</h2>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto mb-6 text-sm">Lagre en ofte brukt rute som en mal for raskt oppsett senere.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedRoutes.filter(r => r.status === 'template').map(route => {
                    const createdAtDate = (route.createdAt as any)?.toDate ? (route.createdAt as any).toDate() : new Date(route.createdAt as any);
                    return (
                        <Card 
                          key={route.id} 
                          className="group cursor-pointer transition-all duration-300 overflow-hidden flex flex-col h-full bg-white hover:-translate-y-1 border-dashed border-slate-300 hover:shadow-md"
                          onClick={() => router.push(\`/dashboard/routes/\${route.id}\`)}
                        >
                          <div className="h-2 w-full bg-slate-200" />
                          <CardHeader className="flex flex-row items-start justify-between pb-2 pt-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
                                <RouteIcon className="h-6 w-6" />
                              </div>
                              <div>
                                <CardTitle className="text-xl font-bold text-slate-800 line-clamp-1">
                                  {route.name}
                                </CardTitle>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                  Mal opprettet {isNaN(createdAtDate.getTime()) ? 'Ukjent dato' : createdAtDate.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                              <p className="text-sm text-muted-foreground">{route.places?.length || 0} faste stopp</p>
                          </CardContent>
                        </Card>
                    );
                })}
             </div>
          )}
        </TabsContent>
        </Tabs>
      </div>

      <Dialog open={routeToDelete !== null} onOpenChange={(open) => !open && setRouteToDelete(null)}>`;

content = content.replace(targetCloseGrid, newCloseGrid);

// Fix the active map iteration
const targetMap = `        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedRoutes.map(route => {`;

const newMap = `        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedRoutes.filter(r => r.status !== 'template').map(route => {`;

content = content.replace(targetMap, newMap);

fs.writeFileSync(file, content);
