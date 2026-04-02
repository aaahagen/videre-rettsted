const fs = require('fs');
const path = require('path');

// So the user just wanted the "Søk etter personell" input on the workforce page to be visually integrated, or just that they didn't want the layout search to change.
// "The global search is broken. I just wanted the searchbar for the workforce page to change"
// Ok, I will change back the `layout.tsx` to normal (already done).
// And for `workforce/page.tsx`, I will make it look exactly like what they want: just ONE search input which is localized inside `workforce/page.tsx` itself, or use the global one but properly.
// The easiest fix is to just let layout.tsx be. The user says "I just wanted the searchbar for the workforce page to change".
// Let's bring back the localized search bar but style it like the global one and remove the global one? NO, we can't remove the global one from layout.
// Let's hide the global search bar on the workforce page? No, the user says "I was thinking of the top searchbar where you now can search for places. This searchbar should be used for searching after 'Personell' on the workforce page."

// If they want the global search bar to search for personnel, we must use `useSearch` context in workforce page.
// The reason global search was "broken" might be because of `router.push('/dashboard')` triggering when typing in the workforce page.

let layoutPath = path.join(__dirname, 'src/app/dashboard/layout.tsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

const oldSearchChange = `if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage) {
        router.push('/dashboard');
    }`;

const newSearchChange = `if (value && pathname !== '/dashboard' && !isRoutesPage && !isMonitorPage && pathname !== '/dashboard/workforce') {
        router.push('/dashboard');
    }`;

layoutCode = layoutCode.replace(oldSearchChange, newSearchChange);

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

const newButtonRender = `{(isAdmin || contextName === 'Steder') && (
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

layoutCode = layoutCode.replace(oldButtonRender, newButtonRender);
fs.writeFileSync(layoutPath, layoutCode);

// Workforce page
let workforcePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let workforceCode = fs.readFileSync(workforcePath, 'utf8');

// Add useSearch hook again
workforceCode = workforceCode.replace(
    "import { useToast } from '@/hooks/use-toast';",
    "import { useToast } from '@/hooks/use-toast';\nimport { useSearch } from '@/hooks/use-search';"
);

workforceCode = workforceCode.replace(
    "const [searchQuery, setSearchQuery] = useState('');",
    "const { query: searchQuery, setContext } = useSearch();"
);

workforceCode = workforceCode.replace(
    "useEffect(() => {",
    "useEffect(() => {\n        setContext('Personell', '/dashboard/admin');\n        return () => setContext('Steder', '/dashboard/new');\n    }, [setContext]);\n\n    useEffect(() => {"
);

fs.writeFileSync(workforcePath, workforceCode);
