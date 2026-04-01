const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'README.md');
let content = fs.readFileSync(filePath, 'utf8');

const newFeatures = `
## ✨ Key Features
* **Visual Dashboard:** A clean grid view of delivery locations with large, square preview images.
* **Smart Route Planning:** Admins can build ordered delivery routes, assign drivers, and optimize the sequence.
* **Real-time Route Monitoring:** A dedicated command-center view for admins to track the progress of active routes.
* **Fleet Management:** Complete registry of company vehicles, including capacities and specialized capabilities (e.g., ADR, refrigeration).
* **Workforce & Rotation Scheduling:** Advanced driver profiles supporting standard hours, single-day overrides, and multi-week rotation plans (turnus), complete with printable 12-week schedules.
* **Advanced Search:** Filter locations by name, address, or user-generated #hashtags.
* **Image Handling:** Client-side downscaling to save bandwidth, camera integration, and captions.
* **Navigation:** Integrated Google Maps view with deep-linking for turn-by-turn navigation.
* **Offline-Ready:** Built-in Firestore IndexedDB caching ensures drivers can access critical route data even in dead zones.
`;

const newAdminRole = `### Administrator (Hjelpefunksjonær)
* **Organization Control:** Register and manage the organization's settings.
* **User & Fleet Management:** Generate expiring invitations for new users, manage driver profiles/rotations, and maintain the vehicle fleet.
* **Route Planning & Oversight:** Create, assign, and monitor delivery routes in real-time.
* **Content Management:** Full access to create, update, and delete delivery places.`;

content = content.replace(/## ✨ Key Features[\s\S]*?## 🔐 Roles and Permissions/, newFeatures + '\n## 🔐 Roles and Permissions');

content = content.replace(
    /### Administrator \(Hjelpefunksjonær\)[\s\S]*?### Driver \(Bruker\)/,
    newAdminRole + '\n\n### Driver (Bruker)'
);

content = content.replace(
    "## 🛠 Tech Stack\n* **Frontend:** React / Tailwind CSS (PWA).\n* **Backend:** Firebase (Firestore, Authentication, Storage).\n* **Maps:** Google Maps Platform API.",
    "## 🛠 Tech Stack\n* **Frontend:** Next.js 14 (App Router) with TypeScript and Tailwind CSS.\n* **UI Components:** shadcn/ui.\n* **Backend:** Firebase (Firestore, Authentication, Storage, Functions).\n* **Hosting:** App Hosting for Firebase.\n* **Maps:** Google Maps Platform API."
);

fs.writeFileSync(filePath, content);
console.log('Updated README.md');
