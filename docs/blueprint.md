# **App Name**: Videre RettSted

## Core Features:

- Organization Management: Admins can create and manage organizations, which isolate user data within specific groups.
- User Invitation and Access Control: Admins invite users with expiring links. Users are assigned roles (Driver/Admin) and are limited to accessing data from their organization.
- Delivery Place Creation and Update: Drivers can create and update delivery places, including name, address, coordinates, description, and hashtags.
- Image Management with Compression: Client-side image compression (max 1200px width) before uploading to Firebase Storage, supporting both camera capture and gallery upload. Use an image scaling tool to generate thumbnails and different resolutions.
- Location Search and Filtering: Search and filter delivery places by name, address, or hashtags. Display results in a grid view with large, image-centric cards.
- Favorite Places: Allows users to add delivery places to a list of favorites
- Navigation Integration with Google Maps: Integrate Google Maps using a deep link. Open the map in the Google Maps application for turn-by-turn navigation.

## Style Guidelines:

- Primary color: Deep blue (#1A237E), reflecting trust and reliability.
- Background color: Very light blue-gray (#F0F4F8), providing a clean and neutral backdrop.
- Accent color: Yellow-gold (#FFC107), offering a contrast and highlighting key interactive elements.
- Font pairing: 'Poppins' (sans-serif) for headlines, 'PT Sans' (sans-serif) for body text. Note: currently only Google Fonts are supported.
- Use clear, recognizable icons for navigation and actions. Ensure touch targets are a minimum of 44px.
- Mobile-first, high-contrast design. Grid view for delivery places. Large, clear labels for important information.
- Subtle transitions and feedback animations on user interactions, such as button presses and data loading.