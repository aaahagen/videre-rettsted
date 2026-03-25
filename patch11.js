const fs = require('fs');
const file = 'functions/src/utils.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const googleMapsApiKey = defineString\('GOOGLE_MAPS_API_KEY'\);/g,
  `// Used via Secret Manager instead of defineString
import { defineSecret } from 'firebase-functions/params';
const googleMapsApiKeySecret = defineSecret('GOOGLE_MAPS_API_KEY');`
);

content = content.replace(
  /key: googleMapsApiKey\.value\(\),/g,
  `key: googleMapsApiKeySecret.value(),`
);

fs.writeFileSync(file, content);
