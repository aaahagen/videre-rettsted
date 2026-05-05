import { FieldValue } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'driver' | 'contractor' | 'loader' | 'planner';
  organizationId: string;
  photoURL?: string;
  disabled?: boolean;
}

export interface Organization {
  id:string;
  name: string;
  orgNumber?: string;
  ownerId?: string;
  status?: 'active' | 'trial' | 'suspended';
  modules?: {
    places?: boolean;
    learning?: boolean;
    messages?: boolean;
    fleet?: boolean;
    workforce?: boolean;
    logistics?: boolean;
    analytics?: boolean;
  };
  mainDepot?: {
    address: string;
    coordinates: { lat: number, lng: number };
    radius: number; // in meters
  };
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
    contactPersons?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };
    doorCode?: {
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

export interface OpeningHours {
    isOpen: boolean;
    open?: string;  // Format: "HH:mm"
    close?: string; // Format: "HH:mm"
}

export interface Place {
  id: string;
  name: string;
  address: string;
  description: string; // Used for "description"
  notes?: string;      // Used for "notes"
  doorCode?: { category?: string; name?: string; value?: string; }[];
  contactPersons?: { name: string; phone: string; email: string; }[];
  hashtags?: string[];
  
  // Zone constraints
  isZeroEmissionZone?: boolean; // If true, prefers/requires electric/gas
  isCityCenter?: boolean; // High toll area

  // Physical limitations for vehicles at this location
  maxVehicleHeight?: number; // meters
  maxVehicleWidth?: number;  // meters
  maxVehicleLength?: number; // meters
  maxVehicleWeight?: number; // kg (total weight of vehicle)

  // Opening Hours
  weeklySchedule?: {
    monday: OpeningHours;
    tuesday: OpeningHours;
    wednesday: OpeningHours;
    thursday: OpeningHours;
    friday: OpeningHours;
    saturday: OpeningHours;
    sunday: OpeningHours;
  };
  
  // Delivery stats
  estimatedDeliveryTime?: number; // estimated time to complete delivery at this place in minutes
  
  // Images
  imageUrl?: string;
  imageHint?: string;
  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];

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
  createdBy: string;
  updatedBy?: string;
  
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export type DeliveryPlace = Place;

export interface CompletedStopEvent {
    placeId: string;
    timestamp: string | Date | FieldValue;
    coordinates?: {
        lat: number;
        lng: number;
    };
    pod?: ProofOfDelivery;
}

export interface RouteSuggestion {
    vehicleId: string;
    driverId?: string;
    orders: Order[];
    places: Place[];
    estimatedDuration: number; // minutes
    estimatedDistance: number; // km
    warnings: string[]; 
    errors: string[];   
}

export interface Route {
  id: string;
  name: string;
  status?: 'active' | 'completed' | 'template'; // Added 'template'
  shipmentNumber?: string;
  orgId: string; // Database field is orgId
  organizationId?: string;
  places: string[]; // array of placeIds
  completedStops?: string[]; // array of placeIds that are marked as complete
  completedStopEvents?: Record<string, CompletedStopEvent & { pod?: ProofOfDelivery }>; // map of placeId to completion event
  startAddress?: string; // The starting address of the route
  endAddress?: string; // The ending address of the route
  notes?: string; // Crucial information about the route
  driverId?: string;
  isThirdParty?: boolean;
  thirdPartySupplier?: string; // Name of the 3PS company
  vehicleId?: string;
  trailerId?: string; // Added for Modular Combinations
  distance?: number; // in kilometers
  distanceString?: string; // e.g. "10.5 km"
  duration?: string; // e.g., "1 t 23 min"
  prepTimeStart?: number; // in minutes
  prepTimeEnd?: number; // in minutes
  breakTime?: number; // in minutes
  fuelServiceTime?: number; // in minutes
  date?: string; // ISO date string (YYYY-MM-DD) for when the route is planned
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: 'super_admin' | 'admin' | 'driver' | 'contractor' | 'loader' | 'planner';
  expiresAt: FieldValue;
  organizationName?: string;
}

export interface User {
  avatarUrl?: string;
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: 'super_admin' | 'admin' | 'driver' | 'contractor' | 'loader' | 'planner';
  favorites: string[];
  visitedPlaces?: string[]; // Array of placeIds the user has completed on a route
  status?: 'active' | 'paused';
  disabled?: boolean;
  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];
}

