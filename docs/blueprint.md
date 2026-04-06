# App Blueprint: VIDERE RettSted

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
