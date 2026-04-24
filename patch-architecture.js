const fs = require('fs');

let code = fs.readFileSync('docs/ARCHITECTURE.md', 'utf8');

const newArchSection = `

## Multi-Tenancy & Commercialization Architecture

To support the future commercialization strategy (Phase 7), the architecture is designed to be modular.
*   **Feature Gating:** The \`Organization\` model in Firestore will contain an \`activeModules\` array (e.g., \`['places', 'fleet']\`).
*   **UI Level:** The frontend components (like the sidebar) will check this array and conditionally render links and dashboards only if the organization has access to that specific module.
*   **Security Level:** Firestore Security Rules will be implemented to securely restrict read/write access to collections (like \`/vehicles\` or \`/routes\`) based on the organization's \`activeModules\` array, ensuring data security even if the UI is bypassed.`;

code = code.replace('## Backend', newArchSection + '\n\n## Backend');

fs.writeFileSync('docs/ARCHITECTURE.md', code);
