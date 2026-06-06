# UI Specification & Role Mapping: VIDERE RettSted

This document defines the mandatory components, features, and role-based access for every page in the VIDERE RettSted application. **AI Assistant: You MUST consult this before refactoring any page.**

---

## 1. Global Navigation (Sidebar)

### Role Access
- **Super Admin:** Access to all groups + "App Eier" section.
- **Owner / Admin:** Access to all groups except "App Eier".
- **Planner / Loader:** Access to "Daglig Drift" and "Logistikk".
- **Driver / Contractor:** Access to "Daglig Drift", "Ruteoversikt", "Favoritter", and "Avvik".
- **HMS Responsible / Salesman:** Access to "Leveringssteder" and specialized pages only.

---

## 2. Admin Dashboard (`/dashboard/admin`)

### Mandatory Cards & Components
1.  **Brukere & Tilganger (User Management):**
    *   **Features:** Search, Invite New User (Modal), Change Role (Dropdown), Pause User (Switch), Edit Name (Modal), Delete User.
    *   **Visibility:** Admin, Owner, Super Admin.
2.  **Pending Invitations:**
    *   **Features:** List of active links, Revoke invite.
    *   **Visibility:** Admin, Owner, Super Admin.
3.  **Tilpasning av Leveringssteder (Place Settings):**
    *   **Kundenummerering:** Toggle Auto-generation, Prefix, Next Number.
    *   **Felt-tilpasning (Field Customization):** 6 configurable fields (Label + Visibility toggle + Placeholder).
    *   **Visibility:** Admin, Owner, Super Admin.
4.  **Label-innstillinger (Label Settings):**
    *   **Features:** Toggle between **Strekkode** (1D) and **QR-kode** (2D), Branding toggle.
    *   **Visibility:** Admin, Owner, Super Admin.
5.  **Sikkerhet & Avvik (Safety Settings):**
    *   **Features:** Global toggle for "Avvikshåndtering".
    *   **Visibility:** Admin, Owner, Super Admin.
6.  **Hoveddepot & Geofencing:**
    *   **Features:** Depot Address, Geocoding (Søk), GPS-capture, Lat/Lng inputs, Radius slider.
    *   **Visibility:** Admin, Owner, Super Admin.
7.  **Sikkerhetslogg (Audit Trail):**
    *   **Features:** List of GDPR-sensitive actions.
    *   **Visibility:** Admin, Owner, Super Admin.
8.  **Datahåndtering (Data Management):**
    *   **Features:** JSON Export, JSON Import.
    *   **Visibility:** Admin, Owner, Super Admin.
9.  **Delete Organization (Danger Zone):**
    *   **Visibility:** Owner, Super Admin.

---

## 3. Executive Dashboard (`/dashboard/owner`)

### Mandatory Metrics & Components
1.  **Core KPIs Card:** Active Users, Address Database, Fleet Size.
2.  **Order Growth Card:** Area chart of orders (Last 6 months), Total orders with Progress Bar.
3.  **Compliance Cards (Samsvar):**
    *   **Fleet Compliance:** % of vehicles with tacho download within 90 days.
    *   **Driver Compliance:** % of drivers with card download within 28 days.
4.  **Subscription & API:** Plan status (Free/Pro), Stripe Link (Future), API Key Generation (Future).
5.  **Quick Links:** Direct links to Adressedatabase and Admin Panel.

---

## 4. Fleet Dashboard (`/dashboard/fleet`)

### Mandatory Components
1.  **Stats Bar:** Counts of Ready, On Tour, Parked, Observation, Pending Workshop, Workshop.
2.  **Vehicle Cards:**
    *   **Visuals:** Main image.
    *   **Header:** Name, Reg Number, Status Badges, Edit/Delete (Admin only).
    *   **Content:** Type, Odometer Reading (km), Compliance Mini-Dashboard.
3.  **Vehicle Details Modal:**
    *   **Status Manager:** Toggle functional states.
    *   **Technical Details:** Odometer, Capacity, Dimensions, Fuel.
    *   **Compliance Section:** Register Tacho Download button.
    *   **Damage History:** List of reports with doc upload.

