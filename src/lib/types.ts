import { FieldValue } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'driver';
  organizationId: string;
  photoURL?: string;
  disabled?: boolean;
}

export interface Organization {
  id:string;
  name: string;
  orgNumber?: string;
  ownerId?: string;
  fieldSettings?: {
    description?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };
    notes?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };
    field3?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };
  };
  legal?: {
    dpaAcceptedAt?: {
      toDate: () => Date;
    };
    dpaAcceptedBy?: string;
    dpaAcceptedByEmail?: string;
    dpaVersion?: string;
    termsAcceptedAt?: {
      toDate: () => Date;
    };
    termsVersion?: string;
  };
}

export interface Place {
  id: string;
  name: string;
  address: string;
  description: string; // Used for "description"
  notes?: string;      // Used for "notes"
  field3?: string;     // New field
  hashtags?: string[];
  
  // Delivery stats
  estimatedDeliveryTime?: number; // estimated time to complete delivery at this place in minutes
  
  // Images
  imageUrl?: string;
  imageHint?: string;
  images?: { url: string; description?: string; uploadedAt?: any }[];

  // Location
  coordinates?: {
    lat: number;
    lng: number;
  };
  location?: { // keeping for backward compatibility if needed
    latitude: number;
    longitude: number;
  };

  // Meta
  orgId: string; // Database field is orgId
  organizationId?: string; // Alias or legacy
  
  authorId?: string;
  createdBy?: string; // Database field might be createdBy
  
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
  authorName?: string;
}

export type DeliveryPlace = Place;

export interface Route {
  id: string;
  name: string;
  orgId: string; // Database field is orgId
  organizationId?: string;
  places: string[]; // array of placeIds
  completedStops?: string[]; // array of placeIds that are marked as complete
  startAddress?: string; // The starting address of the route
  endAddress?: string; // The ending address of the route
  driverId?: string;
  distance?: number; // in kilometers
  distanceString?: string; // e.g. "10.5 km"
  duration?: string; // e.g., "1 t 23 min"
  prepTimeStart?: number; // in minutes
  prepTimeEnd?: number; // in minutes
  breakTime?: number; // in minutes
  fuelServiceTime?: number; // in minutes
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'driver';
  expiresAt: FieldValue;
  organizationName?: string;
}

export interface User {
  avatarUrl?: string;
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: 'admin' | 'driver';
  favorites: string[];
  status?: 'active' | 'paused';
}

export interface LogEntry {
  id: string;
  orgId: string;
  userId: string;
  action: 'create_place' | 'delete_place' | 'login';
  timestamp: FieldValue | Date;
  details?: any;
}