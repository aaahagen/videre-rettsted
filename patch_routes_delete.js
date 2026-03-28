const fs = require('fs');

const routesFile = 'src/app/dashboard/routes/page.tsx';
let routesCode = fs.readFileSync(routesFile, 'utf8');

// Add Trash2 to lucide-react imports
routesCode = routesCode.replace(/import { Plus, Loader2 } from 'lucide-react';/, "import { Plus, Loader2, Trash2 } from 'lucide-react';");

// Add handleDeteleRoute function inside the component
const deleteFunc = `
  const handleDeleteRoute = async (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    if (confirm('Er du sikker på at du vil slette denne ruten?')) {
      try {
        await firebaseDB.deleteRoute(routeId);
        setRoutes(routes.filter(r => r.id !== routeId));
      } catch (err) {
        console.error('Error deleting route:', err);
        alert('Kunne ikke slette ruten.');
      }
    }
  };
`;

routesCode = routesCode.replace(/const handleCreateRoute = \(\) => \{/, deleteFunc + '\n  const handleCreateRoute = () => {');

// Add delete button to the card header
const deleteButtonHtml = `
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{route.name}</CardTitle>
                {userData?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
                    onClick={(e) => handleDeleteRoute(e, route.id as string)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>`;

routesCode = routesCode.replace(/<CardHeader>\s*<CardTitle className="text-xl">\{route.name\}<\/CardTitle>\s*<\/CardHeader>/, deleteButtonHtml);

fs.writeFileSync(routesFile, routesCode);
