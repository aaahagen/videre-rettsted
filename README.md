# Videre RettSted

**Videre RettSted** is a mobile-first web application designed to help delivery drivers navigate the "last meter" of their journey. By providing visual aids, precise entrance descriptions, and direct Google Maps integration, the app ensures that drivers find the exact delivery point every time.

## 📋 Project Overview
Drivers often face challenges finding specific delivery entrances or loading docks using standard GPS. **Videre RettSted** solves this by allowing a community of drivers and administrators to build a visual database of delivery locations within their organization.


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

## 🔐 Roles and Permissions

### Administrator (Hjelpefunksjonær)
* **Organization Control:** Register and manage the organization's settings.
* **User & Fleet Management:** Generate expiring invitations for new users, manage driver profiles/rotations, and maintain the vehicle fleet.
* **Route Planning & Oversight:** Create, assign, and monitor delivery routes in real-time.
* **Content Management:** Full access to create, update, and delete delivery places.

### Driver (Bruker)
* **Authentication:** Can log in using credentials provided via the administrator's invitation and has the authority to set a new password.
* **Place Management:** Can create new delivery places and update information for existing ones.
* **Restrictions:** Does NOT have the authority to delete places or change organization settings.
* **Personalization:** Can save specific delivery locations as favorites for quick access.

## 🛠 Tech Stack
* **Frontend:** Next.js 14 (App Router) with TypeScript and Tailwind CSS.
* **UI Components:** shadcn/ui.
* **Backend:** Firebase (Firestore, Authentication, Storage, Functions).
* **Hosting:** App Hosting for Firebase.
* **Maps:** Google Maps Platform API.