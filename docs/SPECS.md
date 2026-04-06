# Project Specification: VIDERE RettSted

## Project Overview
VIDERE RettSted is a web-based application (deployed as a PWA/App Store wrapper) designed for drivers to find precise delivery locations. It solves the "last-meter" delivery problem by providing photos, descriptions, and specific entrance maps that standard GPS often misses.

## Target Audience
- **Admins (Hjelpefunksjonærer)**: Tech-savvy individuals responsible for setting up organizations and managing users.
- **Drivers**: The primary users, often with low digital literacy. The UI for them must be extremely intuitive.

## Core Architectural Principles

1.  **Multi-Tenant Data Architecture:** The system must be multi-tenant from the ground up to support future commercialization (Phase 4). All top-level Firestore collections that contain organization-specific data (e.g., `places`, `routes`, `vehicles`, `drivers`) **must** be designed as sub-collections of a primary `organizations` collection. This ensures data isolation and security.

    - **Correct Structure:** `/organizations/{organization_id}/vehicles/{vehicle_id}`
    - **Incorrect Structure:** `/vehicles/{vehicle_id}` (This would be a global collection)

    Every query and data access rule must enforce this `organization_id` boundary.

## Core Features

### 1. Multi-Tenancy & Onboarding
- **Admin-First Registration**: The application starts with a landing page where an administrator can register a new organization. The first user to register an organization automatically becomes its administrator.
- **Invitation-Only for Subsequent Users**: The administrator of an organization can invite other users (both drivers and other admins). Invited users receive an expiring link to set up their account.

### 2. Authentication
- **Login Page**: A simple, dedicated login page for all existing users.
- **Password Reset**: Users can reset their own passwords.

### 3. Place Management
- **Grid View**: A visual list of locations with large square images and names.
- **Place Details**: Address, text description, image carousel, and Google Maps integration.
- **Editing**: Drivers can create/update places; only Admins can delete.
- **History**: Every place tracks `created_at`, `updated_at`, and `author_id`.
- **Customizable Fields**: Organizations can configure two text fields ("Beskrivelse & Instruksjoner 1" and "Beskrivelse & Instruksjoner 2") with custom labels and placeholders.

### 4. Media Handling
- Direct camera upload or gallery selection.
- **Maximum 8 Images**: Each place can have up to 8 images.
- **Automatic Downscaling**: Images must be resized client-side before upload to Firestore/Storage.
- Image descriptions for every photo.

### 5. Search & Organization
- Hashtag-based categorization (#ramp, #basement, etc.).
- Search by name, address, or hashtag.
- "Favorite" system for individual users.

### 6. Route Management
- Admins can create and delete delivery routes.
- Routes consist of an ordered list of places.
- Admins can assign a specific driver to a route.
- The route details page shows total estimated distance and time.
- Integrated route optimization to automatically re-order stops for the shortest travel time using Google Maps Directions API.


### 7. Workforce Management & HR
The application serves as a central hub for personnel management.
- **Driver Profiles:** Detailed profiles for each employee (both internal and external contractors).
- **Core HR Data:** Profiles must store and display:
    - Contact info (Phone, Address).
    - Emergency contacts and Next of Kin.
    - Employment details (Employee ID, Job Title, Department, Supervisor, Seniority Date, Employment Status).
    - Payroll & Legal info (Social Security Number/D-nummer, Date of Birth, Gender, Hourly Rate, Bank Account, Tax Code).
    - Compliance tracking (Probation End Date, Background Check Date, Staff Handbook Acknowledgment).
- **Administrative Notes:** A private text field on each profile strictly visible only to administrators for internal observations.
- **Contract Management:** Ability to upload and log multiple digital contracts per employee (Start Date, End Date, Role, Contracted Hours).
- **Document Storage:** Secure upload for certificates, diplomas, and other HR-related documents.

### 8. Time & Attendance (Stamping)
- **Geofencing & Time Tracking:** The system tracks actual worked hours versus planned schedules.
- **Organization Depot:** Admins define a main depot with GPS coordinates and a allowed stamping radius.
- **Driver Settings:** Each driver is configured for either:
    - *Fixed Location:* Must be within the depot's geofence (or their specific Alternative Depot) to start a shift.
    - *Flexible Location:* Can stamp from anywhere; GPS coordinates are captured for audit.
- **Admin Approval Workflow:** Time logs where actual hours exceed planned hours are automatically flagged for admin review and approval/decline.

### 9. Fleet Management
- Complete registry of company vehicles.
- Tracks capacities (weight, volume, pallets), physical dimensions (height, width, length), and specialized capabilities (ADR, refrigeration, tail-lift, flatbed, trailer coupling).
- Supports custom key-value attributes (e.g., "Jekketralle: 2 stk").
- Document storage for vehicle registration and insurance.

## Language Support
- Primary: Norwegian (Bokmål).
- Architecture must support i18n (English and other languages planned).
