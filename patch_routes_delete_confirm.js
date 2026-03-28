const fs = require('fs');

const routesOverviewFile = 'src/app/dashboard/routes/page.tsx';
let code = fs.readFileSync(routesOverviewFile, 'utf8');

// 1. Add missing imports
if (!code.includes("import { Input }")) {
  code = code.replace(
    "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';",
    "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';\nimport { Input } from '@/components/ui/input';\nimport { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';"
  );
}

// 2. Add state variables for delete confirmation
const stateRegex = /const \[routes, setRoutes\] = useState<Route\[\]>\(\[\]\);/;
if (stateRegex.test(code)) {
  code = code.replace(
    stateRegex,
    `const [routes, setRoutes] = useState<Route[]>([]);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);`
  );
}

// 3. Replace old handleDeleteRoute with new logic
const oldDeleteFn = `  const handleDeleteRoute = async (e: React.MouseEvent, routeId: string) => {
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
  };`;

const newDeleteLogic = `  const handleDeleteClick = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation();
    setRouteToDelete(route);
    setDeleteConfirmation('');
  };

  const confirmDeleteRoute = async () => {
    if (!routeToDelete) return;
    setIsDeleting(true);
    try {
      await firebaseDB.deleteRoute(routeToDelete.id as string);
      setRoutes(routes.filter(r => r.id !== routeToDelete.id));
      setRouteToDelete(null);
    } catch (err) {
      console.error('Error deleting route:', err);
      alert('Kunne ikke slette ruten.');
    } finally {
      setIsDeleting(false);
    }
  };`;

if (code.includes("const handleDeleteRoute = async")) {
    code = code.replace(oldDeleteFn, newDeleteLogic);
}

// 4. Update the trash button onClick
const oldOnClick = `onClick={(e) => handleDeleteRoute(e, route.id as string)}`;
const newOnClick = `onClick={(e) => handleDeleteClick(e, route)}`;
code = code.replace(oldOnClick, newOnClick);

// 5. Add Dialog JSX right before the final closing div
const dialogJSX = `      
      <Dialog open={!!routeToDelete} onOpenChange={(open) => !open && setRouteToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slett rute</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette ruten <strong>{routeToDelete?.name}</strong>? Denne handlingen kan ikke angres.
              For å bekrefte, skriv <strong>slett rute</strong> i feltet under.
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Skriv 'slett rute'"
            className="mt-4"
          />
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setRouteToDelete(null)} disabled={isDeleting}>Avbryt</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRoute}
              disabled={deleteConfirmation.toLowerCase() !== 'slett rute' || isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Slett rute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}`;

const endOfFileRegex = /    <\/div>\n  \);\n\}$/;
if (endOfFileRegex.test(code)) {
    code = code.replace(endOfFileRegex, dialogJSX);
} else {
    // Fallback if formatting differs slightly
    const parts = code.split('</div>');
    if (parts.length > 2) {
       parts.pop(); // Remove the last part containing the closing tags
       code = parts.join('</div>') + dialogJSX;
    }
}

fs.writeFileSync(routesOverviewFile, code);
