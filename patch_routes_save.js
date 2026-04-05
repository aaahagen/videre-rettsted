const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/dashboard/routes/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetButton = `                  <Button 
                     variant="secondary"
                     className="w-full sm:w-1/3 shadow-sm font-bold h-12 text-md border border-slate-200"
                     onClick={async () => {`;

const newButton = `                  {isAdmin && (
                  <Button 
                     variant="secondary"
                     className="w-full sm:w-1/3 shadow-sm font-bold h-12 text-md border border-slate-200"
                     onClick={async () => {`;

const endOfButton = `                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Lagre som Mal
                  </Button>`;

const newEndOfButton = `                     {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                     Lagre som Mal
                  </Button>
                  )}`;

// Apply replacements
content = content.replace(targetButton, newButton);
content = content.replace(endOfButton, newEndOfButton);

// We should also make the primary "Lagre Rute" button full width if the template button isn't there
const mainSaveButton = `                  <Button 
                     className="w-full sm:w-2/3 shadow-sm font-bold h-12 text-md"
                     onClick={handleSave}`;

const newMainSaveButton = `                  <Button 
                     className={cn("w-full shadow-sm font-bold h-12 text-md", isAdmin ? "sm:w-2/3" : "")}
                     onClick={handleSave}`;

content = content.replace(mainSaveButton, newMainSaveButton);

fs.writeFileSync(filePath, content);
console.log("Patched Lagre som Mal button");