export interface LogEntry {
  id: string;
  orgId: string;
  userId: string;
  action: 'create_place' | 'delete_place' | 'login' | 'admin_view_worklog';
  timestamp: FieldValue | Date;
  details?: any;
}

export interface Vehicle {
  id: string;
  orgId: string;
  name: string; // e.g., "Scania R500", "Van 1"
  registrationNumber: string;
  type: 'truck' | 'van' | 'car' | 'trailer' | 'tractor'; // Expanded
  config?: 'rigid' | 'tractor' | 'drawbar' | 'semi' | 'box_swap' | 'fixed_box'; // Added config
  fuelType?: 'diesel' | 'electric' | 'gas' | 'hybrid';
  maxRange?: number; // km (for electric/gas)
  dimensions?: {
    length?: number; // meters
    height?: number; // meters
    width?: number; // meters
  };
  capacity: {
    weight?: number; // in kg
    volume?: number; // in cubic meters
    pallets?: number;
    notes?: string;
  };
  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean; // Hazardous materials
    trailerCoupling: boolean; // Can drag a trailer (VBG/Drawbar)
    fifthWheel?: boolean; // Can drag a semi-trailer
    flatbed?: boolean; // Flakbil
    notes?: string;
    customFields?: { name: string; value: string }[];
  };
  
  // Compliance & Deadlines
  euControl?: string; // ISO date (YYYY-MM-DD)
  nextService?: string; // ISO date or descriptive string
  tachographCalibration?: string; // ISO date (YYYY-MM-DD)

  status: 'active' | 'maintenance' | 'inactive'; // DEPRECATED: Use currentStatuses array instead.
  currentStatuses: ("ready" | "pending_workshop" | "workshop" | "observation" | "on_tour" | "parked")[];
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];
  documents?: { url: string; name: string; type: 'registration' | 'insurance' | 'other' | 'workshop_order' | 'workshop_receipt'; uploadedAt?: any }[];
}

export interface Contract {
  id: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional for current contract
  contractedHours: number; // Weekly hours
  role: string;
  salary?: number;
}

export interface WorkLog {
  id: string;
  orgId: string;
  driverId: string;
  
  // Planned Schedule (Snapshot of what was expected)
  plannedStart?: string; // ISO DateTime string
  plannedEnd?: string;   // ISO DateTime string
  
  // Actual Punches
  actualPunchIn?: string;  // ISO DateTime string
  actualPunchOut?: string; // ISO DateTime string
  
  // Location Data
  entryMethod: 'geofence' | 'gps_stamp' | 'manual_entry';
  punchInLocation?: { lat: number, lng: number };
  punchOutLocation?: { lat: number, lng: number };
  
  // Approval & Overtime Workflow
  status: 'active' | 'pending_review' | 'needs_overtime_approval' | 'approved' | 'declined';
  overtimeMinutes?: number;
  
