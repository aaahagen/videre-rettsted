const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The request is to move "Viktig ruteinformasjon" (routeNotes) to the top or bottom of the route view for drivers.
// Currently, it is in a left column on desktop (lg:col-span-5) and potentially hidden if it's empty.

// Let's move the display of routeNotes for drivers into the main route column (right col) or right above it.

const targetCardStart = `<Card className="border-slate-200 shadow-md bg-gradient-to-br from-white to-slate-50/50">`;
const routeNotesCard = `
      {/* Route Notes - Always visible at top for drivers if not in edit mode */}
      {!isAdmin && !isEditMode && routeNotes && (
        <Card className="border-indigo-100 shadow-md bg-indigo-50/30 overflow-hidden">
          <CardHeader className="pb-3 bg-indigo-100/50">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
              <Info className="h-5 w-5 text-indigo-600" />
              Viktig Ruteinformasjon
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
             <div className="text-sm text-indigo-950 font-medium whitespace-pre-wrap">
                {routeNotes}
            </div>
          </CardContent>
        </Card>
      )}
`;

content = content.replace(targetCardStart, routeNotesCard + '      ' + targetCardStart);

// Now, we should probably hide the original one in the left column if it's the driver view
// But actually the left column itself is hidden for drivers if isEditMode is false.
// Let's check the logic: 
// {(isAdmin || isEditMode || (!isAdmin && !isEditMode && routeNotes)) && (
//   <div className="lg:col-span-5 flex flex-col gap-6">

// I'll modify the left column to ONLY show for admins or in edit mode, 
// since I moved the driver's read-only note view to the top.

content = content.replace('{(isAdmin || isEditMode || (!isAdmin && !isEditMode && routeNotes)) && (', '{(isAdmin || isEditMode) && (');

// And remove the check for !isAdmin && !isEditMode in the Note card content
content = content.replace(`                    <CardContent>
                        {(!isAdmin && !isEditMode) ? (
                             <div className="bg-indigo-50/50 p-4 rounded-md border border-indigo-100 text-sm whitespace-pre-wrap">
                                {routeNotes}
                            </div>
                        ) : (
                            <Textarea 
                                value={routeNotes}
                                onChange={(e) => setRouteNotes(e.target.value)}
                                placeholder="Skriv inn viktig informasjon for sjåføren her. F.eks. nøkler, koder, eller spesielle hensyn..."
                                className="min-h-[120px]"
                                readOnly={!isAdmin && !isEditMode}
                            />
                        )}
                    </CardContent>`, `                    <CardContent>
                        <Textarea 
                            value={routeNotes}
                            onChange={(e) => setRouteNotes(e.target.value)}
                            placeholder="Skriv inn viktig informasjon for sjåføren her. F.eks. nøkler, koder, eller spesielle hensyn..."
                            className="min-h-[120px]"
                        />
                    </CardContent>`);

fs.writeFileSync(file, content);
