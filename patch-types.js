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

code = code.replace(
`  notes?: string;      // Used for "notes"
  contactPersons?: { name: string; phone: string; email: string; }[];     // New field`,
`  notes?: string;      // Used for "notes"
  field3?: string;
  contactPersons?: { name: string; phone: string; email: string; }[];`
);

fs.writeFileSync('src/lib/types.ts', code);
