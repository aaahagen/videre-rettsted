import { FieldValue } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'super_admin' | 'owner' | 'admin' | 'hms_responsible' | 'salesman' | 'driver' | 'contractor' | 'loader' | 'planner';
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
  plan?: 'free' | 'pro' | 'enterprise';
  trialExpiresAt?: any; // Firestore Timestamp or Date
  modules?: {
    places?: boolean;
    learning?: boolean;
    messages?: boolean;
    fleet?: boolean;
    workforce?: boolean;
    logistics?: boolean;
    analytics?: boolean;
    hms?: boolean;
    danger_reports?: boolean;
  };
  mainDepot?: {
    address: string;
    coordinates: { lat: number, lng: number };
    radius: number; // in meters
  };
  labelSettings?: {
    format: 'barcode' | 'qrcode';
    includeBranding?: boolean;
    size?: 'small' | 'standard' | 'large';
  };
  placeSettings?: {
    autoGenerateCustomerNumbers?: boolean;
    customerNumberPrefix?: string;
    nextCustomerNumber?: number;
  };
  hmsSettings?: {
    enabled: boolean;
    title?: string;
    questions: { id: string; text: string; type?: 'question' | 'heading' }[];
    requireComment?: boolean;
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
    field4?: {
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
    salesMessage?: {
      label: string;
      placeholder: string;
      enabled?: boolean;
    };
  };
  dangerReportsEnabled?: boolean;
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
  customerNumber?: string;
  description: string;
  notes?: string;
  field3?: string;
  field4?: string;
  doorCode?: { category?: string; name?: string; value?: string; }[];
  contactPersons?: { name: string; phone: string; email: string; }[];
  hashtags?: string[];
  
  // Sales specific fields
  salesMessage?: string;
  salesMessageValidUntil?: any;

  // Custom HMS Answers
  hmsData?: {
    answers: Record<string, boolean>;
    comment?: string;
    completedBy?: string;
    completedByName?: string;
    completedAt?: any;
  };

  // Zone constraints
  isZeroEmissionZone?: boolean;
  isCityCenter?: boolean;

  // Physical limitations for vehicles at this location
  maxVehicleHeight?: number;
  maxVehicleWidth?: number;
  maxVehicleLength?: number;
  maxVehicleWeight?: number;

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
  estimatedDeliveryTime?: number;
  
  // Images
  imageUrl?: string;
  imageHint?: string;
  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];

  // Location
  coordinates?: {
    lat: number;
    lng: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };

  // Meta
  orgId: string;
  organizationId?: string;
  
  authorId?: string;
  authorName?: string;
  createdBy: string;
  updatedBy?: string;
  updatedByName?: string;
  
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
    trailerId?: string;
    trailerName?: string;
    driverId?: string;
    orders: Order[];
    places: Place[];
    estimatedDuration: number;
    estimatedDistance: number;
    warnings: string[]; 
    errors: string[];   
}

export interface Route {
  id: string;
  name: string;
  status?: 'active' | 'completed' | 'template';
  shipmentNumber?: string;
  orgId: string;
  organizationId?: string;
  places: string[];
  completedStops?: string[];
  completedStopEvents?: Record<string, CompletedStopEvent & { pod?: ProofOfDelivery }>;
  startAddress?: string;
  endAddress?: string;
  notes?: string;
  driverId?: string;
  driverName?: string;
  isThirdParty?: boolean;
  thirdPartySupplier?: string;
  vehicleId?: string;
  trailerId?: string;
  distance?: number;
  distanceString?: string;
  duration?: string;
  prepTimeStart?: number;
  prepTimeEnd?: number;
  breakTime?: number;
  fuelServiceTime?: number;
  date?: string;
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
}

export interface Invitation {
  id: string;
  email: string;
  name?: string;
  orgId: string;
  orgName?: string;
  organizationId?: string;
  role: 'super_admin' | 'owner' | 'admin' | 'hms_responsible' | 'salesman' | 'driver' | 'contractor' | 'loader' | 'planner';
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: FieldValue;
  organizationName?: string;
  acceptedAt?: FieldValue;
  acceptedBy?: string;
}

export interface User {
  avatarUrl?: string;
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: 'super_admin' | 'owner' | 'admin' | 'hms_responsible' | 'salesman' | 'driver' | 'contractor' | 'loader' | 'planner';
  favorites: string[];
  visitedPlaces?: string[];
  status?: 'active' | 'paused';
  disabled?: boolean;
  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];
  
  // Compliance
  lastTachoDownloadDate?: string;
}

export interface LogEntry {
  id: string;
  orgId: string;
  userId: string;
  action: 'create_place' | 'delete_place' | 'login' | 'admin_view_worklog' | 'export_hr_data' | 'view_sensitive_personnel_data' | 'update_hms_checklist';
  timestamp: FieldValue | Date;
  details?: any;
}

export interface Vehicle {
  id: string;
  orgId: string;
  name: string;
  registrationNumber: string;
  type: 'truck' | 'van' | 'car' | 'trailer' | 'tractor';
  config?: 'rigid' | 'tractor' | 'drawbar' | 'semi' | 'box_swap' | 'fixed_box';
  fuelType?: 'diesel' | 'electric' | 'gas' | 'hybrid';
  maxRange?: number;
  dimensions?: {
    length?: number;
    height?: number;
    width?: number;
  };
  capacity: {
    weight?: number;
    emptyWeight?: number;
    volume?: number;
    pallets?: number;
    notes?: string;
  };
  capabilities: {
    refrigeration: boolean;
    tailLift: boolean;
    adr: boolean;
    trailerCoupling: boolean;
    fifthWheel?: boolean;
    flatbed?: boolean;
    notes?: string;
    customFields?: { name: string; value: string }[];
  };
  
