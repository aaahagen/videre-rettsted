const fs = require('fs');
let code = fs.readFileSync('src/lib/types.ts', 'utf8');

code = code.replace(
`    contactPersons?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };`,
`    contactPersons?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };
    field3?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };`
);

fs.writeFileSync('src/lib/types.ts', code);
