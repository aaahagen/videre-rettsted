const fs = require('fs');
const path = require('path');

// 1. Update layout.tsx
let layoutPath = path.join(__dirname, 'src/app/dashboard/layout.tsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

// The route needs to handle '/dashboard/fleet' without redirecting to '/dashboard'
const oldSearchChange = `if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage && pathname !== '/dashboard/workforce') {
        router.push('/dashboard');
    }`;

const newSearchChange = `if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage && pathname !== '/dashboard/workforce' && pathname !== '/dashboard/fleet') {
        router.push('/dashboard');
    }`;

layoutCode = layoutCode.replace(oldSearchChange, newSearchChange);

// Update layout button text handling
const oldButtonRender = `{(isAdmin || contextName === 'Steder') && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="hidden sm:flex">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="mr-2 h-4 w-4" /> : contextName === 'Personell' ? 'Nytt personell' : 'Nytt Sted'}
                    </Link>
                  </Button>
                  <Button asChild size="icon" className="sm:hidden rounded-full h-10 w-10">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                    </Link>
                  </Button>
                </div>
            )}`;

const newButtonRender = `{(isAdmin || contextName === 'Steder') && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="hidden sm:flex"
                    onClick={() => {
                        if (contextName === 'Kjøretøy') {
                            window.dispatchEvent(new CustomEvent('open-new-vehicle-form'));
                        } else {
                            router.push(contextLink);
                        }
                    }}
                  >
                    {contextName === 'Ruter' ? <RouteIcon className="mr-2 h-4 w-4" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                    {contextName === 'Ruter' ? 'Ny Rute' : contextName === 'Personell' ? 'Nytt personell' : contextName === 'Kjøretøy' ? 'Nytt Kjøretøy' : 'Nytt Sted'}
                  </Button>
                  <Button 
                    size="icon" 
                    className="sm:hidden rounded-full h-10 w-10"
                    onClick={() => {
                        if (contextName === 'Kjøretøy') {
                            window.dispatchEvent(new CustomEvent('open-new-vehicle-form'));
                        } else {
                            router.push(contextLink);
                        }
                    }}
                  >
                    {contextName === 'Ruter' ? <RouteIcon className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                  </Button>
                </div>
            )}`;

// Because layout uses <Button asChild><Link ...></Button>, I need to change how the button works so we can trigger an event OR navigate.
layoutCode = layoutCode.replace(oldButtonRender, newButtonRender);

// Ensure old versions of the button code are updated even if different.
const oldButtonRegex = /\{\(isAdmin \|\| contextName === 'Steder'\) && \([\s\S]*?<\/div>\s*\)\}/;
layoutCode = layoutCode.replace(oldButtonRegex, newButtonRender);

fs.writeFileSync(layoutPath, layoutCode);

// 2. Update fleet/page.tsx
let fleetPath = path.join(__dirname, 'src/app/dashboard/fleet/page.tsx');
let fleetCode = fs.readFileSync(fleetPath, 'utf8');

// Import useSearch hook
fleetCode = fleetCode.replace(
    "import { useAuth } from '@/components/auth-provider';",
    "import { useAuth } from '@/components/auth-provider';\nimport { useSearch } from '@/hooks/use-search';"
);

// Add useSearch to FleetPage
fleetCode = fleetCode.replace(
    "const [isFormOpen, setIsFormOpen] = useState(false);",
    "const [isFormOpen, setIsFormOpen] = useState(false);\n    const { query: searchQuery, setContext } = useSearch();"
);

// Add useEffect to set context
fleetCode = fleetCode.replace(
    "useEffect(() => {",
    "useEffect(() => {\n        setContext('Kjøretøy', '/dashboard/fleet');\n        return () => setContext('Steder', '/dashboard/new');\n    }, [setContext]);\n\n    useEffect(() => {"
);

// Listen to custom event to open the form
fleetCode = fleetCode.replace(
    "useEffect(() => {\n        setContext('Kjøretøy', '/dashboard/fleet');",
    "useEffect(() => {\n        const handleOpen = () => handleOpenForm();\n        window.addEventListener('open-new-vehicle-form', handleOpen);\n        return () => window.removeEventListener('open-new-vehicle-form', handleOpen);\n    }, []);\n\n    useEffect(() => {\n        setContext('Kjøretøy', '/dashboard/fleet');"
);

// Remove the local "+ Nytt Kjøretøy" button from the page since it's now in the header
const localButtonRegex = /<Button onClick=\{\(\) => handleOpenForm\(\)\}>\s*<Plus className="mr-2 h-4 w-4" \/> Nytt Kjøretøy\s*<\/Button>/;
fleetCode = fleetCode.replace(localButtonRegex, "");

// Filter vehicles based on search query
fleetCode = fleetCode.replace(
    "return (\n        <TooltipProvider>",
    "const filteredVehicles = vehicles.filter(v => \n        (v.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||\n        (v.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || '')\n    );\n\n    return (\n        <TooltipProvider>"
);

fleetCode = fleetCode.replace(
    "vehicles.map((vehicle) =>",
    "filteredVehicles.length === 0 && searchQuery ? (\n                        <div className=\"col-span-full flex flex-col items-center justify-center py-20 text-center\">\n                            <div className=\"rounded-full bg-slate-100 p-6 mb-4\">\n                                <SearchX className=\"h-12 w-12 text-slate-300\" />\n                            </div>\n                            <h2 className=\"text-xl font-semibold text-slate-900\">\n                                Ingen kjøretøy matchet \"{searchQuery}\"\n                            </h2>\n                        </div>\n                    ) : filteredVehicles.map((vehicle) =>"
);

// Make sure SearchX is imported
if (!fleetCode.includes("SearchX")) {
    fleetCode = fleetCode.replace("Truck, ", "Truck, SearchX, ");
}

fs.writeFileSync(fleetPath, fleetCode);
