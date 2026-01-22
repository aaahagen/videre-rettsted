import type { User, DeliveryPlace } from './types';
import { PlaceHolderImages } from './placeholder-images';

// Mock data
const MOCK_USER: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
  role: 'admin',
  organizationId: 'org-1',
  favoritePlaces: ['place-2', 'place-4'],
};

const MOCK_PLACES: DeliveryPlace[] = [
  {
    id: 'place-1',
    name: 'Main Distribution Center',
    address: '123 Industrial Ave, Metropolis',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    description: 'Main warehouse. Deliveries to Dock 7. Ring bell after 5 PM. Security code for gate is #1234.',
    hashtags: ['warehouse', 'priority', 'after-hours'],
    imageUrl: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
    organizationId: 'org-1',
    createdBy: 'user-2',
    createdAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: 'place-2',
    name: 'Downtown Boutique',
    address: '456 Market St, Metropolis',
    coordinates: { lat: 34.056, lng: -118.245 },
    description: 'Small shop. Park in the alley behind the store. Delivery door is green. Usually busy in the afternoon.',
    hashtags: ['retail', 'downtown', 'alley-delivery'],
    imageUrl: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
    organizationId: 'org-1',
    createdBy: 'user-1',
    createdAt: new Date('2023-10-25T14:30:00Z'),
  },
  {
    id: 'place-3',
    name: 'The Grand Apartments',
    address: '789 Skyline Dr, Metropolis',
    coordinates: { lat: 34.06, lng: -118.25 },
    description: 'Residential building. Leave packages with the concierge in the main lobby. Do not leave unattended.',
    hashtags: ['residential', 'concierge'],
    imageUrl: PlaceHolderImages[2].imageUrl,
    imageHint: PlaceHolderImages[2].imageHint,
    organizationId: 'org-1',
    createdBy: 'user-1',
    createdAt: new Date('2023-10-25T11:00:00Z'),
  },
  {
    id: 'place-4',
    name: 'Miller Residence',
    address: '101 Oak Ln, Suburbia',
    coordinates: { lat: 34.1, lng: -118.3 },
    description: 'Leave packages on the front porch, behind the white pillar. Beware of dog (friendly, but loud).',
    hashtags: ['residential', 'porch-drop'],
    imageUrl: PlaceHolderImages[3].imageUrl,
    imageHint: PlaceHolderImages[3].imageHint,
    organizationId: 'org-1',
    createdBy: 'user-2',
    createdAt: new Date('2023-10-24T09:00:00Z'),
  },
    {
    id: 'place-5',
    name: 'City Corp Tower',
    address: '202 Finance Blvd, Metropolis',
    coordinates: { lat: 34.05, lng: -118.255 },
    description: 'Deliver to the mailroom on the ground floor. Access via the loading bay on the west side of the building.',
    hashtags: ['office', 'mailroom', 'loading-bay'],
    imageUrl: PlaceHolderImages[4].imageUrl,
    imageHint: PlaceHolderImages[4].imageHint,
    organizationId: 'org-1',
    createdBy: 'user-1',
    createdAt: new Date('2023-10-23T16:00:00Z'),
  },
  {
    id: 'place-6',
    name: 'Future Homes Construction',
    address: '303 Growth Ave, Suburbia',
    coordinates: { lat: 34.12, lng: -118.32 },
    description: 'Active construction site. Hard hat required. Drop materials with the site manager, usually in the trailer.',
    hashtags: ['construction', 'danger', 'manager-signoff'],
    imageUrl: PlaceHolderImages[5].imageUrl,
    imageHint: PlaceHolderImages[5].imageHint,
    organizationId: 'org-1',
    createdBy: 'user-2',
    createdAt: new Date('2023-10-22T08:30:00Z'),
  },
];

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getUser(): Promise<User> {
  await delay(200);
  return MOCK_USER;
}

export async function getPlaces(query?: string, filters?: string[]): Promise<DeliveryPlace[]> {
  await delay(500);
  let places = MOCK_PLACES;

  if (query) {
    const lowercasedQuery = query.toLowerCase();
    places = places.filter(place => 
      place.name.toLowerCase().includes(lowercasedQuery) ||
      place.address.toLowerCase().includes(lowercasedQuery)
    );
  }
  
  if (filters && filters.length > 0) {
    places = places.filter(place =>
        filters.every(filter => place.hashtags.includes(filter))
    );
  }
  
  return places.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getPlaceById(id: string): Promise<DeliveryPlace | undefined> {
    await delay(300);
    return MOCK_PLACES.find(p => p.id === id);
}

export async function getFavoritePlaces(): Promise<DeliveryPlace[]> {
    await delay(400);
    return MOCK_PLACES.filter(place => MOCK_USER.favoritePlaces.includes(place.id));
}

// Mock function to toggle favorite status
export async function toggleFavorite(placeId: string): Promise<User> {
    await delay(100);
    const isFavorite = MOCK_USER.favoritePlaces.includes(placeId);
    if(isFavorite) {
        MOCK_USER.favoritePlaces = MOCK_USER.favoritePlaces.filter(id => id !== placeId);
    } else {
        MOCK_USER.favoritePlaces.push(placeId);
    }
    return MOCK_USER;
}
