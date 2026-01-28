# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Image carousel on the place details page.
- "Beskrivelse & Instruksjoner" and "Lokasjon & Kart" sections on the place details page.
- Hashtags display on the place details page.
- Metadata (created by, date created/updated) on the place details page.
- Organization name display in the sidebar.
- "Profil" and "Innstillinger" items in the user profile dropdown.

### Changed
- Refined the layout and spacing of the place details page.
- Swapped the order of "Beskrivelse & Instruksjoner" and "Lokasjon & Kart" sections.
- Redesigned the sidebar header to display the app name on two lines for a more compact look.
- Improved the alignment and spacing of the logo and app name in the sidebar.
- Updated `docs/ARCHITECTURE.md` to reflect the latest project structure and data model.

## [0.1.0] - 2024-05-16

### Added
- Created `docs/CHANGELOG.md` to track project changes.
- Introduced a backend abstraction layer to prepare for future backend migrations. This includes:
  - Generic interfaces for Database, Authentication, and Storage (`src/lib/database.ts`, `src/lib/auth.ts`, `src/lib/storage.ts`).
  - Placeholder Firebase implementations for the new interfaces (`src/lib/firebase/database.ts`, `src/lib/firebase/auth.ts`, `src/lib/firebase/storage.ts`).

### Changed
- Updated `docs/ARCHITECTURE.md` to describe the new backend abstraction layer.
