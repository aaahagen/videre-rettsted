# App Blueprint: VIDERE RettSted

> [!IMPORTANT]
> **AI ASSISTANT INSTRUCTIONS**
> **CRITICAL:** Before proposing any architectural changes, writing new features, or refactoring code for "VIDERE RettSted", you MUST read and adhere to the following project documents. These documents form the "Documentation Pyramid" and are the absolute source of truth.
> 
> 1. **`docs/strategy.md`**: The Product Vision & Roadmap. Check here to understand the *Why* and the *When*.
> 2. **`docs/domain.md`**: Business Logic & Feature Specs. Read this to understand the *What*.
> 3. **`docs/ui-specification.md`**: **UI SOURCE OF TRUTH.** Consult this before refactoring any page to ensure no components or role-based features are accidentally removed.
> 4. **`docs/roles-and-permissions.md`**: **RBAC SOURCE OF TRUTH.** Consult this to understand user roles and permissions.
> 5. **`docs/engineering.md`**: Architecture, UI & Testing rules. Read this to understand the *How*.
> 6. **`docs/CHANGELOG.md`**: The absolute Ground Truth of what has *already been built*. 
> 
> **Core Developer Rules:**
> - **Primary Tooling:** ALWAYS use the `write_file` tool for all code modifications. DO NOT use `sed`, `awk`, or other terminal commands to patch files.
> - **Refactor Safety:** Check `ui-specification.md` before every `write_file` operation on a Page or Layout to maintain feature parity.
> - **Verification:** After modifying code, ALWAYS run `npm run build` or `npm run typecheck` to verify that the changes haven't introduced regressions.
> - **GDPR Awareness:** Access to sensitive personnel data (SSN, Salary) MUST be audit-logged using `logEvent`.
> - **Communication Protocol:** Briefly explain your plan and answer the user's question *before* you start using tools.

## Project Summary
VIDERE RettSted is a comprehensive logistics and workforce management platform designed for the modern delivery organization. It solves the "last meter" delivery problem with a rich visual database of precise delivery locations and expands on this foundation with integrated tools for managing rutes, vehicles, personnel, and operational integrity.

The application strictly enforces Role-Based Access Control (RBAC) across: Super Admin, Organization Owner, Organization Admin, Route Planner, Warehouse/Loader, and Driver/Contractor.
