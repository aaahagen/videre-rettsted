const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports for AlertDialog
content = content.replace(`import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';`, `import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";`);

// 2. Add state for dialog and confirmation text
const stateInsertion = `  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [finishConfirmationText, setFinishConfirmationText] = useState('');`;

content = content.replace(`  const [isEditMode, setIsEditMode] = useState(false);`, `  const [isEditMode, setIsEditMode] = useState(false);
${stateInsertion}`);

// 3. Update handleFinishRoute to save 'completed' status
const oldFinishRoute = `  const handleFinishRoute = () => {
    // Determine if all stops are actually marked complete
    const placeIds = routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!);
    
    // We want all physical places AND special items to be marked to be 'fully' finished,
    // or just the physical places depending on business logic. Currently completedStops
    // stores the ID of the RouteItem (e.g., \`place_XYZ\` or \`special_start\`).
    
    // Let's check if EVERY item in the routeItems array is in completedStops
    const allCompleted = routeItems.every(item => completedStops[item.id]);

    if (!allCompleted) {
        toast({ title: 'Ikke ferdig', description: 'Du må markere alle stopp og handlinger som fullført før du kan avslutte ruten.', variant: 'destructive' });
        return;
    }
    
    // Route is fully complete, redirect to routes view
    toast({ title: 'Rute Fullført', description: 'Flott jobba! Du blir omdirigert til ruteoversikten.' });
    router.push('/dashboard/routes');
  };`;

const newFinishRoute = `  const handleFinishRoute = async () => {
    if (finishConfirmationText.toLowerCase() !== 'ferdig') {
        toast({ title: 'Bekreftelse mangler', description: 'Du må skrive "Ferdig" for å bekrefte.', variant: 'destructive' });
        return;
    }

    if (!route) return;
    setIsSaving(true);
    try {
      await firebaseDB.updateRoute(routeId, { status: 'completed' });
      toast({ title: 'Rute Fullført', description: 'Flott jobba! Ruten er nå arkivert.' });
      router.push('/dashboard/routes');
    } catch (err) {
      console.error('Error finishing route:', err);
      toast({ title: 'Feil', description: 'Kunne ikke fullføre ruten.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
      setIsFinishDialogOpen(false);
    }
  };`;

content = content.replace(oldFinishRoute, newFinishRoute);

// 4. Wrap toggleItemCompletion with a check for completed status
const toggleStart = `  const toggleItemCompletion = async (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();`;

const toggleWithGuard = `  const toggleItemCompletion = async (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (route?.status === 'completed' && !isAdmin) {
        toast({ title: 'Ruten er låst', description: 'Du kan ikke endre en fullført rute.' });
        return;
    }
`;

content = content.replace(toggleStart, toggleWithGuard);

// 5. Update the Finish Route Button section to trigger dialog
const oldButton = `                  {/* Finish Route Button for Drivers */}
                  {!isAdmin && !isEditMode && routeItems.length > 0 && (
                      <div className="mt-8 pt-4 border-t border-slate-100">
                          <Button 
                              onClick={handleFinishRoute}
                              disabled={!allStopsCompleted}
                              className={\`w-full h-14 text-lg font-bold transition-all \${allStopsCompleted ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}\`}
                          >
                              {allStopsCompleted ? (
                                  <>
                                      <Check className="mr-2 h-5 w-5" /> Fullfør Rute
                                  </>
                              ) : (
                                  "Marker alle stopp som ferdig først"
                              )}
                          </Button>
                      </div>
                  )}`;

const newButton = `                  {/* Finish Route Button for Drivers */}
                  {!isAdmin && !isEditMode && routeItems.length > 0 && route?.status !== 'completed' && (
                      <div className="mt-8 pt-4 border-t border-slate-100">
                          <Button 
                              onClick={() => setIsFinishDialogOpen(true)}
                              disabled={!allStopsCompleted}
                              className={\`w-full h-14 text-lg font-bold transition-all \${allStopsCompleted ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}\`}
                          >
                              {allStopsCompleted ? (
                                  <>
                                      <Check className="mr-2 h-5 w-5" /> Fullfør Rute
                                  </>
                              ) : (
                                  "Marker alle stopp som ferdig først"
                              )}
                          </Button>
                      </div>
                  )}

                  {!isAdmin && route?.status === 'completed' && (
                      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 p-4 rounded-lg">
                          <CheckCircle2 className="h-6 w-6" />
                          Ruten er fullført og låst
                      </div>
                  )}`;

content = content.replace(oldButton, newButton);

// 6. Add the AlertDialog component to the bottom of the JSX
content = content.replace(/<\/div>\n\s*\);\n}/, `      {/* Finish Confirmation Dialog */}
      <AlertDialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du helt ferdig med ruten?</AlertDialogTitle>
            <AlertDialogDescription>
              Når du fullfører ruten vil den bli låst for endringer. 
              <br/><br/>
              Skriv <span className="font-bold text-slate-900">"Ferdig"</span> i feltet under for å bekrefte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input 
              value={finishConfirmationText}
              onChange={(e) => setFinishConfirmationText(e.target.value)}
              placeholder='Skriv "Ferdig" her...'
              className="bg-slate-50 border-slate-200"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFinishConfirmationText('')}>Avbryt</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFinishRoute}
              disabled={finishConfirmationText.toLowerCase() !== 'ferdig' || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              Fullfør og arkiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}`);

fs.writeFileSync(file, content);
