
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
  id: string;
  name: string;
  ownerId: string;
  fieldSettings?: {
    description?: {
      label: string;
      placeholder: string;
    };
    notes?: {
      label: string;
      placeholder: string;
    };
  };
}

export interface Place {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  notes?: string;
  hashtags: string[];
  images: { url: string; caption: string }[];
  organizationId: string;
  authorId: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  authorName?: string;
}

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'driver';
  expiresAt: FieldValue;
  organizationName?: string;
}
