
const fs = require('fs');

const routeDetailsFile = 'src/app/dashboard/routes/[id]/page.tsx';
let code = fs.readFileSync(routeDetailsFile, 'utf8');

// 1. Find and cut the "Tildelt Sjåfør" (Driver Assignment) card
const driverAssignmentRegex = /\{\/\* Middle Box: Driver Assignment \*\/\}\s*<Card className="border-slate-200 shadow-sm">[\s\S]*?<\/Card>/;
const driverAssignmentMatch = code.match(driverAssignmentRegex);
const driverAssignmentCard = driverAssignmentMatch ? driverAssignmentMatch[0] : '';
if (driverAssignmentCard) {
  code = code.replace(driverAssignmentRegex, '');
}

// 2. Find and cut the "Action Buttons" card from the left column
const actionButtonsRegex = /\{\/\* Action Buttons Moved Here for better flow \*\/\}\s*<Card className="border-slate-200 shadow-sm bg-slate-50\/50">[\s\S]*?<\/Card>/;
const actionButtonsMatch = code.match(actionButtonsRegex);
const actionButtonsCard = actionButtonsMatch ? actionButtonsMatch[0].replace(/\{\/\* Action Buttons Moved Here for better flow \*\/\}/, '') : '';
if (actionButtonsCard) {
  code = code.replace(actionButtonsRegex, '');
}

// 3. Find the end of the main grid
const gridEndMarker = '        </Card>\n      </div>';
const gridEndIndex = code.indexOf(gridEndMarker);

if (gridEndIndex !== -1 && driverAssignmentCard && actionButtonsCard) {
  const insertionPoint = gridEndIndex + gridEndMarker.length;
  const newLayout = `
${driverAssignmentCard.replace('Middle Box: Driver Assignment', 'Driver Assignment')}

      {/* Action Buttons */}
${actionButtonsCard}
`;
  code = code.slice(0, insertionPoint) + newLayout + code.slice(insertionPoint);
} else {
  console.error("Could not find the insertion point or one of the cards. Aborting.");
}

fs.writeFileSync(routeDetailsFile, code);
