# App Blueprint: VIDERE RettSted

> [!IMPORTANT]
> **AI ASSISTANT INSTRUCTIONS**
> **CRITICAL:** Before proposing any architectural changes, writing new features, or refactoring code for "VIDERE RettSted", you MUST read and adhere to the following project documents. These documents form the "Documentation Pyramid" and are the absolute source of truth.
> 
> 1. **`docs/strategy.md`**: The Product Vision & Roadmap. Check here to understand the *Why* and the *When* (which Phase we are currently building).
> 2. **`docs/domain.md`**: Business Logic & Feature Specs. Read this to understand the *What* (Rules for Route Planning, Access Control, Manifest logic).
> 3. **`docs/engineering.md`**: Architecture, UI & Testing rules. Read this to understand the *How* (Backend abstractions, Tailwind design philosophy, QA loops).
> 4. **`docs/CHANGELOG.md`**: The absolute Ground Truth of what has *already been built*. Always check this to avoid rebuilding existing features. Whenever you complete a task, you MUST update the `[Unreleased]` -> `### Added`, `### Changed`, or `### Fixed` section of this file.
> 
> **Core Developer Rules:**
> - **Primary Tooling:** ALWAYS use the `write_file` tool for all code modifications. DO NOT use `sed`, `awk`, or other terminal commands to patch files, as this is prone to error and can lead to inconsistent state. `write_file` ensures the entire file content is correctly synchronized.
> - **Verification:** After modifying code, ALWAYS run `npm run build` or `npm run typecheck` to verify that the changes haven't introduced regressions. If you update interfaces, run `npm run docs` to update the API reference.
> - **Deployment & Versioning:** When asked to build and push to Github, you MUST FIRST run `npm run build`. If the build is successful, you MUST update the `docs/CHANGELOG.md` file with the changes made, and update any other relevant documentation before pushing to Github.
> - **No God Objects:** Keep database operations separated by domain (e.g., `orders.ts`, `places.ts`) as dictated by `engineering.md`.
> - **Role Awareness:** Every UI change must consider the user's role (Driver, Loader, Planner, Admin).
> - **Strict Scope Adherence:** DO NOT alter, fix, or refactor anything outside the explicit scope of the user's request. If you notice unrelated issues or improvements, you MUST ask the user for permission before making those changes.
> - **Communication Protocol:** When asked a question or given a task, you MUST briefly explain your plan and answer the question *before* you start using tools to write code.
> - **Action over words:** While you must explain your plan first, once the plan is stated, use your tools to execute it without further prompting. Update the changelog upon completion.

## Project Summary
VIDERE RettSted is a comprehensive logistics and workforce management platform designed for the modern delivery organization. It solves the "last meter" delivery problem with a rich visual database of precise delivery locations and expands on this foundation with integrated tools for managing routes, vehicles, personnel, and operational integrity.

The application strictly enforces Role-Based Access Control (RBAC) across: Super Admin, Organization Owner, Organization Admin, Route Planner, Warehouse/Loader, and Driver/Contractor.

*To understand how these roles interact with features, read `docs/domain.md`.*
*To understand how to write code for these features, read `docs/engineering.md`.*
