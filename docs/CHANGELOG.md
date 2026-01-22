# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-05-16

### Added
- Created `docs/CHANGELOG.md` to track project changes.
- Introduced a backend abstraction layer to prepare for future backend migrations. This includes:
  - Generic interfaces for Database, Authentication, and Storage (`src/lib/database.ts`, `src/lib/auth.ts`, `src/lib/storage.ts`).
  - Placeholder Firebase implementations for the new interfaces (`src/lib/firebase/database.ts`, `src/lib/firebase/auth.ts`, `src/lib/firebase/storage.ts`).

### Changed
- Updated `docs/ARCHITECTURE.md` to describe the new backend abstraction layer.
