const fs = require('fs');
const file = 'functions/src/routes.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /throw new functions\.https\.HttpsError\('internal', errorMessage, error\);/g,
  `throw new functions.https.HttpsError('internal', errorMessage, (error instanceof Error) ? error.stack : error);`
);

fs.writeFileSync(file, content);
