const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// I put the AlertDialog in the wrong place, it was in the SortableItem function instead of the main component.

// 1. Remove it from where it is
const startOfBad = '          {/* Finish Confirmation Dialog */}';
const endOfBad = '      </AlertDialog>';
const badSectionStart = content.indexOf(startOfBad);
const badSectionEnd = content.indexOf(endOfBad, badSectionStart) + endOfBad.length;
content = content.substring(0, badSectionStart) + content.substring(badSectionEnd);

// 2. Put it at the very bottom before the final </div>
const insertionPoint = content.lastIndexOf('</div>');
const alertDialog = `      {/* Finish Confirmation Dialog */}
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
`;

content = content.substring(0, insertionPoint) + alertDialog + content.substring(insertionPoint);

fs.writeFileSync(file, content);
