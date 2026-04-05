# Videre RettSted

**Videre RettSted** is a comprehensive logistics and workforce management platform designed for the modern delivery organization. It began as a tool to help drivers navigate the "last meter" of their journey and has evolved into a full-suite application for managing routes, vehicles, personnel, and operational integrity.

## 📋 Project Overview
Standard GPS often fails at the most critical point: the final approach. **Videre RettSted** solves this with a rich, visual database of precise delivery locations. Building on this foundation, it now integrates advanced workforce and fleet management capabilities to provide a single source of truth for daily logistics operations.

## ✨ Key Features (Current)
* **Visual Delivery Database:** A clean grid view of delivery locations with large preview images, entrance descriptions, and #hashtags.
* **Smart Route Planning:** Admins can build ordered delivery routes, assign drivers, and save routes as templates.
* **Real-time Route Monitoring:** A dedicated command-center view for admins to track the progress of active routes with live driver locations and stop-completion timestamps.
* **Fleet Management:** A complete registry of company vehicles, including capacities and specialized capabilities (e.g., ADR, refrigeration).
* **Workforce & Rotation Scheduling:** Advanced driver profiles supporting standard hours, single-day overrides, and multi-week rotation plans (turnus), complete with printable schedules.
* **Integrated Messaging:** Real-time chat with read receipts for seamless communication between admins and drivers.
* **Navigation & Favorites:** Deep-linking to Google Maps for turn-by-turn navigation and personalized favorite locations for drivers.
* **Offline-Ready:** Built-in Firestore IndexedDB caching ensures drivers can access critical route data even in network dead zones.

## 🗺️ Roadmap & Future Vision

This project is under active development. The roadmap is organized into phases to deliver value incrementally. For a detailed breakdown, please see the [**`docs/STRATEGY.md`**](docs/STRATEGY.md) file.

*   **Phase 2: Advanced Workforce Management & HR**
    *   Implementing a comprehensive **Time & Attendance** system with geofence and GPS-based time stamping.
    *   Introducing an automated **overtime approval workflow** for administrators.
    *   Adding **compliance alerts** to prevent scheduling conflicts with working-hour directives.

*   **Phase 3: End-to-End Verification**
    *   Building a full **Proof of Delivery (POD)** system with signatures, photos, and barcode scanning.
    *   Creating an in-app **digital vehicle inspection** module.

*   **Phase 4: Intelligent Automation**
    *   Integrating **Google OR-Tools** to enable constraint-based automatic route generation and optimization.

*   **Phase 5 & 6: Commercialization & Resilience**
    *   Developing the features for a **multi-tenant SaaS product** with Stripe integration.
    *   Building a fully **offline-capable mobile application**.

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
* **Hosting:** Firebase Hosting.
* **Maps:** Google Maps Platform API.