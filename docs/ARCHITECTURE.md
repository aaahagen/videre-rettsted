# VIDERE RettSted - Architecture

## Frontend

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui
*   **State Management**: React Context API for user session, SWR for data fetching
*   **Deployment**: Firebase Hosting

### Future Mobile Architecture (Phase 7)
To support App Store / Google Play distribution for drivers, the frontend architecture will eventually be split:
1.  **Admin Console:** Will remain a robust Next.js web application utilizing Server Components and App Hosting.
2.  **Driver Application:** Will be decoupled into a strictly Client-Side Rendered (CSR) architecture (either a statically exported Next.js app wrapped in Capacitor.js, or rebuilt in React Native/Expo). 
    *   *Constraint:* Driver-facing features must avoid heavy reliance on Next.js server-side features (like standard API routes or Node-based Image Optimization) to ensure a smooth transition to a native mobile wrapper.

## Backend

*   **Database**: Cloud Firestore
*   **Storage**: Cloud Storage for Firebase
*   **Authentication**: Firebase Authentication
*   **Functions**: Cloud Functions for Firebase (for backend logic like sending invitations and data aggregation).

## Data Privacy & GDPR Principle

*   **Anonymization of Contributions:** To comply with GDPR and enhance user privacy, personally identifiable information (like names) will **not** be stored directly within content data objects like `places`.
*   **Author Identification:** All contributions (creations, edits) will be logged using the user's non-personally identifiable `userId`.
*   **Client-Side Resolution:** When the UI needs to display an author's name, it will resolve it client-side by looking up the `userId` in the `/users` collection. This decouples content from personal data and provides control over who can see the information.

## Core Philosophy: Function-First Design

This project adheres to a "Function-First" design philosophy...
(Existing content remains the same)

## Backend Abstraction & API Layer

To ensure future flexibility and ease of migration, all interactions with the backend are encapsulated within a dedicated abstraction layer.

- **`src/lib/database.ts`**: Defines a generic interface for raw data operations (CRUD).
- **`src/lib/firebase/database.ts`**: The concrete implementation of the database interface using Firebase Firestore.
- **`src/lib/auth.ts`**: Defines a generic interface for authentication operations.
- **`src/lib/firebase/auth.ts`**: The Firebase implementation of the auth interface.
- **`src/lib/storage.ts`**: A generic interface for file storage operations.
- **`src/lib/firebase/storage.ts`**: The Firebase Storage implementation.

### API-First Principle for Business Intelligence (Phase 5)
For high-level data aggregation and KPI reporting, we will adopt an API-first principle. This involves:
- **Dedicated Cloud Functions:** All strategic data (e.g., total kilometers driven, overtime hours) will be calculated in dedicated, secure Cloud Functions.
- **Internal & External API:** These functions will serve a dual purpose:
    1.  They will provide data directly to the in-app "Owner's Super Dashboard."
    2.  They will be exposed via a secure, versioned API endpoint (e.g., `/api/v1/kpi/fleet_utilization`) for consumption by third-party BI tools.
- This architecture decouples the presentation layer from the data aggregation logic, ensuring that any tool, internal or external, receives the same, accurate KPI data.

## Database Schema (Firestore)

### /places/{placeId}
- name: string
- address: string
- location: geopoint
- orgId: string (for data isolation)
- notes: string
- hashtags: array (of strings)
- **createdBy: string (Stores the author's userId)**
- **updatedBy: string (Stores the last editor's userId)**
- **authorName: DEPRECATED - Do not store.**
- createdAt: timestamp
- updatedAt: timestamp
- images: array (of objects { url, caption })

(Rest of the schema remains the same)

## Security Rules (Firestore)

(Existing content remains the same)

## Storage Rules (Cloud Storage)

(Existing content remains the same)

## Future Development Recommendations

(Existing content remains the same)
