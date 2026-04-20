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
> - **Action over words:** If the user asks you to implement a planned feature, use your tools to read the relevant files, write the code, and update the changelog.


## Project Vision
VIDERE RettSted is a comprehensive logistics and workforce management platform designed for the modern delivery organization. It solves the "last meter" delivery problem with a rich visual database of precise delivery locations and expands on this foundation with integrated tools for managing routes, vehicles, personnel, and operational integrity.

## User Personas
- **Admins (Hjelpefunksjonærer)**: Tech-savvy individuals responsible for operational oversight, user management, route planning, and HR administration.
- **Drivers (Brukere)**: The primary mobile users, with varying levels of digital literacy. The UI for them must be extremely intuitive, task-oriented, and reliable in the field.

## Core Feature Overview

- **Organization Management:** Admins create and manage isolated organizations. Data is strictly separated between organizations.
- **User & HR Management:**
    - Admins invite users (Drivers, other Admins) via expiring links.
    - Comprehensive driver profiles store contact information, employment details, payroll data, and private administrative notes.
    - Digital contract and document management per employee.
- **Time & Attendance:**
    - "Stamp In/Out" functionality for drivers to log work hours.
    - Supports both **geofence-based** stamping (for depot locations) and **GPS-based** stamping (for remote/field drivers).
    - Automated overtime flagging with an admin approval workflow.
- **Place & "Last Meter" Management:**
    - Visual database of delivery places with images, descriptions, and hashtags.
    - Client-side image compression for performance.
    - Search and filter by name, address, or hashtag.
    - "Favorite" system for drivers.
- **Route Management:**
    - Admins create multi-stop routes, assign them to drivers and vehicles, and save them as reusable templates.
    - Route optimization using Google Maps API.
    - **Real-time Monitoring Dashboard** for admins to track the progress of all active routes.
- **Fleet Management:**
    - A complete registry of company vehicles, tracking physical dimensions, capacities, and special capabilities.
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