  // Audit & Context
  notes?: string;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface DriverProfile extends User {
  employmentType?: 'internal' | 'external';
  timeTrackingMethod?: 'fixed_location' | 'flexible_location';
  baseLocation?: {
    address: string;
    coordinates: { lat: number, lng: number };
    radius: number;
  };
  agencyInfo?: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
  };
  workingHours?: {
    start: string; // e.g., "08:00"
    end: string;   // e.g., "16:00"
  };
  rotation?: {
    startDate: string; // ISO date string when rotation starts
    weeks: Array<{
      days: {
        monday: { isWorking: boolean; start?: string; end?: string };
        tuesday: { isWorking: boolean; start?: string; end?: string };
        wednesday: { isWorking: boolean; start?: string; end?: string };
        thursday: { isWorking: boolean; start?: string; end?: string };
        friday: { isWorking: boolean; start?: string; end?: string };
        saturday: { isWorking: boolean; start?: string; end?: string };
        sunday: { isWorking: boolean; start?: string; end?: string };
      };
    }>;
  };
  scheduleOverrides?: Record<string, {
    type: 'off' | 'vacation' | 'sick' | 'other' | 'custom';
    start?: string;
    end?: string;
  }>;
  certifications?: string[]; // e.g., ["ADR", "Forklift"]
  skills?: string[];
  documents?: { url: string; name: string; type: string; uploadedAt?: any }[]; // For certificates, diplomas, etc.
  
  // New HR/Workforce fields
  address?: string;
  phone?: string;
  emergencyContact?: string; // Format: Name, Relationship, Phone
  nextOfKin?: string;
  children?: string; // Simple text field for now, can be expanded later
  adminNotes?: string;
  seniorityDate?: string; // ISO date string
  contracts?: Contract[];

  // Personal Identification
  dateOfBirth?: string; // ISO date string
  socialSecurityNumber?: string;
  gender?: string;

  // Employment & Status
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  supervisor?: string;
  employmentStatus?: string; // e.g., 'full-time', 'part-time'
  probationEndDate?: string; // ISO date string

  // Compensation & Benefits
  hourlyRate?: number;
  bankAccountNumber?: string;
  taxCode?: string;

  // Compliance & Records
  staffHandbookAcknowledged?: boolean;
  backgroundCheckDate?: string; // ISO date string
}

export interface Message {
  id: string;
  orgId: string;
  senderId: string; // userId
  recipientId: string; // userId or 'all'/'drivers'/'admins' for broadcast
  content: string;
  createdAt: FieldValue | Date;
  readBy: string[]; // array of userIds who have read the message
  type: 'direct' | 'broadcast';
}

// --- PHASE 3: END-TO-END VERIFICATION MODELS ---

export interface ProofOfDelivery {
  // Core Tracking
  timestamp: string | Date | any;
  coordinates?: { lat: number; lng: number; accuracy?: number }; // Accuracy is industry standard for geofencing disputes
  
  // Status
  status: 'successful' | 'partially_successful' | 'failed_attempt';
  
  // Delivery Context
  deliveryMethod?: 'handed_to_recipient' | 'left_at_door' | 'left_in_safe_place' | 'mailroom_reception' | 'neighbor';
  
  // Recipient Verification
  signatureUrl?: string; // Image of signature
  signatureName?: string; // Printed name of signee
  recipientPhone?: string; // Optional: For verification

  // Visual Proof (Crucial for redundancy)
  photos?: { 
    url: string; 
    description?: string; 
    type?: 'package_in_situ' | 'damage_proof' | 'door_number' | 'general';
    uploadedAt?: any;
  }[];
  
  // Package Tracking
  scannedBarcodes?: string[]; // Verification that specific items were dropped
  
  // Exceptions & Damages
  failureReason?: 'recipient_unavailable' | 'address_not_found' | 'access_denied' | 'package_damaged_refused' | 'other';
  damageReported?: boolean;
  damageDetails?: string;
  
  // Notes
  notes?: string; 
}


export interface LineItem {
  id: string; // Unique ID for the line item (e.g. 'keg-of-beer')
  description: string;
  quantity: number;
  weightPerItem?: number; // kg
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  type?: 'keg' | 'case' | 'box' | 'other';
}

export interface Collie {
  id: string; // Unique tracking ID (Barcode) for this specific item (e.g. Order-123-Item-1)
  lineItemId: string; // Reference back to the line item type
  handlingUnitId?: string; // If it is on a pallet, which one?
  status: 'pending' | 'loaded' | 'delivered' | 'failed';
}

