export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'admin' | 'driver';
  orgId: string;
  favorites?: string[];
};

export type Organization = {
  id: string;
  name: string;
};

export type PlaceImage = {
  url: string;
  path?: string;
  description?: string;
  uploadedAt: Date;
};

export type Place = {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  description: string;
  hashtags: string[];
  imageUrl: string; // Keep for backward compatibility (primary image)
  imageHint: string;
  images: PlaceImage[];
  orgId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type DeliveryPlace = Place;
