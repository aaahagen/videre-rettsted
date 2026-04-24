# App Blueprint: VIDERE RettSted

> [!IMPORTANT]
> **AI ASSISTANT INSTRUCTIONS**
> **CRITICAL:** Before proposing any architectural changes, writing new features, or refactoring code for "VIDERE RettSted", you MUST read and adhere to the following project documents to understand the current state, roadmap, and design philosophy:
> 
> 1. **`docs/STRATEGY.md`**: This is the master roadmap. Always check which Phase we are currently in and what is planned next. Do not build features out of order unless explicitly instructed.
> 2. **`docs/CHANGELOG.md`**: This is the absolute Ground Truth of what has *already been built*. Always check this to avoid rebuilding existing features or breaking recent updates. Whenever you complete a task, you MUST update the `[Unreleased]` -> `### Added` or `### Changed` section of this file.
> 3. **`docs/ARCHITECTURE.md`**: Follow the established backend abstraction pattern (`src/lib/database.ts` -> `src/lib/db/*`). Never write raw Firebase queries directly in UI components. Always respect the strict Role-Based Access Control (RBAC) and GDPR compliance rules.
> 4. **`docs/DESIGN.md`**: Adhere to the "Function-First" design philosophy. Prioritize mobile responsiveness, high contrast, native HTML inputs (like `<input type="date">` over complex libraries), and use the existing `shadcn/ui` components and Tailwind utility classes.
> 
> **Core Rules:**
> - **No God Objects:** Keep database operations separated by domain (e.g., `orders.ts`, `places.ts`).
> - **Role Awareness:** Every UI change must consider the user's role (Driver, Loader, Planner, Admin). Drivers get simplified, mobile-first interfaces; Admins get dense, data-rich dashboards.
> - **Communication Protocol:** When asked a question or given a task, you MUST briefly explain your plan and answer the question *before* you start using tools to write code.
> - **Cleanup Protocol:** After successfully building a feature and verifying it with a build command, you MUST delete any temporary script files (e.g., `patch.js`, `fix.js`) you created in the root directory to keep the workspace clean.
> - **Action over words:** While you must explain your plan first, once the plan is stated, use your tools to execute it without further prompting. Update the changelog upon completion.


## Project Vision
VIDERE RettSted is a comprehensive logistics and workforce management platform designed for the modern delivery organization. It solves the "last meter" delivery problem with a rich visual database of precise delivery locations and expands on this foundation with integrated tools for managing routes, vehicles, personnel, and operational integrity.

## User Roles & Access Control (RBAC)
The application strictly enforces role-based access control (RBAC) at both the UI and database levels.

- **Super Admin (Platform Owner):** Global visibility. Manages multi-tenancy, platform billing, and organization creation.
- **Organization Owner (`owner`):** Highest authority within a specific organization. Has all admin rights plus access to strategic dashboards, billing, and data exports.
- **Organization Admin (`admin`):** Full operational CRUD rights over routes, places, vehicles, and personnel within their organization. Can invite users and manage standard settings.
- **Route Planner (`planner`):** Focused administrative access. Can create, edit, optimize, and assign routes, but lacks access to sensitive HR/payroll data or organization-level settings.
- **Warehouse / Loader (`loader`):** Dedicated terminal access. Manages the vehicle loading process, scans manifest items, and reports loading exceptions/issues.
- **Driver / Contractor (`driver` | `contractor`):** Field operators. Mobile-first access to view assigned routes, execute Proof of Delivery (POD), complete vehicle inspections, and log work hours.

## Core Feature Overview

- **Organization Management:** Admins create and manage isolated organizations. Data is strictly separated between organizations.
- **Workforce & HR Management:**
    - Admins invite users via expiring links.
    - Comprehensive driver profiles store contact information, employment details, certifications (e.g., ADR), and private administrative notes.
    - Advanced scheduling engine handling standard hours, multi-week rotations (Turnusplan), and schedule overrides (sick/vacation).
- **Time & Attendance:**
    - "Stamp In/Out" functionality for drivers to log work hours.
    - Enforced geofence-based stamping (for depot locations).
    - Automated overtime flagging with an admin approval workflow.
- **Place & "Last Meter" Management:**
    - Visual database of delivery places with images, descriptions, estimated delivery times, and hashtags.
    - Client-side image compression for performance.
    - "Favorite" system and gamified "Explorer Status" for drivers.
- **Route & Order Management:**
    - Manual order intake capturing physical dimensions, weight, and special handling (ADR, Frozen).
    - Admins create multi-stop routes, assign them to drivers and vehicles, and save them as reusable templates.
    - Intelligent constraint warnings (vehicle capacity checks, driver availability checks).
    - Real-time **Monitor Dashboard** for admins to track progress, completion times, and loading exceptions.
- **Terminal & Manifest Operations:**
    - Barcode generation and physical label printing for orders.
    - Dedicated Loader UI for scanning packages onto vehicles.
    - Real-time loading progress tracking visible to both the Driver and the Admin.
    - Loader exception reporting (e.g., missing packages) pushed instantly to dispatch.
- **Execution & Proof of Delivery (POD):**
    - Strict delivery workflows requiring explicit failure reasons or delivery method selection (e.g., "Left at door").
    - Capture of timestamped, geocoded photo evidence directly within the app.
    - Reverse logistics tracking (collecting empties/returns from the field).
- **Fleet Management & Safety:**
    - A complete registry of company vehicles, tracking physical dimensions, capacities, and attached documents (insurance).
    - **Digital Vehicle Inspections:** Drivers perform and log Pre-trip and Post-trip safety checks, including damage reporting with photos.
- **Internal Communication:**
    - Real-time messaging hub with read-receipts. Admins can broadcast to all drivers, and drivers can reply directly.
- **Navigation Integration:**
    - Deep-linking to Google Maps for turn-by-turn navigation.

## Style & UX Guidelines

- **Primary Color:** Deep blue (`#1A237E`), reflecting trust, reliability, and professionalism.
- **Background Color:** Very light blue-gray (`#F0F4F8`), providing a clean, neutral, and non-distracting backdrop for complex data.
- **Accent Color:** A vibrant, functional color (e.g., yellow-gold `#FFC107` or a bright green) to be used sparingly for primary call-to-actions, status indicators, and highlighting key interactive elements.
- **Font:** A highly legible, modern sans-serif font like 'Poppins' or 'Inter' should be used consistently for both headlines and body text to ensure clarity on all screen sizes.
- **Design Philosophy:** Mobile-first, high-contrast, and function-oriented. Every element must serve a purpose. Touch targets must be a minimum of 44x44 pixels. UI should provide clear feedback with subtle transitions.
- **Layout:**
    - **Dashboard:** Role-based. For drivers, it's an operational hub. For admins, it's a management console.
    - **Data Display:** Use cards and grids for visual information (like Places) and tables for dense data (like user lists or approval queues).
