# Automated Route Planning Engine

This document outlines the logic, prioritization, and constraints used by the VIDERE RettSted automated routing engine located in `src/lib/routing-engine.ts`.

## Core Philosophy: "Cyborg Planning"
The engine is designed as an **opt-in enhancement**, not a replacement for human expertise. It follows a "Soft Warning" approach where it highlights potential issues (overtime, tight delivery windows, environmental zone costs) rather than blocking the planner, allowing for manual overrides based on real-world knowledge.

## 1. Prioritization Logic

### Personnel Prioritization
When assigning drivers to generated routes, the engine uses the following priority order:
1.  **Internal Employees:** Users with `employmentType: 'internal'` (or no type specified) are prioritized.
2.  **External Contractors:** Users with `employmentType: 'external'` are assigned only after all internal drivers have been utilized.

### Geographic Clustering
The engine uses a **Greedy Nearest Neighbor** heuristic:
1.  Starts at the Organization's main depot.
2.  Identifies the closest unassigned order that fits the current vehicle's capabilities.
3.  Iteratively adds the next closest stop until the vehicle is full or no more compatible orders exist.

## 2. Constraint Validation

The engine validates every potential stop against five categories of constraints:

### A. Capability Constraints (Hard)
*   **ADR (Hazardous Goods):** Prevents ADR-tagged orders from being assigned to vehicles without ADR capability.
*   **Thermo (Refrigeration):** Ensures temperature-controlled goods are only placed on refrigerated vehicles.

### B. Capacity Constraints (Soft/Hard)
*   **Weight:** Triggers a warning at 95% of vehicle capacity. Prevents assignment if max weight is exceeded.
*   **Volume:** Triggers a warning at 85% of vehicle volume (to account for irregular packaging shapes).
*   **Pallets:** Tracks floor space usage based on EUR-pallet estimates.

### C. Physical Constraints (Hard)
*   **Dimensions:** Cross-references vehicle `height`, `width`, and `length` against site-specific limits stored in the `Place` profile.
*   **Site Weight:** Prevents heavy vehicles from being assigned to sites with bridge or pavement weight limits.

### D. Temporal Constraints (Soft)
*   **Delivery Windows:** Calculates ETA per stop and warns if the delivery falls outside the location's `weeklySchedule`.
*   **Driver Shift:** Warns if the route duration exceeds the driver's standard working hours.
*   **Legal Limits:** Triggers hard warnings if the driving time exceeds EU 561/2006 baseline regulations (e.g., 9 hours).

### E. Environmental Constraints (Informational)
*   **Zero-Emission Zones:** Prevents diesel vehicles from being assigned to "Nullutslippssoner".
*   **City Centers:** Flags extra toll costs when using diesel vehicles in designated center zones.

## 3. Calculation Methodology

### Distance & Time
*   **Geographic Distance:** Uses the Haversine formula for initial clustering.
*   **Estimated Duration:** Calculated using a base average speed (default 40 km/h) + service duration per stop (stored in `Place.estimatedDeliveryTime` or defaulting to 15 mins).
*   **Range Monitoring:** For electric/gas vehicles, the engine ensures the total estimated route distance does not exceed the vehicle's `maxRange`.

## 4. Manual Control Guarantee
Regardless of the engine's suggestions, the system architecture guarantees:
*   **Drag-and-drop reordering:** Drivers and planners can manually change stop sequences.
*   **Ad-hoc insertion:** New stops can be added to an active route at any time.
*   **Manual Overrides:** Planners can force-assign an order to a vehicle even if a soft capacity warning is active.
