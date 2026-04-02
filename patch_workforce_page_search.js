const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/workforce/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Use the global search bar instead of the local one
// First, import the hook
code = code.replace(
    "import { useToast } from '@/hooks/use-toast';",
    "import { useToast } from '@/hooks/use-toast';\nimport { useSearch } from '@/hooks/use-search';"
);

// Add useSearch hook inside the component
code = code.replace(
    "const { toast } = useToast();",
    "const { toast } = useToast();\n    const { query: searchQuery, setContext } = useSearch();"
);

// Remove the local state for search query
code = code.replace(
    "const [searchQuery, setSearchQuery] = useState('');",
    ""
);

// Add useEffect to set context for the search bar
code = code.replace(
    "useEffect(() => {",
    "useEffect(() => {\n        setContext('Personell', '/dashboard/admin'); // No direct 'new worker' page, usually done via invitations in admin\n    }, [setContext]);\n\n    useEffect(() => {"
);

// Remove the local search bar from the UI
const searchBarJSX = `<div className="space-y-2 w-full sm:w-64 relative">
                                <Label>Søk etter personell</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Navn eller e-post..." 
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>`;

code = code.replace(searchBarJSX, "");

fs.writeFileSync(filePath, code);
