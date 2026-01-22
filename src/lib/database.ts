
import { Place } from './types';

export interface Database {
  getPlace(id: string): Promise<Place | null>;
  getPlaces(orgId: string): Promise<Place[]>;
  createPlace(place: Omit<Place, 'id'>): Promise<Place>;
  updatePlace(id: string, place: Partial<Place>): Promise<Place>;
  deletePlace(id: string): Promise<void>;
}