---

## 5. Workforce Dashboard (`/dashboard/workforce`)

### Mandatory Components
1.  **Stats Bar:** Working, Sick, Vacation, Off, Other, Contractors.
2.  **View Toggles:** Card View, Timeline, Time Approvals.
3.  **Employee Cards:**
    *   **Header:** Photo, Name, Employment Type, Status bar.
    *   **Content:** Status label, Compliance Section (Driver Card download).
    *   **Expanded Info:** Contact info, Employment details, Payroll/Legal (GDPR Logged).

---

## 6. Place Details (`/dashboard/places/[id]`)

### Mandatory Components
1.  **Header:** Name, Customer Number Badge.
2.  **Media:** Image Carousel with full-screen zoom.
3.  **Main Content:** Description, Notes, Field 3, Field 4.
4.  **Map Section:** Embedded Google Map, Start Navigation button.
5.  **Sidebar:** Door codes, Contact persons, Hashtags, Opening Hours, Physical Constraints.
6.  **Actions:** Edit, Print PDF, Delete (Admin only).

---

## 7. Order Management (`/dashboard/orders`)

### Mandatory Components
1.  **Stats Bar:** Total, Pending, Delivered, Loaded.
2.  **Bulk Action Bar:** Appears on selection.
    *   **Features:** Multi-select, Select All, **Bulk Print Labels** (with batch separators).
3.  **Order Cards:**
    *   **Selection:** Checkbox for batch actions.
    *   **Details:** Barcode, Status badge, Destination name, Creation date.
4.  **Bulk Import:** CSV uploader modal.

---

## 8. Route Details (`/dashboard/routes/[id]`)

### Mandatory Components
1.  **Header:** Lifecycle Status (Active, Completed, Planned), Route Name, AI Optimization button.
2.  **Stats Card:** Stop count, Order count, Total Pallet count.
3.  **Actions:** **Print All Labels** (Bulk print for entire route), Send to Lasterampe.
4.  **Stops List:** Drag-and-drop sorting (SortableContext).
5.  **Place Preview:** Detailed view of selected stop with instructions and map navigation.

---

## 9. HMS & Sikkerhet (`/dashboard/hms`)

### Mandatory Components
1.  **HMS Settings:** Manage questions, titles, and comment requirements.
2.  **HMS Log:** Audit trail of completed checklists with CSV export.
3.  **Role Access:** Admin, Owner, Super Admin, HMS Responsible.

---

## 10. Dashboard Page (`/dashboard`)

### Admin View
- **Operational Status:** Active routes, Finished routes, Overall progress bar.
- **Terminal Progress:** Loaded Kolli / Total Kolli progress bar.
- **Attendance Card:** Present, Finished, Waiting.

### Driver View
- **TimeStamp Card:** Punch-in/out.
- **Active Route Card:** Route name, Manifest progress, Link to execution.
- **Notifications:** Unread messages, Pending courses.

---

## 11. Favoritter (`/dashboard/favorites`)

### Mandatory Components
1. **Header**: Title, "Favoritter" description, Heart icon.
2. **Action Bar**: 
   * **Planlegg rute (Plan Route)**: Opens the `FavoriteRouteOptimizer` Sheet.
   * **Skriv ut alle (Print All)**: Opens print dialog for all favorite places.
3. **Nøkkeloversikt (Key Overview)**: A dedicated card summarizing all places that have door codes categorized as "Nøkkel" (Key).
4. **Place Grid**: The standard grid of `PlaceCard` components for all favorites.
5. **Empty State**: Illustration and instructions for how to add favorites.

### Favorite Route Optimizer (Sheet)
* **Optimization Logic**: Triggered upon opening. Calculates the best sequence of stops from current location using Nearest Neighbor.
* **Route Summary**: Total distance (km), number of stops, and a warning if any places are missing coordinates.
* **Stop Sequence**: A vertical timeline of all stops in the optimized order.
* **Navigation**: "ÅPNE I GOOGLE MAPS" button which generates a multi-stop URL for Google Maps navigation.
