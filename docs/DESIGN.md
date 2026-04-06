# Design System & UI Guidelines: VIDERE RettSted

This document outlines the established design patterns, layout principles, and UI components that define the VIDERE RettSted application. Its purpose is to ensure a consistent, predictable, and functional user experience as new features are developed.

## 1. Core Philosophy: Function-First Design
The primary goal of the UI is to enhance functionality, reliability, and ease of use, especially for mobile users with varying technical literacy.
- **Clarity over Clutter:** Every UI element must serve a clear purpose. We avoid purely decorative elements.
- **Performance over Flair:** We prioritize fast load times and responsive interactions over complex animations.
- **Reliability as a Feature:** Technical decisions (like using native date pickers) are made to ensure the application is robust and bug-free across all devices.

## 2. Layout System

### a. Main Dashboard Layout (`/dashboard/*`)
- **Persistent Sidebar:** A collapsible sidebar on the left provides primary navigation between modules (Oversikt, Steder, Ruter, etc.). On mobile, it is hidden by default and triggered by a burger icon.
- **Sticky Header:** A top header bar contains a context-aware global search and a context-aware "New" action button.
- **Content Area:** The main content for each page is rendered within a container that is horizontally centered and has a maximum width of `max-w-7xl` (1280px) to prevent stretching on ultra-wide screens.

### b. Role-Based Dashboards
- **Driver Dashboard (`/dashboard`):** An "Operational Hub" layout, prioritizing the `TimeStampCard` and the user's active route for the day.
- **Admin Dashboard (`/dashboard`):** A "Management Console" layout, prioritizing the `AdminDashboardContent` (user management, settings, etc.) at the top, with operational tools in a secondary section.

### c. Strategic "Super Dashboard" & API-First Design (Phase 5 Vision)
- **Goal:** To provide a high-level, strategic overview for organization owners or executives, focusing on long-term Key Performance Indicators (KPIs) rather than daily operational details.
- **Location:** This will be a new, dedicated view, likely accessible from the main dashboard, to keep it distinct from the real-time operational view.
- **Design:** The dashboard will be a modular grid of clean, independent widgets (using the `<Card>` component). Each widget will visualize a specific KPI.
- **Planned KPIs:**
    - **Workforce:** Overtime vs. planned time, contractor usage rates, long-term sickness/absence trends.
    - **Fleet:** Vehicle operational status (Active, Workshop), and alerts for upcoming regulated inspections (EU-Kontroll) and maintenance.
    - **Routes:** Historical analysis of route completion times versus estimates.
- **API-First Principle:** This is critical. All data feeding this dashboard **must** be sourced from dedicated, well-structured backend functions. This architectural decision ensures that the same KPIs can be securely and easily exposed via an API endpoint for seamless integration with third-party business intelligence tools (e.g., Geckoboard, Klipfolio), fulfilling the "data-out" requirement.## 3. Core UI Components & Patterns

### a. Cards
- **Standard Card (`<Card>`):** The primary component for grouping related information. Used for Place cards, Vehicle cards, Personnel cards, and as containers for form sections. Features a subtle border, shadow, and rounded corners.
- **Interactive Cards:** Cards can be used as large touch targets, often revealing more details upon click (e.g., Personnel cards expanding to show HR info).
- **Header (`<CardHeader>`):** Contains the `CardTitle` and `CardDescription`.
- **Content (`<CardContent>`):** Contains the primary information or form inputs.

### b. Forms
- **Dialog-Based Forms (`<Dialog>`):** Complex creation and editing tasks (e.g., "Edit Driver Profile," "Register New Vehicle") are handled within full-screen modals to maintain context.
- **Card-Based Sections:** Forms inside dialogs are broken down into logical sections using the `<Card>` component to improve readability and structure (e.g., "Personalinformasjon," "Arbeidstid").
- **Native Inputs:** Native HTML inputs (especially `<input type="date">`) are strictly preferred over custom components for reliability and mobile user experience.

### c. Buttons
- **Primary Action Button:** The main "New" button in the global header is context-aware, changing its icon and label based on the current page (e.g., "Nytt Sted," "Ny Rute").
- **Standard Buttons (`<Button>`):** Used for primary form submissions ("Lagre"), secondary actions (e.g., "Lagre som Mal"), and destructive actions (e.g., "Slett").

### d. Data Display
- **Grid View (`PlaceGrid`):** Used for visually rich, image-centric content like the Delivery Places.
- **Timeline View (`WorkforceTimeline`):** A horizontal table-based layout for visualizing schedules over time. Features a sticky first column for driver names and horizontal scrolling for the days.
- **List/Table View (`TimeApprovals`, Admin User List):** Used for displaying dense, transactional data that requires clear rows and columns for comparison and action.

## 4. Color & Typography
- **Primary Color:** Deep blue (`#1A237E`) - Used for primary buttons, active links, and key highlights.
- **Background:** Light blue-gray (`#F0F4F8`) / White (`#FFFFFF`) - Provides a clean, neutral backdrop.
- **Accent/Status Colors:**
    - **Success/Approved:** Green
    - **Warning/Pending:** Amber/Yellow
    - **Error/Destructive:** Red
    - **Informational:** Blue
- **Font:** A single, highly legible sans-serif font ('Inter' or similar) is used throughout for consistency and clarity.