  // Compliance & Deadlines
  euControl?: string;
  nextService?: string;
  tachographCalibration?: string;
  lastTachoDownloadDate?: string;

  // Odometer tracking
  lastOdometerReading?: number;
  lastOdometerDate?: any;

  status: 'active' | 'maintenance' | 'inactive';
  currentStatuses: ("ready" | "pending_workshop" | "workshop" | "observation" | "on_tour" | "parked")[];
  createdAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
  images?: { url: string; description?: string; isMain?: boolean; uploadedAt?: any }[];
  documents?: { url: string; name: string; type: 'registration' | 'insurance' | 'other' | 'workshop_order' | 'workshop_receipt'; uploadedAt?: any }[];
}

export interface Contract {
  id: string;
  startDate: string;
  endDate?: string;
  contractedHours: number;
  role: string;
  salary?: number;
}

export interface WorkLog {
  id: string;
  orgId: string;
  driverId: string;
  
  // Planned Schedule
  plannedStart?: string;
  plannedEnd?: string;
  
  // Actual Punches
  actualPunchIn?: string;
  actualPunchOut?: string;
  
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
    start: string;
    end: string;
  };
  rotation?: {
    startDate: string;
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
  certifications?: string[];
  skills?: string[];
  documents?: { url: string; name: string; type: string; uploadedAt?: any }[];
  
  // New HR/Workforce fields
  address?: string;
  phone?: string;
  emergencyContact?: string;
  nextOfKin?: string;
  children?: string;
  adminNotes?: string;
  seniorityDate?: string;
  contracts?: Contract[];

  // Personal Identification
  dateOfBirth?: string;
  socialSecurityNumber?: string;
  gender?: string;

  // Employment & Status
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  supervisor?: string;
  employmentStatus?: string;
  probationEndDate?: string;

  // Compensation & Benefits
  hourlyRate?: number;
  bankAccountNumber?: string;
  taxCode?: string;

  // Compliance & Records
  staffHandbookAcknowledged?: boolean;
  backgroundCheckDate?: string;
}

export interface Message {
  id: string;
  orgId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: FieldValue | Date;
  readBy: string[];
  type: 'direct' | 'broadcast';
}

// --- PHASE 3: END-TO-END VERIFICATION MODELS ---

export interface ProofOfDelivery {
  timestamp: string | Date | any;
  coordinates?: { lat: number; lng: number; accuracy?: number };
  status: 'successful' | 'partially_successful' | 'failed_attempt';
  deliveryMethod?: 'handed_to_recipient' | 'left_at_door' | 'left_in_safe_place' | 'mailroom_reception' | 'neighbor';
  signatureUrl?: string;
  signatureName?: string;
  recipientPhone?: string;
  photos?: { 
    url: string; 
    description?: string; 
    type?: 'package_in_situ' | 'damage_proof' | 'door_number' | 'general';
    uploadedAt?: any;
  }[];
  scannedBarcodes?: string[];
  failureReason?: 'recipient_unavailable' | 'address_not_found' | 'access_denied' | 'package_damaged_refused' | 'other';
  damageReported?: boolean;
  damageDetails?: string;
  notes?: string; 
}


export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  weightPerItem?: number;
  length?: number;
  width?: number;
  height?: number;
  type?: 'keg' | 'case' | 'box' | 'other';
}

export interface Collie {
  id: string;
  lineItemId: string;
  handlingUnitId?: string;
  status: 'pending' | 'loaded' | 'delivered' | 'failed';
}

export interface HandlingUnit {
  id: string;
  type: 'eur-pallet' | 'half-pallet' | 'custom';
  status: 'pending' | 'loaded' | 'delivered' | 'failed';
}

export interface Order {
  id: string;
  orgId: string;
  routeId?: string;
  placeId: string;
  status: 'pending' | 'loaded' | 'delivered' | 'failed';
  barcode: string;
  details: {
    description: string;
    weight?: number;
    volume?: number;
    form?: 'pallet' | 'package' | 'liquid' | 'other';
    numberOfItems?: number;
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
    createdBy: string;
    userName?: string;
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
    totalItems: number;
    loadedItems: number;
    scannedCollieIds?: string[];
    loadedAt?: string | Date | FieldValue;
    loadedBy?: string;
  }[];
  notes?: ManifestNote[];
  verifiedAt?: string | Date | FieldValue;
  verifiedBy?: string;
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
  isCertification?: boolean;
  validityMonths?: number;
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
  progress?: number;
  assignedAt: FieldValue | Date;
  updatedAt: FieldValue | Date;
  completedAt?: FieldValue | Date;
  expiresAt?: FieldValue | Date;
}

export interface DangerReport {
  id: string;
  orgId: string;
  placeId: string;
  placeName: string;
  reportedBy: string;
  reportedByName: string;
  description: string;
  images?: string[];
  status: 'open' | 'resolved';
  createdAt: FieldValue | Date;
  resolvedAt?: FieldValue | Date;
  resolvedBy?: string;
  resolutionNote?: string;
  resolutionImages?: string[];
}
