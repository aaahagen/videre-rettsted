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
  id:string;
  name: string;
  orgNumber?: string;
  ownerId?: string;
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
    field3?: {
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

export interface Place {
  id: string;
  name: string;
  address: string;
  description: string; // Used for "description"
  notes?: string;      // Used for "notes"
  field3?: string;     // New field
  hashtags?: string[];
  
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
  completedStopEvents?: Record<string, CompletedStopEvent>; // map of placeId to completion event
  startAddress?: string; // The starting address of the route
  endAddress?: string; // The ending address of the route
  notes?: string; // Crucial information about the route
  driverId?: string;
  isThirdParty?: boolean;
  thirdPartySupplier?: string; // Name of the 3PS company
  vehicleId?: string;
  distance?: number; // in kilometers
  distanceString?: string; // e.g. "10.5 km"
  duration?: string; // e.g., "1 t 23 min"
  prepTimeStart?: number; // in minutes
  prepTimeEnd?: number; // in minutes
  breakTime?: number; // in minutes
  fuelServiceTime?: number; // in minutes
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: 'admin' | 'driver' | 'contractor';
  expiresAt: FieldValue;
  organizationName?: string;
}

export interface User {
  avatarUrl?: string;
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: 'admin' | 'driver' | 'contractor';
  favorites: string[];
  visitedPlaces?: string[]; // Array of placeIds the user has completed on a route
  status?: 'active' | 'paused';
  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];
}

export interface LogEntry {
  id: string;
  orgId: string;
  userId: string;
  action: 'create_place' | 'delete_place' | 'login';
  timestamp: FieldValue | Date;
  details?: any;
}

export interface Vehicle {
  id: string;
  orgId: string;
  name: string; // e.g., "Scania R500", "Van 1"
  registrationNumber: string;
  type: 'truck' | 'van' | 'car' | 'trailer';
  fuelType?: 'diesel' | 'electric' | 'gas' | 'hybrid';
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
    trailerCoupling: boolean; // Can drag a trailer
    flatbed?: boolean; // Flakbil
    notes?: string;
    customFields?: { name: string; value: string }[];
  };
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];
  documents?: { url: string; name: string; type: 'registration' | 'insurance' | 'other'; uploadedAt?: any }[];
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
    type: 'off' | 'vacation' | 'sick' | 'custom';
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
  workLogs?: WorkLog[];

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
