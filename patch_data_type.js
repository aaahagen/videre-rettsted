const fs = require('fs');

const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export interface User \{/g,
  `export interface User {
  avatarUrl?: string;`
);

fs.writeFileSync(file, content);
