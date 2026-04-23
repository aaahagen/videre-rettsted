const fs = require('fs');
let code = fs.readFileSync('src/lib/types.ts', 'utf8');

code = code.replace(
`    contactPerson?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };`,
`    contactPersons?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };`
);

fs.writeFileSync('src/lib/types.ts', code);
