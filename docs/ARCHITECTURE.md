# Technical Architecture

## Tech Stack
- **Frontend**: React.js or Next.js (Tailwind CSS for styling).
- **Backend/BaaS**: Firebase (Firestore, Auth, Storage).
- **Maps**: Google Maps Platform (Geocoding API & Static Maps/Maps JavaScript SDK).
- **Deployment**: Vercel/Firebase Hosting (PWA enabled).

## Backend Abstraction Layer

To ensure future flexibility and ease of migration to a different backend, all interactions with the backend (Firebase) will be encapsulated within a dedicated abstraction layer. This layer will expose a set of generic functions to the rest of the application for data operations (CRUD).

- **`src/lib/database.ts`**: This file will define a generic interface for all database operations (e.g., `getPlace`, `createPlace`, `updateUser`).
- **`src/lib/firebase/database.ts`**: This file will contain the concrete implementation of the database interface using Firebase Firestore.
- **`src/lib/auth.ts`**: This file will define a generic interface for authentication operations. It will now also include registration methods for the new onboarding flow.
- **`src/lib/firebase/auth.ts`**: This will be the Firebase implementation of the auth interface.
- **`src/lib/storage.ts`**: A generic interface for file storage operations.
- **`src/lib/firebase/storage.ts`**: The Firebase Storage implementation.

## Data Model (Firestore)

### /organizations/{orgId}
- name: string
- settings: map

### /users/{userId}
- name: string
- email: string
- **role: "driver" | "admin"**
- **orgId: string** (links user to an organization)
- favorites: array (placeIds)

### /invitations/{invitationId}
- email: string
- orgId: string
- role: "driver" | "admin"
- expiresAt: timestamp

### /places/{placeId}
- name: string
- address: string
- coordinates: geopoint
- description: string
- hashtags: array
- **orgId: string** (for data isolation)
- createdBy: string (userId)
- updatedBy: string (userId)
- createdAt: timestamp
- updatedAt: timestamp
- images: array of objects { url, thumbnail, description, uploadedAt }

## Security Rules
- **Invitations**: Can only be created by an admin of the corresponding `orgId`.
- **Users**: Can only read/write their own user document. Can only read/write data that belongs to their `orgId`.
- **Places**: Drivers can create/update. Admins can create/update/delete.
