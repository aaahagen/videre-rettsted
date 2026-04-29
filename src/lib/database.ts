import { Place, User, Organization, Route, Vehicle, WorkLog, LogEntry, ProofOfDelivery, Order, Manifest, VehicleInspection, ManifestNote } from './types';

export interface Database {
  createOrganization(name: string): Promise<string>;
  getOrganization(orgId: string): Promise<Organization | null>;
  deleteOrganization(orgId: string): Promise<void>;
  updateOrganization(orgId: string, data: Partial<Organization>): Promise<void>; 
  
  createUser(uid: string, name: string, email: string, orgId: string, role: 'admin' | 'driver'): Promise<void>;
  getUser(uid: string): Promise<User | null>;
  getUsers(orgId: string): Promise<User[]>;
  updateUser(uid: string, data: Partial<User>): Promise<void>;
  deleteUser(uid: string): Promise<void>;
  toggleFavorite(userId: string, placeId: string): Promise<void>;
  markPlaceVisited(userId: string, placeId: string): Promise<void>;

  createPlace(place: Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Place>;
  getPlace(id: string): Promise<Place | null>;
  getPlaces(orgId: string): Promise<Place[]>;
  updatePlace(id: string, updates: Partial<Place>): Promise<Place>;
  deletePlace(id: string): Promise<void>;

  createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route>;
  getRoute(id: string): Promise<Route | null>;
  getRoutes(orgId: string): Promise<Route[]>;
  updateRoute(id: string, updates: Partial<Route>): Promise<Route>;
  deleteRoute(orgId: string, id: string): Promise<void>;

  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
  getVehicle(id: string): Promise<Vehicle | null>;
  getVehicles(orgId: string): Promise<Vehicle[]>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;



  createWorkLog(workLog: Omit<WorkLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkLog>;
  getWorkLog(id: string): Promise<WorkLog | null>;
  getWorkLogsForDriver(driverId: string, startDate?: string, endDate?: string): Promise<WorkLog[]>;
  getWorkLogsForOrganization(orgId: string, status?: WorkLog['status']): Promise<WorkLog[]>;
  updateWorkLog(id: string, updates: Partial<WorkLog>): Promise<WorkLog>;
  deleteWorkLog(id: string): Promise<void>;
  
  // Logging methods
  logEvent(orgId: string, userId: string, action: string, details?: any): Promise<void>;
  getLogs(orgId: string): Promise<LogEntry[]>;
  createLogEntry(logEntry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<string>;

  // --- Phase 3: Verification Methods ---
  
  // Orders
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  getOrder(orgId: string, orderId: string): Promise<Order | null>;
  getOrders(orgId: string): Promise<Order[]>;
  getOrdersForRoute(orgId: string, routeId: string): Promise<Order[]>;
  updateOrderStatus(orgId: string, orderId: string, status: Order['status']): Promise<void>;
  updateOrder(orgId: string, orderId: string, updates: Partial<Order>): Promise<void>;
  deleteOrder(orgId: string, orderId: string): Promise<void>;
  
  // Manifests
  createManifest(manifest: Omit<Manifest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateManifest(orgId: string, manifestId: string, updates: Partial<Manifest>): Promise<void>;
  deleteManifest(orgId: string, manifestId: string): Promise<void>;
  getManifestByRoute(orgId: string, routeId: string): Promise<Manifest | null>;
  incrementManifestItemLoadedCount(orgId: string, manifestId: string, orderId: string, userId: string): Promise<void>;
  processManifestScan(orgId: string, manifestId: string, scannedBarcode: string, userId: string): Promise<{ success: boolean; message: string }>;
  decrementManifestItemLoadedCount(orgId: string, manifestId: string, orderId: string): Promise<void>;
  finalizeManifest(orgId: string, manifestId: string, userId: string): Promise<void>;
  addManifestNote(orgId: string, manifestId: string, note: Omit<ManifestNote, 'createdAt'>): Promise<void>;

  // Proof of Delivery
  submitProofOfDelivery(orgId: string, routeId: string, placeId: string, pod: ProofOfDelivery): Promise<void>;
  
  // Inspections
  submitVehicleInspection(inspection: Omit<VehicleInspection, 'id'>): Promise<string>;
  getVehicleInspections(orgId: string, vehicleId: string): Promise<VehicleInspection[]>;
}