export interface HandlingUnit {
  id: string; // Parent SSCC / Pallet Barcode
  type: 'eur-pallet' | 'half-pallet' | 'custom';
  status: 'pending' | 'loaded' | 'delivered' | 'failed';
}

export interface Order {
  id: string;
  orgId: string;
  routeId?: string; // If assigned to a route
  placeId: string; // The destination
  status: 'pending' | 'loaded' | 'delivered' | 'failed';
  barcode: string; // The primary tracking identifier
  details: {
    description: string;
    weight?: number;
    volume?: number;
    form?: 'pallet' | 'package' | 'liquid' | 'other';
    numberOfItems?: number; // Added: How many individual items/pallets are in this order
    specialRequirements?: {
      adr?: boolean;
      temperatureControlled?: boolean;
      fragile?: boolean;
    };
  };
  lineItems?: LineItem[];
  collies?: Collie[];
  handlingUnits?: HandlingUnit[];
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface ManifestNote {
    content: string;
    createdAt: string | Date | FieldValue;
    createdBy: string; // userId
    userName?: string; // name of the creator
    type: 'note' | 'issue';
}

export interface Manifest {
  id: string;
  routeId: string;
  orgId: string;
  vehicleId: string;
  status: 'pending' | 'loading' | 'verified' | 'departed';
  orders: {
    orderId: string;
    barcode: string;
    status: 'pending' | 'loaded';
    totalItems: number; // Added: The total number of items/pallets for this order
    loadedItems: number;
    scannedCollieIds?: string[];
    loadedAt?: string | Date | FieldValue;
    loadedBy?: string; // userId of the loader
  }[];
  notes?: ManifestNote[]; // Added: Loader notes and issue reports
  verifiedAt?: string | Date | FieldValue;
  verifiedBy?: string; // userId of the admin/loader who finalized it
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface VehicleInspection {
  id: string;
  orgId: string;
  vehicleId: string;
  driverId: string;
  timestamp: string | Date | FieldValue;
  type: 'pre_trip' | 'post_trip' | 'ad_hoc';
  mileage: number;
  checks: {
    tires: boolean;
    brakes: boolean;
    lights: boolean;
    fluids: boolean;
    bodywork: boolean;
  };
  damagesReported: boolean;
  damageDetails?: {
    description: string;
    photos?: { url: string; uploadedAt?: any }[];
  }[];
  notes?: string;
}
export interface VehicleDamageReport { 
  id: string; 
  orgId: string; 
  vehicleId: string; 
  reportedBy: string; 
  reportedByName: string; 
  description: string; 
  images: string[]; 
  status: 'reported' | 'in_progress' | 'fixed'; 
  createdAt: FieldValue | Date; 
  resolvedAt?: FieldValue | Date; 
  resolvedBy?: string;
  workshopOrderReceiptUrl?: string;
  workshopRepairReceiptUrl?: string;
}

// --- PHASE 2: LMS (Learning Management System) MODELS ---

export interface Course {
  id: string;
  orgId: string;
  title: string;
  description: string;
  category: 'safety' | 'tools' | 'equipment' | 'company_policy' | 'other';
  content: {
    type: 'pdf' | 'video' | 'link' | 'text';
    url?: string;
    body?: string;
  }[];
  isCertification?: boolean; // New field
  validityMonths?: number;   // New field
  requiredRoles?: ('super_admin' | 'admin' | 'driver' | 'contractor' | 'loader' | 'planner')[];
  estimatedMinutes?: number;
  isPublished: boolean;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface CourseAssignment {
  id: string;
  orgId: string;
  courseId: string;
  userId: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'expired';
  progress?: number; // 0-100
  assignedAt: FieldValue | Date;
  completedAt?: FieldValue | Date;
  expiresAt?: FieldValue | Date; // For certifications that need renewal
}
