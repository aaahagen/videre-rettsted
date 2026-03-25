const fs = require('fs');
const file = 'functions/src/utils.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const totalDistanceMeters = response\.data\.routes\[0\]\.legs\.reduce\(/g,
  `if (response.data.status !== 'OK') {
        throw new Error(\`Google Maps API returned status: \${response.data.status}\`);
    }
    
    if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('Google Maps API returned no routes.');
    }
    
    const totalDistanceMeters = response.data.routes[0].legs.reduce(`
);

fs.writeFileSync(file, content);
