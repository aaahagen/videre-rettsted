import { Place, User, Organization, Route, Vehicle } from './types';

export interface Database {
  createOrganization(name: string): Promise<string>;
  getOrganization(orgId: string): Promise<Organization | null>;
  deleteOrganization(orgId: string): Promise<void>;
  updateOrganization(orgId: string, data: Partial<Organization>): Promise<void>; // Added this
  
  createUser(uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void>;
  getUser(uid: string): Promise<User | null>;
  getUsers(orgId: string): Promise<User[]>;
  updateUser(uid: string, data: Partial<User>): Promise<void>;
  deleteUser(uid: string): Promise<void>;

  createPlace(place: Omit<Place, 'id'>): Promise<Place>;
  getPlace(id: string): Promise<Place | null>;
  getPlaces(orgId: string): Promise<Place[]>;
  updatePlace(id: string, updates: Partial<Place>): Promise<Place>;
  deletePlace(id: string): Promise<void>;

  createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route>;
  getRoute(id: string): Promise<Route | null>;
  getRoutes(orgId: string): Promise<Route[]>;
  updateRoute(id: string, updates: Partial<Route>): Promise<Route>;
  deleteRoute(id: string): Promise<void>;

  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
  getVehicle(id: string): Promise<Vehicle | null>;
  getVehicles(orgId: string): Promise<Vehicle[]>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

}