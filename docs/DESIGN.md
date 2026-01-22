# Design Guidelines: Videre RettSted

## UI Principles
- **Touch Targets**: All buttons and interactive elements must be large (minimum 44x44px).
- **Simplicity**: No hidden menus. Important actions should be visible.
- **Visual-First**: Use images to identify locations rather than just text.

## Screen Layouts (Based on Wireframes)

### 1. Admin Onboarding & Registration
- A dedicated landing page (`/`) designed to explain the value proposition of Videre RettSted to potential administrators and organizations.
- This page will feature a clear "Get Started" or "Register Your Organization" call-to-action.
- The registration form (`/register`) will allow the first user of an organization to create their admin account and define the organization's name. This user automatically becomes the administrator.

### 2. User Login
- A separate, clean login page (`/login`) for all registered users (both Drivers and Admins).
- The page will contain fields for email and password, and a "Remember Me" option.
- It will be the primary entry point for users who have already been invited.

### 3. The Grid (Main View) - [Ref: IMG_8391]
- **Header**: Left-aligned Menu (Burger), User Profile icon, Center Title "Leveringssteder", Right-aligned Logo.
- **Body**: 2 or 3 column grid of square cards. 
- **Card Design**: Large square image + Label bar at the bottom with the Place Name.

### 4. Place Details - [Ref: IMG_8390]
- **Header**: Back button ("Tilbake"), Place Name, Logo.
- **Top Section**: Text description box + Image Carousel (swipeable).
- **Middle Section**: Address display + Map Snippet.
- **Map Interaction**: The map should be a static/interactive preview. Clicking it must trigger a deep link to the Google Maps app for turn-by-turn navigation.
- **Footer**: "Edit" button (if permitted) and metadata (Created by...).

## Navigation Flow - [Ref: IMG_8389]
- **Admins**: Landing Page -> Register Organization -> Dashboard (Grid)
- **Invited Users (Drivers/Admins)**: Invitation Link -> Set Password -> Login Page -> Dashboard (Grid)
- **Returning Users**: Login Page -> Dashboard (Grid) <-> Place Details -> External Google Maps Navigation.
