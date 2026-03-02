# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Implemented profile picture upload functionality.
- Created `storage.rules` for Firebase Storage security.
- "Bytt passord" and "Endre profilbilde" items in the user profile dropdown.
- Image carousel on the place details page.
- "Beskrivelse & Instruksjoner" and "Lokasjon & Kart" sections on the place details page.
- Hashtags display on the place details page.
- Metadata (created by, date created/updated) on the place details page.
- Organization name display in the sidebar.
- Real Firebase-backed favorites functionality.
- Empty state for the favorites page.

### Changed
- Improved sidebar performance on mobile by automatically closing it when profile actions are clicked.
- Fixed avatar image aspect ratio to prevent distortion (`object-cover`).
- Improved profile picture upload UX (cancel button behavior, error handling).
- Increased the size of the sidebar trigger button on mobile for better accessibility.
- Changed the sidebar trigger icon to a hamburger menu on mobile.
- Updated sidebar navigation to use client-side `Link` for faster transitions.
- Configured the sidebar to automatically close when a link is clicked on mobile.
- Fixed the user profile dropdown position on mobile to ensure it stays within the viewport.
- Replaced user name with email in the sidebar button.
- Simplified the user profile dropdown to remove redundant user info.
- Refined the layout and spacing of the place details page.
- Swapped the order of "Beskrivelse & Instruksjoner" and "Lokasjon & Kart" sections.
- Redesigned the sidebar header to display the app name on two lines for a more compact look.
- Improved the alignment and spacing of the logo and app name in the sidebar.
- Updated `docs/ARCHITECTURE.md` to reflect the latest project structure and data model.
- Renamed "Hjem" to "Leveringssteder" in the sidebar menu.
- Removed redundant "Nytt sted" button from the dashboard header.
- Replaced heart icon with a star icon for favorites.
- Switched the favorites page to a client-side component for real-time data fetching.

## [0.1.0] - 2024-05-16

### Added
- Created `docs/CHANGELOG.md` to track project changes.
- Introduced a backend abstraction layer to prepare for future backend migrations. This includes:
  - Generic interfaces for Database, Authentication, and Storage (`src/lib/database.ts`, `src/lib/auth.ts`, `src/lib/storage.ts`).
  - Placeholder Firebase implementations for the new interfaces (`src/lib/firebase/database.ts`, `src/lib/firebase/auth.ts`, `src/lib/firebase/storage.ts`).

### Changed
- Updated `docs/ARCHITECTURE.md` to describe the new backend abstraction layer.
