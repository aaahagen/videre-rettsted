const fs = require('fs');
const path = require('path');

// 1. Revert changes to dashboard/layout.tsx (partially)
let layoutPath = path.join(__dirname, 'src/app/dashboard/layout.tsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

// The user says "global search is broken. I just wanted the searchbar for the workforce page to change".
// This means they probably didn't want the global search bar on top to search for workers. They wanted the search bar ON THE WORKFORCE PAGE to change.
// So we should revert the top bar changes.

const revertButtonRender = `{(isAdmin || contextName === 'Steder') && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="hidden sm:flex">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="mr-2 h-4 w-4" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                      {contextName === 'Ruter' ? 'Ny Rute' : contextName === 'Personell' ? 'Nytt personell' : 'Nytt Sted'}
                    </Link>
                  </Button>
                  <Button asChild size="icon" className="sm:hidden rounded-full h-10 w-10">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                    </Link>
                  </Button>
                </div>
            )}`;

const oldButtonRender = `{(isAdmin || contextName === 'Steder') && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="hidden sm:flex">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="mr-2 h-4 w-4" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
                      {contextName === 'Ruter' ? 'Ny Rute' : 'Nytt Sted'}
                    </Link>
                  </Button>
                  <Button asChild size="icon" className="sm:hidden rounded-full h-10 w-10">
                    <Link href={contextLink}>
                      {contextName === 'Ruter' ? <RouteIcon className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
                    </Link>
                  </Button>
                </div>
            )}`;

layoutCode = layoutCode.replace(revertButtonRender, oldButtonRender);

const revertSearchChange = `const isWorkforcePage = pathname === '/dashboard/workforce';
    if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage && !isWorkforcePage) {
        router.push('/dashboard');
    }`;

const oldSearchChange = `if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage) {
        router.push('/dashboard');
    }`;

layoutCode = layoutCode.replace(revertSearchChange, oldSearchChange);
fs.writeFileSync(layoutPath, layoutCode);

// 2. Revert changes to workforce page
let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// Revert hook import
workforceCode = workforceCode.replace(
    "import { useToast } from '@/hooks/use-toast';\nimport { useSearch } from '@/hooks/use-search';",
    "import { useToast } from '@/hooks/use-toast';"
);

workforceCode = workforceCode.replace(
    "const { toast } = useToast();\n    const { query: searchQuery, setContext } = useSearch();",
    "const { toast } = useToast();\n    const [searchQuery, setSearchQuery] = useState('');"
);

// Revert useEffect
workforceCode = workforceCode.replace(
    "useEffect(() => {\n        setContext('Personell', '/dashboard/admin'); // No direct 'new worker' page, usually done via invitations in admin\n    }, [setContext]);\n\n    useEffect(() => {",
    "useEffect(() => {"
);

// Re-add the local search bar, but remove it as per the prompt?
// Wait, the prompt said: 
// "I was thinking of the top searchbar where you now can search for places. This searchbar should be used for searching after "Personell" on the workforce page. The Blue button for registering a new place should be used to register a new worker instead. The search a field under should be replaced by only showing the option of picking a date."
// But then the next prompt said: 
// "The global search is broken. I just wanted the searchbar for the workforce page to change"

// Ah, they meant: They wanted the global search to search for personnel when on the workforce page. BUT it's currently broken (maybe places page broke?).
// Let's check why it's broken.
