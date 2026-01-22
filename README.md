# Videre RettSted

**Videre RettSted** is a mobile-first web application designed to help delivery drivers navigate the "last meter" of their journey. By providing visual aids, precise entrance descriptions, and direct Google Maps integration, the app ensures that drivers find the exact delivery point every time.

## 📋 Project Overview
Drivers often face challenges finding specific delivery entrances or loading docks using standard GPS. **Videre RettSted** solves this by allowing a community of drivers and administrators to build a visual database of delivery locations within their organization.

## ✨ Key Features
* **Visual Dashboard:** A clean grid view of delivery locations with large, square preview images.
* **Advanced Search:** Filter locations by name, address, or user-generated #hashtags.
* **Image Handling:** Client-side downscaling to save bandwidth, camera integration, and captions.
* **Navigation:** Integrated Google Maps view with deep-linking for turn-by-turn navigation.

## 🔐 Roles and Permissions

### Administrator (Hjelpefunksjonær)
* **User Management:** Responsible for creating and deleting user accounts.
* **Onboarding:** Generates and sends expiring invitation links to new users.
* **Organization Control:** Assigns users to specific organizations and is the only role authorized to change an organization assignment.
* **Content Management:** Full access to create, update, and delete delivery places.
* **System Oversight:** Can view full edit logs, including who created or updated a location and when.

### Driver (Bruker)
* **Authentication:** Can log in using credentials provided via the administrator's invitation and has the authority to set a new password.
* **Place Management:** Can create new delivery places and update information for existing ones.
* **Restrictions:** Does NOT have the authority to delete places or change organization settings.
* **Personalization:** Can save specific delivery locations as favorites for quick access.

## 🛠 Tech Stack
* **Frontend:** React / Tailwind CSS (PWA).
* **Backend:** Firebase (Firestore, Authentication, Storage).
* **Maps:** Google Maps Platform API.