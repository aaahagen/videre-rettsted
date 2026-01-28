# Videre RettSted - Architecture

## Frontend

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui
*   **State Management**: React Context API for user session, SWR for data fetching
*   **Deployment**: App Hosting for Firebase

## Backend

*   **Database**: Cloud Firestore
*   **Storage**: Cloud Storage for Firebase
*   **Authentication**: Firebase Authentication
*   **Functions**: Cloud Functions for Firebase (for backend logic like sending invitations)
*   **AI**: Genkit with Gemini API

## Backend Abstraction Layer

To ensure future flexibility and ease of migration to a different backend, all interactions with the backend (Firebase) will be encapsulated within a dedicated abstraction layer. This layer will expose a set of generic functions to the rest of the application for data operations (CRUD).

- **`src/lib/database.ts`**: Defines a generic interface for all database operations (e.g., `getPlace`, `createPlace`, `updateUser`).
- **`src/lib/firebase/database.ts`**: The concrete implementation of the database interface using Firebase Firestore.
- **`src/lib/auth.ts`**: Defines a generic interface for authentication operations.
- **`src/lib/firebase/auth.ts`**: The Firebase implementation of the auth interface.
- **`src/lib/storage.ts`**: A generic interface for file storage operations.
- **`src/lib/firebase/storage.ts`**: The Firebase Storage implementation.

## Database Schema (Firestore)

### /organizations/{orgId}
- name: string
- settings: map

### /users/{userId}
- name: string
- email: string
- role: "driver" | "admin"
- orgId: string (links user to an organization)
- favorites: array (of placeIds)

### /invitations/{invitationId}
- email: string
- orgId: string
- role: "driver" | "admin"
- expiresAt: timestamp

### /places/{placeId}
- name: string
- address: string
- location: geopoint
- orgId: string (for data isolation)
- notes: string
- hashtags: array (of strings)
- createdBy: string (userId)
- updatedAt: timestamp
- images: array (of objects { url, caption })

### /routes/{routeId}
- name: string
- orgId: string
- places: array (ordered list of placeIds)
- driverId: string (optional, assigns route to a specific driver)

## Security Rules (Firestore)

- Users can only read/write data within the organization (`orgId`) they belong to.
- Users can only read/write their own `/users/{userId}` document.
- **Invitations**: Can only be created/read by an admin of the corresponding `orgId`.
- **Places**:
    - `read`: Any user within the organization.
    - `create`, `update`, `delete`: Only users with the "admin" role.
- **Routes**:
    - `read`: Any user within the organization.
    - `create`, `update`, `delete`: Only users with the "admin" role.
