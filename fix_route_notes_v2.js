const fs = require('fs');
const file = 'src/app/dashboard/routes/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the previously added top card
const topCardPattern = /\n\s*{\/\* Route Notes - Always visible at top for drivers if not in edit mode \*\/\}\n\s*{!isAdmin && !isEditMode && routeNotes && \([\s\S]*?\n\s*\)}\n/g;
content = content.replace(topCardPattern, '\n');

// 2. Find the Route List CardContent
const cardContentPattern = /<CardContent className="p-0 overflow-y-auto flex-1 flex flex-col justify-between">/;
const newRouteNotesDisplay = `<CardContent className="p-0 overflow-y-auto flex-1 flex flex-col justify-between">
            {/* Route Notes - Integrated at the top of the list for drivers/viewers */}
            {!isEditMode && routeNotes && (
              <div className="bg-amber-50 border-b border-amber-100 p-4 shrink-0">
                <div className="flex items-center gap-2 mb-2 text-amber-800">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Viktig Informasjon</span>
                </div>
                <div className="text-sm text-amber-900 whitespace-pre-wrap font-medium">
                  {routeNotes}
                </div>
              </div>
            )}
`;

content = content.replace(cardContentPattern, newRouteNotesDisplay);

fs.writeFileSync(file, content);
