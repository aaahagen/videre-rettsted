# Project Specification: Videre RettSted

## Project Overview
Videre RettSted is a web-based application (deployed as a PWA/App Store wrapper) designed for drivers to find precise delivery locations. It solves the "last-meter" delivery problem by providing photos, descriptions, and specific entrance maps that standard GPS often misses.

## Target Audience
- **Admins (Hjelpefunksjonærer)**: Tech-savvy individuals responsible for setting up organizations and managing users.
- **Drivers**: The primary users, often with low digital literacy. The UI for them must be extremely intuitive.

## Core Features

### 1. Multi-Tenancy & Onboarding
- **Admin-First Registration**: The application starts with a landing page where an administrator can register a new organization. The first user to register an organization automatically becomes its administrator.
- **Invitation-Only for Subsequent Users**: The administrator of an organization can invite other users (both drivers and other admins). Invited users receive an expiring link to set up their account.

### 2. Authentication
- **Login Page**: A simple, dedicated login page for all existing users.
- **Password Reset**: Users can reset their own passwords.

### 3. Place Management
- **Grid View**: A visual list of locations with large square images and names.
- **Place Details**: Address, text description, image carousel, and Google Maps integration.
- **Editing**: Drivers can create/update places; only Admins can delete.
- **History**: Every place tracks `created_at`, `updated_at`, and `author_id`.

### 4. Media Handling
- Direct camera upload or gallery selection.
- **Automatic Downscaling**: Images must be resized client-side before upload to Firestore/Storage.
- Image descriptions for every photo.

### 5. Search & Organization
- Hashtag-based categorization (#ramp, #basement, etc.).
- Search by name, address, or hashtag.
- "Favorite" system for individual users.

## Language Support
- Primary: Norwegian (Bokmål).
- Architecture must support i18n (English and other languages planned).
