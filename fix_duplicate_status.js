const fs = require('fs');
const file = 'src/lib/types.ts';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Line 123 is a duplicate status
lines.splice(122, 1);

fs.writeFileSync(file, lines.join('\n'));
