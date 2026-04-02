# VIDERE RettSted - Architecture

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

## Core Philosophy: Function-First Design

This project adheres to a "Function-First" design philosophy. This principle dictates that while aesthetics are important, the primary goal of any design choice is to enhance the application's functionality, reliability, and ease of use.

*   **Clarity and Intuition:** The user interface is intentionally kept clean and intuitive. The goal is for a new user, particularly a driver with varying technical literacy, to understand how to use the core features with minimal to no instruction.
*   **Purpose-Driven UI:** Every UI element must serve a clear purpose. We avoid purely decorative elements that could add clutter and confusion. For example, recent form redesigns utilized a card-based layout to visually group related information, making complex forms easier to parse and complete.
*   **Performance over Flair:** We prioritize fast load times and responsive interactions over complex animations or heavy graphical elements that do not contribute directly to the user's workflow.
*   **Reliability as a Feature:** Functionality extends to reliability. Technical decisions, such as the adoption of native HTML date pickers over custom components, are made to ensure the application is robust, bug-free, and works seamlessly across all devices, especially mobile.

## Core Technical Decisions

### Date Selection: Native HTML Inputs
- **Decision:** Throughout the application, native HTML `<input type="date">` elements are strictly preferred over custom React calendar components (e.g., popovers with `react-day-picker`) for simple date selection.
- **Rationale:** 
    1.  **Reliability:** Custom popover calendars frequently introduce complex state management bugs, particularly regarding z-index stacking, click-away handling, and component mounting/unmounting lifecycles. Native inputs eliminate this entire class of bugs.
    2.  **Mobile UX:** Native date inputs trigger the device's built-in UI (e.g., the iOS date spinner wheel or Android's calendar dialog). This provides a vastly superior, familiar, and accessible experience for mobile users, which is critical given the driver-centric nature of the app.
    3.  **Simplicity:** Reduces bundle size, dependency count, and code complexity.

## Backend Abstraction Layer

To ensure future flexibility and ease of migration to a different backend, all interactions with the backend (Firebase) will be encapsulated within a dedicated abstraction layer. This layer will expose a set of generic functions to the rest of the application for data operations (CRUD). This architecture also allows for the entire backend to be migrated to a self-hosted or on-premise server if required by the organization's security policies.

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
- orgId: string
- favorites: array (of placeIds)
- workingHours: map (start, end)
- rotation: map (startDate, weeks array)
- scheduleOverrides: map (date string -> type, start, end)
- certifications: array (of strings)
- skills: array (of strings)

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

### /organizations/{orgId}/vehicles/{vehicleId}
- name: string
- registrationNumber: string
- type: 'truck' | 'van' | 'car'
- fuelType: 'diesel' | 'electric' | 'gas' | 'hybrid'
- capacity: map (weight, volume, pallets)
- capabilities: map (refrigeration, tailLift, adr, trailerCoupling)
- status: 'active' | 'maintenance' | 'inactive'

### /routes/{routeId}
- name: string
- orgId: string
- places: array (ordered list of placeIds)
- driverId: string (optional, assigns route to a specific driver)
- vehicleId: string (optional, assigns route to a specific vehicle)

## Security Rules (Firestore)

- Users can only read/write data within the organization (`orgId`) they belong to.
- Users can only read/write their own `/users/{userId}` document.
- **Invitations**: 
    - `read`: Strictly limited to fetching by ID (`get`). **Listing (scanning) is denied.**
    - `create`: Only admins can create.
    - `update`: Strictly limited to the acceptance process (marking as 'accepted' by the claiming user).
- **Places**:
    - `read`: Any user within the organization.
    - `create`, `update`, `delete`: Only users with the "admin" role.
- **Routes**:
    - `read`: Any user within the organization.
    - `create`, `update`, `delete`: Only users with the "admin" role.

## Storage Rules (Cloud Storage)

- **Users**: Only the owner can write their profile picture. Any logged-in user can read.
- **Places**: 
    - `read`: Any authenticated user.
    - `write`: Any authenticated user, but strictly validated:
        - **Content Type**: Must be an image (`image/*`).
        - **Size**: Must be less than 5MB.

## Future Development Recommendations

The codebase is in excellent health and follows modern best practices. The following recommendations are not urgent fixes but are intended to guide future development to maintain a high standard of quality.

### 1. Form State Management
- **Current State**: Simple forms use standard React `useState` hooks for state management, which is perfectly acceptable for their current complexity.
- **Recommendation**: For new, more complex forms, consider adopting a dedicated form management library like **`react-hook-form`** in combination with a validation library like **`zod`**. This will help centralize form logic, streamline validation, reduce boilerplate code, and improve the user experience with more robust error handling.

### 2. Internationalization (i18n)
- **Current State**: User-facing text (labels, button text, error messages) is currently hardcoded directly within the components.
- **Recommendation**: To prepare for potential future language support and to make managing text easier, consider centralizing all user-facing strings into resource files (e.g., `/locales/en.json`, `/locales/no.json`). This practice, known as internationalization (i18n), decouples text from the code and simplifies updates and translations.
