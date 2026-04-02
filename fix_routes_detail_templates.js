const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetSave = `    if (!route) return;
    setIsSaving(true);
    try {`;

const newSave = `    if (!route) return;
    setIsSaving(true);
    try {`;

content = content.replace(targetSave, newSave);

const targetAction = `<Button 
                   className="w-full shadow-sm font-bold h-12 text-md"
                   onClick={handleSave} 
                   disabled={isSaving || isCalculating}
                >
                   {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                   Lagre Rute
                </Button>`;

const newAction = `<div className="flex gap-4">
                  <Button 
                     variant="secondary"
                     className="w-1/3 shadow-sm font-bold h-12 text-md border border-slate-200"
                     onClick={async () => {
                         if (!route) return;
                         setIsSaving(true);
                         try {
                           const placeIds = routeItems.filter(i => i.type === 'place' && i.placeId).map(i => i.placeId!);
                           await firebaseDB.createRoute({
                             name: \`Kopi av \${route.name}\`,
                             orgId: route.orgId,
                             status: 'template',
                             places: placeIds,
                             startAddress,
                             endAddress,
                             notes: routeNotes,
                             prepTimeStart,
                             prepTimeEnd,
                             breakTime,
                             fuelServiceTime,
                           });
                           toast({ title: 'Mal Lagret', description: 'Ruten ble lagret som mal.' });
                         } catch(e) {
                           toast({ title: 'Feil', description: 'Kunne ikke lagre mal', variant: 'destructive' });
                         } finally { setIsSaving(false); }
                     }} 
                     disabled={isSaving || isCalculating}
                  >
                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Lagre som Mal
                  </Button>
                  <Button 
                     className="w-2/3 shadow-sm font-bold h-12 text-md"
                     onClick={handleSave} 
                     disabled={isSaving || isCalculating}
                  >
                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Lagre Endringer
                  </Button>
                </div>`;

content = content.replace(targetAction, newAction);

fs.writeFileSync(file, content);
