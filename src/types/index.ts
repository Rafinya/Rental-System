/**
 * Weena Loft Rental Management System - Type Definitions
 */

export type UserRole = 'owner' | 'manager' | 'maintenance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  password?: string;
  updatedAt?: string;
}

export type UnitType = 'Studio' | '1-Bedroom' | '2-Bedroom' | '3-Bedroom' | 'Penthouse Loft' | 'Executive Suite';

export type OccupancyStatus = 'vacant' | 'occupied' | 'maintenance';

export interface Unit {
  id: string;
  unitNumber: string; // Unique, e.g. "101", "A01", "402"
  floor: number;      // 1, 2, 3, or 4
  type: UnitType;
  rentKes: number;    // Rent in Kenyan Shillings (KES)
  depositKes?: number;
  description?: string;
  sizeSqm?: number;
  furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
  status: OccupancyStatus;
  currentTenantId?: string | null;
  tenantId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Floor {
  floorNumber: number; // 1, 2, 3, 4
  name: string;        // e.g. "Floor 1 - Garden Level"
  description: string;
  targetUnitCount?: number;
}

export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  assignedUnitId: string | null;
  tenancyStartDate: string;
  departureDate?: string;
  
  // Optional fields as specified in rules
  email?: string;
  nationalId?: string; // Masked for privacy
  idPassportNumber?: string;
  alternativePhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  occupation?: string;
  leaseEndDate?: string;
  monthlyRentKes?: number; // Override if different from unit default
  securityDepositKes?: number;
  tenancyAgreementRef?: string;
  notes?: string;
  
  status: 'active' | 'past';
  pastTenancies?: PastTenancyRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PastTenancyRecord {
  id: string;
  unitNumber: string;
  floor: number;
  startDate: string;
  endDate: string;
  reasonForDeparture?: string;
}

export type RepairImpact = 'LOW' | 'MEDIUM' | 'HIGH';

export type RepairStatus = 
  | 'Reported' 
  | 'Acknowledged' 
  | 'In Progress' 
  | 'On Hold' 
  | 'Completed' 
  | 'Cancelled';

export type RepairCategory = 
  | 'Plumbing' 
  | 'Electrical' 
  | 'Structural' 
  | 'Doors and locks' 
  | 'Water supply' 
  | 'Painting' 
  | 'Appliances' 
  | 'Cleaning' 
  | 'Other';

export interface RepairUpdate {
  id: string;
  timestamp: string;
  author: string;
  fromStatus?: RepairStatus;
  toStatus: RepairStatus;
  note: string;
  costLoggedKes?: number;
}

export interface Repair {
  id: string;
  ticketNumber: string; // e.g. "REP-2026-001"
  title: string;
  description: string;
  floor: number;
  unitId: string;
  unitNumber: string;
  impact: RepairImpact;
  status: RepairStatus;
  category: RepairCategory;
  dateReported: string;
  dueDate?: string;
  completionDate?: string;
  
  // Optional fields
  reporterName?: string;
  reporterPhone?: string;
  assignedWorker?: string;
  estimatedCostKes?: number;
  actualCostKes?: number;
  notes?: string;
  
  updates: RepairUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: 'unit' | 'tenant' | 'repair' | 'floor' | 'settings';
  entityId: string;
  actor: string;
  details: string;
}

export interface PropertySettings {
  propertyName: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  totalFloors: number;
  floorsCount?: number;
  unitTypes: string[];
  repairCategories: string[];
  bankDetails?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  linkTo?: {
    tab: string;
    id?: string;
  };
}
