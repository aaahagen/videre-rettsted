const fs = require('fs');

// Fix routes.ts
const routesFile = 'functions/src/routes.ts';
let routesContent = fs.readFileSync(routesFile, 'utf8');
routesContent = routesContent.replace(
  /export const calculateRouteDistance = functions\.runWith\(\{ secrets: \[googleMapsApiKey\] \}\)\.https\.onCall\(async \(request\) => \{/g,
  `export const calculateRouteDistance = functions.https.onCall({ secrets: [googleMapsApiKey] }, async (request) => {`
);
fs.writeFileSync(routesFile, routesContent);

// Fix utils.ts
const utilsFile = 'functions/src/utils.ts';
let utilsContent = fs.readFileSync(utilsFile, 'utf8');
utilsContent = utilsContent.replace(
  /import \{ defineString \} from 'firebase-functions\/params';/g,
  ``
);
fs.writeFileSync(utilsFile, utilsContent);
