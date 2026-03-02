
import { Place, User, Organization, Route } from './types';

export interface Database {
  // Places
  getPlace(id: string): Promise<Place | null>;
  getPlaces(orgId: string): Promise<Place[]>;
  createPlace(place: Omit<Place, 'id'>): Promise<Place>;
  updatePlace(id: string, place: Partial<Place>): Promise<Place>;
  deletePlace(id: string): Promise<void>;
  
  // Routes
  getRoute(id: string): Promise<Route | null>;
  getRoutes(orgId: string): Promise<Route[]>;
  createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route>;
  updateRoute(id: string, route: Partial<Route>): Promise<Route>;
  deleteRoute(id: string): Promise<void>;

  // Organization and User methods
  getUser(uid: string): Promise<User | null>;
  updateUser(uid: string, data: Partial<User>): Promise<void>;
  getOrganization(orgId: string): Promise<Organization | null>;
  createOrganization(name: string): Promise<string>;
  createUser(uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void>;
}
