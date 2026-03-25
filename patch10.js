const fs = require('fs');
const file = 'functions/src/routes.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export const calculateRouteDistance = functions\.https\.onCall\(async \(request\) => \{/g,
  `import { defineSecret } from 'firebase-functions/params';
const googleMapsApiKey = defineSecret('GOOGLE_MAPS_API_KEY');

export const calculateRouteDistance = functions.runWith({ secrets: [googleMapsApiKey] }).https.onCall(async (request) => {`
);

fs.writeFileSync(file, content);
