const fs = require('fs');
const file = 'functions/src/routes.ts';
let content = fs.readFileSync(file, 'utf8');

// Add a harmless comment to force a redeployment
content = content + '\n// Forced redeploy to pick up new API key secret.\n';

fs.writeFileSync(file, content);
