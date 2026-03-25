const fs = require('fs');
const file = 'functions/src/utils.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /console\.error\('Google Maps API Error Response:', JSON\.stringify\(error\.response\?\.data, null, 2\)\);/g,
  `console.error('Google Maps API Error Object:', error);
    console.error('Google Maps API Error Response:', JSON.stringify(error.response?.data, null, 2));`
);

fs.writeFileSync(file, content);
