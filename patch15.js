const fs = require('fs');
const file = 'functions/src/utils.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /throw new functions\.https\.HttpsError\(\n      'internal',\n      'Google Maps API request failed\. Check the function logs for a detailed error message from the API\.',\n      error\.response\?\.data\n    \);/g,
  `throw new functions.https.HttpsError(
      'internal',
      error.message || 'Google Maps API request failed.',
      error.response?.data
    );`
);

fs.writeFileSync(file, content);
