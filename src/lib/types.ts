export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'driver';
  organizationId: string;
  favoritePlaces: string[];
};

export type DeliveryPlace = {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  description: string;
  hashtags: string[];
  imageUrl: string;
  imageHint: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
};
