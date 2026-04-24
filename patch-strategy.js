const fs = require('fs');

let code = fs.readFileSync('docs/STRATEGY.md', 'utf8');

const oldPhase7 = `## Phase 7: Commercialization & Multi-Tenancy

This phase focuses on building the features necessary to offer the application as a multi-tenant, subscription-based service (SaaS).

1.  **Super-Admin & Organization Management:** Create a "Super-Admin" role (for the platform owner) with the ability to manage different customer organizations, users, and permissions.
2.  **Stripe Payment Integration:** Integrate the Stripe API to handle customer subscriptions, billing, and payments.`;

const newPhase7 = `## Phase 7: Commercialization & Multi-Tenancy

This phase focuses on building the features necessary to offer the application as a multi-tenant, subscription-based service (SaaS) using a modular architecture.

1.  **Modular Feature Gating:** Update the core \`Organization\` data model to include an \`activeModules\` array (e.g., 'places', 'routes', 'fleet', 'workforce', 'manifests'). The UI and backend security rules (Firestore) will be updated to dynamically show/hide links and restrict data access based on which modules an organization has paid for.
2.  **Super-Admin & Organization Management:** Create a "Super-Admin" role (for the platform owner) with a dedicated dashboard to view all organizations, manually toggle module access, and manage high-level permissions.
3.  **Stripe Payment Integration:** Integrate the Stripe API to handle customer subscriptions, billing, and automated module unlocking upon successful payment.`;

code = code.replace(oldPhase7, newPhase7);

fs.writeFileSync('docs/STRATEGY.md', code);
