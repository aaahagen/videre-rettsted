
import { Place, User, Organization } from './types';

export interface Database {
  getPlace(id: string): Promise<Place | null>;
  getPlaces(orgId: string): Promise<Place[]>;
  createPlace(place: Omit<Place, 'id'>): Promise<Place>;
  updatePlace(id: string, place: Partial<Place>): Promise<Place>;
  deletePlace(id: string): Promise<void>;
  
  // Organization and User methods
  getUser(uid: string): Promise<User | null>;
  getOrganization(orgId: string): Promise<Organization | null>;
  createOrganization(name: string): Promise<string>;
  createUser(uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void>;
}
