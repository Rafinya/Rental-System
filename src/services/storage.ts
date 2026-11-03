/**
 * Weena Loft Apartment - Clean Data Persistence & Storage Service
 * Starts 100% empty so the property owner can input all actual units,
 * tenants, and repairs manually. Single property: Weena Loft Apartment.
 */

import {
  Floor,
  Unit,
  Tenant,
  Repair,
  AuditLog,
  PropertySettings,
  User,
  UserRole,
  AppNotification
} from '../types';

// Storage keys version 2 (ensures clean slate with no dummy/seeded data)
const STORAGE_KEYS = {
  FLOORS: 'weena_loft_v2_floors',
  UNITS: 'weena_loft_v2_units',
  TENANTS: 'weena_loft_v2_tenants',
  REPAIRS: 'weena_loft_v2_repairs',
  AUDIT_LOGS: 'weena_loft_v2_audit_logs',
  SETTINGS: 'weena_loft_v2_settings',
  CURRENT_USER: 'weena_loft_v2_user',
  USERS: 'weena_loft_v2_users_list',
  NOTIFICATIONS: 'weena_loft_v2_notifications',
};

// Exactly four initial floors for Weena Loft Apartment
const INITIAL_FLOORS: Floor[] = [
  {
    floorNumber: 1,
    name: 'Floor 1',
    description: 'Ground floor residential tier.',
    targetUnitCount: 0,
  },
  {
    floorNumber: 2,
    name: 'Floor 2',
    description: 'Second floor residential tier.',
    targetUnitCount: 0,
  },
  {
    floorNumber: 3,
    name: 'Floor 3',
    description: 'Third floor residential tier.',
    targetUnitCount: 0,
  },
  {
    floorNumber: 4,
    name: 'Floor 4',
    description: 'Fourth floor penthouse & loft tier.',
    targetUnitCount: 0,
  },
];

// 100% EMPTY DATA: The user inputs all data themselves!
const INITIAL_UNITS: Unit[] = [];
const INITIAL_TENANTS: Tenant[] = [];
const INITIAL_REPAIRS: Repair[] = [];
const INITIAL_AUDIT_LOGS: AuditLog[] = [];
const INITIAL_NOTIFICATIONS: AppNotification[] = [];

const INITIAL_SETTINGS: PropertySettings = {
  propertyName: 'Weena Loft Accommodations',
  address: 'Kilimani Crest Boulevard, Nairobi, Kenya',
  contactEmail: 'ralphokono@gmail.com',
  contactPhone: '+254 700 000 000',
  currency: 'KES',
  totalFloors: 4,
  unitTypes: [
    'Studio',
    'Bedsitter',
    'One-bedroom',
    'Two-bedroom',
    'Three-bedroom',
    'Penthouse Loft',
  ],
  repairCategories: [
    'Plumbing',
    'Electrical',
    'Structural',
    'Doors and locks',
    'Water supply',
    'Painting',
    'Appliances',
    'Cleaning',
    'Other',
  ],
  bankDetails: 'M-Pesa Paybill / Bank Account details for rent collection',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-owner-01',
    name: 'Ralph Okono',
    email: 'ralphokono@gmail.com',
    phone: '+254 700 123 456',
    role: 'owner',
    avatar: 'RO',
    password: 'password123',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr-manager-01',
    name: 'Property Manager',
    email: 'manager@weenaloft.co.ke',
    phone: '+254 700 654 321',
    role: 'manager',
    avatar: 'PM',
    password: 'password123',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr-maintenance-01',
    name: 'Maintenance Staff',
    email: 'maintenance@weenaloft.co.ke',
    phone: '+254 700 987 654',
    role: 'maintenance',
    avatar: 'MS',
    password: 'password123',
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_USER: User = INITIAL_USERS[0];

class StorageService {
  private memoryFallback: Record<string, any> = {};

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch {
      return this.memoryFallback[key] !== undefined ? this.memoryFallback[key] : defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore
    }
    this.memoryFallback[key] = value;
  }

  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEYS.FLOORS)) {
      this.setItem(STORAGE_KEYS.FLOORS, INITIAL_FLOORS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.UNITS)) {
      this.setItem(STORAGE_KEYS.UNITS, INITIAL_UNITS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
      this.setItem(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPAIRS)) {
      this.setItem(STORAGE_KEYS.REPAIRS, INITIAL_REPAIRS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, DEFAULT_USER);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
  }

  // ===================== FLOORS =====================
  public getFloors(): Floor[] {
    return this.getItem<Floor[]>(STORAGE_KEYS.FLOORS, INITIAL_FLOORS);
  }

  public updateFloor(floorNumber: number, updates: Partial<Floor>): Floor {
    const floors = this.getFloors();
    const idx = floors.findIndex((f) => f.floorNumber === floorNumber);
    if (idx === -1) throw new Error(`Floor ${floorNumber} not found.`);

    floors[idx] = { ...floors[idx], ...updates };
    this.setItem(STORAGE_KEYS.FLOORS, floors);

    this.addAuditLog({
      action: 'FLOOR_UPDATED',
      entityType: 'floor',
      entityId: String(floorNumber),
      details: `Updated label for Floor ${floorNumber} (${floors[idx].name}).`,
    });

    return floors[idx];
  }

  // ===================== UNITS =====================
  public getUnits(): Unit[] {
    return this.getItem<Unit[]>(STORAGE_KEYS.UNITS, INITIAL_UNITS);
  }

  public getUnitById(id: string): Unit | undefined {
    return this.getUnits().find((u) => u.id === id);
  }

  public createUnit(unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Unit {
    const units = this.getUnits();
    const normalizedUnitNumber = unitData.unitNumber.trim();

    // Check duplicate
    const exists = units.some(
      (u) => u.unitNumber.toLowerCase() === normalizedUnitNumber.toLowerCase()
    );
    if (exists) {
      throw new Error(`Unit number "${normalizedUnitNumber}" already exists in Weena Loft Apartment.`);
    }

    if (unitData.floor < 1 || unitData.floor > 4) {
      throw new Error(`Floor must be between 1 and 4.`);
    }

    const newUnit: Unit = {
      ...unitData,
      id: `unit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      unitNumber: normalizedUnitNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    units.push(newUnit);
    this.setItem(STORAGE_KEYS.UNITS, units);

    this.addAuditLog({
      action: 'UNIT_CREATED',
      entityType: 'unit',
      entityId: newUnit.id,
      details: `Created Unit ${newUnit.unitNumber} on Floor ${newUnit.floor} (${newUnit.type}, KES ${newUnit.rentKes.toLocaleString()}).`,
    });

    return newUnit;
  }

  public updateUnit(id: string, updates: Partial<Unit>): Unit {
    const units = this.getUnits();
    const idx = units.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Unit not found');

    if (updates.unitNumber && updates.unitNumber.trim().toLowerCase() !== units[idx].unitNumber.toLowerCase()) {
      const normalized = updates.unitNumber.trim().toLowerCase();
      const duplicate = units.some(
        (u) => u.id !== id && u.unitNumber.trim().toLowerCase() === normalized
      );
      if (duplicate) {
        throw new Error(`Unit number "${updates.unitNumber}" is already in use.`);
      }
    }

    units[idx] = {
      ...units[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.UNITS, units);

    this.addAuditLog({
      action: 'UNIT_UPDATED',
      entityType: 'unit',
      entityId: id,
      details: `Updated details for Unit ${units[idx].unitNumber}.`,
    });

    return units[idx];
  }

  public deleteUnit(id: string): void {
    const units = this.getUnits();
    const unit = units.find((u) => u.id === id);
    if (!unit) throw new Error('Unit not found');

    if (unit.status === 'occupied' || unit.currentTenantId) {
      throw new Error(`Cannot delete Unit ${unit.unitNumber} while a tenant is currently assigned.`);
    }

    const openRepairs = this.getRepairs().filter(
      (r) => r.unitId === id && !['Completed', 'Cancelled'].includes(r.status)
    );
    if (openRepairs.length > 0) {
      throw new Error(`Cannot delete Unit ${unit.unitNumber} while it has ${openRepairs.length} active repair ticket(s).`);
    }

    const filtered = units.filter((u) => u.id !== id);
    this.setItem(STORAGE_KEYS.UNITS, filtered);

    this.addAuditLog({
      action: 'UNIT_DELETED',
      entityType: 'unit',
      entityId: id,
      details: `Removed Unit ${unit.unitNumber} from Floor ${unit.floor}.`,
    });
  }

  // ===================== TENANTS =====================
  public getTenants(): Tenant[] {
    return this.getItem<Tenant[]>(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
  }

  public getTenantById(id: string): Tenant | undefined {
    return this.getTenants().find((t) => t.id === id);
  }

  public createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'pastTenancies'>): Tenant {
    if (!tenantData.fullName || !tenantData.fullName.trim()) {
      throw new Error('Tenant full name is required.');
    }
    if (!tenantData.phone || !tenantData.phone.trim()) {
      throw new Error('Tenant phone number is required.');
    }
    if (!tenantData.tenancyStartDate) {
      throw new Error('Tenancy start date is required.');
    }

    // Email validation ONLY if email was provided
    if (tenantData.email && tenantData.email.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(tenantData.email.trim())) {
        throw new Error('Invalid email address format.');
      }
    }

    const tenants = this.getTenants();
    const newTenant: Tenant = {
      ...tenantData,
      id: `tenant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pastTenancies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newTenant.assignedUnitId) {
      const units = this.getUnits();
      const unit = units.find((u) => u.id === newTenant.assignedUnitId);
      if (!unit) throw new Error('Assigned unit does not exist.');

      if (unit.status === 'occupied' && unit.currentTenantId) {
        throw new Error(`Unit ${unit.unitNumber} is already occupied.`);
      }

      this.updateUnit(unit.id, {
        status: 'occupied',
        currentTenantId: newTenant.id,
      });
    }

    tenants.push(newTenant);
    this.setItem(STORAGE_KEYS.TENANTS, tenants);

    this.addAuditLog({
      action: 'TENANT_REGISTERED',
      entityType: 'tenant',
      entityId: newTenant.id,
      details: `Registered tenant ${newTenant.fullName}.`,
    });

    return newTenant;
  }

  public updateTenant(id: string, updates: Partial<Tenant>): Tenant {
    const tenants = this.getTenants();
    const idx = tenants.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Tenant not found');

    if (updates.email && updates.email.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(updates.email.trim())) {
        throw new Error('Invalid email address format.');
      }
    }

    const currentAssignedUnit = tenants[idx].assignedUnitId;
    const newAssignedUnit = updates.assignedUnitId;

    if (newAssignedUnit !== undefined && newAssignedUnit !== currentAssignedUnit) {
      if (currentAssignedUnit) {
        this.updateUnit(currentAssignedUnit, {
          status: 'vacant',
          currentTenantId: null,
        });
      }
      if (newAssignedUnit) {
        const targetUnit = this.getUnitById(newAssignedUnit);
        if (!targetUnit) throw new Error('Target unit not found.');
        if (targetUnit.status === 'occupied' && targetUnit.currentTenantId !== id) {
          throw new Error(`Unit ${targetUnit.unitNumber} is already occupied.`);
        }
        this.updateUnit(newAssignedUnit, {
          status: 'occupied',
          currentTenantId: id,
        });
      }
    }

    tenants[idx] = {
      ...tenants[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.TENANTS, tenants);

    this.addAuditLog({
      action: 'TENANT_UPDATED',
      entityType: 'tenant',
      entityId: id,
      details: `Updated record for ${tenants[idx].fullName}.`,
    });

    return tenants[idx];
  }

  public endTenancy(
    tenantId: string,
    reason: string = 'Tenancy ended',
    departureDate: string = new Date().toISOString().split('T')[0]
  ): Tenant {
    const tenants = this.getTenants();
    const idx = tenants.findIndex((t) => t.id === tenantId);
    if (idx === -1) throw new Error('Tenant not found');

    const tenant = tenants[idx];
    const unitId = tenant.assignedUnitId;

    let pastRecord: any = null;
    if (unitId) {
      const unit = this.getUnitById(unitId);
      if (unit) {
        pastRecord = {
          id: `pt-${Date.now()}`,
          unitNumber: unit.unitNumber,
          floor: unit.floor,
          startDate: tenant.tenancyStartDate,
          endDate: departureDate,
          reasonForDeparture: reason,
        };
        this.updateUnit(unitId, {
          status: 'vacant',
          currentTenantId: null,
        });
      }
    }

    const updatedPastTenancies = [
      ...(tenant.pastTenancies || []),
      ...(pastRecord ? [pastRecord] : []),
    ];

    tenants[idx] = {
      ...tenant,
      status: 'past',
      assignedUnitId: null,
      pastTenancies: updatedPastTenancies,
      updatedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.TENANTS, tenants);

    this.addAuditLog({
      action: 'TENANCY_ENDED',
      entityType: 'tenant',
      entityId: tenantId,
      details: `Recorded departure for ${tenant.fullName}. Unit vacated.`,
    });

    return tenants[idx];
  }

  // ===================== REPAIRS & MAINTENANCE =====================
  public getRepairs(): Repair[] {
    return this.getItem<Repair[]>(STORAGE_KEYS.REPAIRS, INITIAL_REPAIRS);
  }

  public getRepairById(id: string): Repair | undefined {
    return this.getRepairs().find((r) => r.id === id);
  }

  public createRepair(repairData: {
    title: string;
    description: string;
    floor: number;
    unitId: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    category: any;
    dateReported: string;
    reporterName?: string;
    reporterPhone?: string;
    assignedWorker?: string;
    estimatedCostKes?: number;
    notes?: string;
    dueDate?: string;
  }): Repair {
    const repairs = this.getRepairs();
    const unit = this.getUnitById(repairData.unitId);
    if (!unit) throw new Error('Associated unit not found.');

    const count = repairs.length + 1;
    const ticketNumber = `REP-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const newRepair: Repair = {
      ...repairData,
      id: `rep-${Date.now()}`,
      ticketNumber,
      unitNumber: unit.unitNumber,
      floor: unit.floor,
      status: 'Reported',
      updates: [
        {
          id: `upd-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: this.getCurrentUser().name,
          toStatus: 'Reported',
          note: 'Maintenance ticket logged.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (repairData.impact === 'HIGH' && unit.status === 'vacant') {
      this.updateUnit(unit.id, { status: 'maintenance' });
    }

    repairs.unshift(newRepair);
    this.setItem(STORAGE_KEYS.REPAIRS, repairs);

    if (repairData.impact === 'HIGH') {
      this.addNotification({
        title: `HIGH IMPACT: Unit ${unit.unitNumber}`,
        message: `${newRepair.title} reported on Floor ${unit.floor}.`,
        type: 'urgent',
        linkTo: { tab: 'repairs', id: newRepair.id },
      });
    }

    this.addAuditLog({
      action: 'REPAIR_CREATED',
      entityType: 'repair',
      entityId: newRepair.id,
      details: `Logged ticket ${ticketNumber}: "${newRepair.title}" [Impact: ${newRepair.impact}].`,
    });

    return newRepair;
  }

  public updateRepairStatus(
    id: string,
    toStatus: any,
    note: string,
    actualCostKes?: number,
    assignedWorker?: string
  ): Repair {
    const repairs = this.getRepairs();
    const idx = repairs.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Repair not found');

    const repair = repairs[idx];
    const fromStatus = repair.status;

    const updateRecord = {
      id: `upd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: this.getCurrentUser().name,
      fromStatus,
      toStatus,
      note: note || `Status changed from ${fromStatus} to ${toStatus}.`,
      costLoggedKes: actualCostKes,
    };

    const isCompleted = toStatus === 'Completed';

    repairs[idx] = {
      ...repair,
      status: toStatus,
      ...(assignedWorker ? { assignedWorker } : {}),
      ...(actualCostKes !== undefined ? { actualCostKes } : {}),
      ...(isCompleted ? { completionDate: new Date().toISOString().split('T')[0] } : {}),
      updates: [...repair.updates, updateRecord],
      updatedAt: new Date().toISOString(),
    };

    if (isCompleted) {
      const unit = this.getUnitById(repair.unitId);
      if (unit && unit.status === 'maintenance') {
        const remainingHigh = repairs.filter(
          (r) => r.unitId === unit.id && r.id !== id && r.impact === 'HIGH' && r.status !== 'Completed'
        );
        if (remainingHigh.length === 0) {
          this.updateUnit(unit.id, { status: 'vacant' });
        }
      }
    }

    this.setItem(STORAGE_KEYS.REPAIRS, repairs);

    this.addAuditLog({
      action: 'REPAIR_STATUS_CHANGE',
      entityType: 'repair',
      entityId: id,
      details: `Ticket ${repair.ticketNumber} moved to ${toStatus}.`,
    });

    return repairs[idx];
  }

  public updateRepair(id: string, updates: Partial<Repair>): Repair {
    const repairs = this.getRepairs();
    const idx = repairs.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Repair not found');

    repairs[idx] = {
      ...repairs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.REPAIRS, repairs);

    this.addAuditLog({
      action: 'REPAIR_EDITED',
      entityType: 'repair',
      entityId: id,
      details: `Edited ticket ${repairs[idx].ticketNumber}.`,
    });

    return repairs[idx];
  }

  // ===================== AUDIT LOGS =====================
  public getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp' | 'actor'> & { actor?: string }): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      actor: entry.actor || this.getCurrentUser().name,
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // ===================== SETTINGS =====================
  public getSettings(): PropertySettings {
    return this.getItem<PropertySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public updateSettings(updates: Partial<PropertySettings>): PropertySettings {
    const settings = { ...this.getSettings(), ...updates };
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
    this.addAuditLog({
      action: 'SETTINGS_UPDATED',
      entityType: 'settings',
      entityId: 'global',
      details: 'Updated property configuration.',
    });
    return settings;
  }

  // ===================== USER & AUTH =====================
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): User {
    const user = this.getItem<User>(STORAGE_KEYS.CURRENT_USER, DEFAULT_USER);
    // sync with latest in users list if exists
    const allUsers = this.getUsers();
    const matchedById = allUsers.find((u) => u.id === user.id);
    if (matchedById) return matchedById;
    // Legacy fallback for sessions stored before account ids were stable
    const matchedByRole = allUsers.find((u) => u.role === user.role);
    return matchedByRole || user;
  }

  public setCurrentUser(user: User): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  private buildInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private isValidRole(role: string): role is UserRole {
    return role === 'owner' || role === 'manager' || role === 'maintenance';
  }

  public createUser(input: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    password?: string;
  }): { success: boolean; user?: User; message: string } {
    const users = this.getUsers();
    const name = input.name.trim();
    const email = input.email.trim();

    if (!name) {
      return { success: false, message: 'Full name is required.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, message: 'A valid email address is required.' };
    }
    if (!this.isValidRole(input.role)) {
      return { success: false, message: 'Please choose a valid user role.' };
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with that email address already exists.' };
    }
    if (input.password && input.password.trim().length > 0 && input.password.trim().length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const newUser: User = {
      id: `usr-${input.role}-${Date.now()}`,
      name,
      email,
      phone: input.phone?.trim() || undefined,
      role: input.role,
      avatar: this.buildInitials(name),
      password: input.password?.trim() || 'password123',
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);

    this.addAuditLog({
      action: 'USER_CREATED',
      entityType: 'settings',
      entityId: newUser.id,
      details: `Created ${newUser.role} account for ${newUser.name} (${newUser.email}).`,
    });

    return { success: true, user: newUser, message: 'User account created successfully.' };
  }

  public updateUser(
    userId: string,
    updates: {
      name?: string;
      email?: string;
      phone?: string;
      role?: UserRole;
      password?: string;
      avatar?: string;
    }
  ): { success: boolean; user?: User; message: string } {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, message: 'User account not found.' };
    }

    const existing = users[index];
    const name = updates.name !== undefined ? updates.name.trim() : existing.name;
    const email = updates.email !== undefined ? updates.email.trim() : existing.email;

    if (!name) {
      return { success: false, message: 'Full name is required.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, message: 'A valid email address is required.' };
    }
    if (
      users.some(
        (u, idx) => idx !== index && u.email.toLowerCase() === email.toLowerCase()
      )
    ) {
      return { success: false, message: 'Another account already uses that email address.' };
    }
    if (updates.role && !this.isValidRole(updates.role)) {
      return { success: false, message: 'Please choose a valid user role.' };
    }
    if (updates.password && updates.password.trim().length > 0 && updates.password.trim().length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // Protect the system from losing its last owner account.
    if (existing.role === 'owner' && updates.role && updates.role !== 'owner') {
      const ownerCount = users.filter((u) => u.role === 'owner').length;
      if (ownerCount <= 1) {
        return { success: false, message: 'At least one owner account must remain.' };
      }
    }

    const updatedUser: User = {
      ...existing,
      name,
      email,
      ...(updates.phone !== undefined ? { phone: updates.phone.trim() || undefined } : {}),
      ...(updates.role ? { role: updates.role } : {}),
      ...(updates.password && updates.password.trim() ? { password: updates.password.trim() } : {}),
      ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
      updatedAt: new Date().toISOString(),
    };

    if (updates.name !== undefined && !updates.avatar) {
      updatedUser.avatar = this.buildInitials(updatedUser.name);
    }

    users[index] = updatedUser;
    this.setItem(STORAGE_KEYS.USERS, users);

    const current = this.getCurrentUser();
    if (current.id === userId) {
      this.setCurrentUser(updatedUser);
    }

    this.addAuditLog({
      action: 'USER_UPDATED',
      entityType: 'settings',
      entityId: userId,
      details: `Updated ${updatedUser.role} account for ${updatedUser.name} (${updatedUser.email}).`,
    });

    return { success: true, user: updatedUser, message: 'User account updated successfully.' };
  }

  public deleteUser(userId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, message: 'User account not found.' };
    }

    const target = users[index];
    const current = this.getCurrentUser();

    if (current.id === userId) {
      return { success: false, message: 'You cannot delete your own account while signed in.' };
    }
    if (target.role === 'owner' && users.filter((u) => u.role === 'owner').length <= 1) {
      return { success: false, message: 'At least one owner account must remain.' };
    }

    users.splice(index, 1);
    this.setItem(STORAGE_KEYS.USERS, users);

    this.addAuditLog({
      action: 'USER_DELETED',
      entityType: 'settings',
      entityId: userId,
      details: `Deleted ${target.role} account for ${target.name} (${target.email}).`,
    });

    return { success: true, message: 'User account deleted.' };
  }

  public updateUserProfile(
    userId: string,
    updates: { name?: string; email?: string; phone?: string; avatar?: string }
  ): { success: boolean; user?: User; message: string } {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, message: 'User account not found.' };
    }

    const updatedUser: User = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.name && (!updates.avatar || updates.avatar.trim() === '')) {
      updatedUser.avatar = updates.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    }

    users[index] = updatedUser;
    this.setItem(STORAGE_KEYS.USERS, users);

    // If updating current user, sync current user
    const current = this.getCurrentUser();
    if (current.id === userId) {
      this.setCurrentUser(updatedUser);
    }

    this.addAuditLog({
      action: 'USER_PROFILE_UPDATED',
      entityType: 'settings',
      entityId: userId,
      details: `${updatedUser.name} (${updatedUser.role}) updated their profile details.`,
    });

    return { success: true, user: updatedUser, message: 'Profile details updated successfully.' };
  }

  public changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) {
      return { success: false, message: 'User account not found.' };
    }

    const user = users[index];
    // Check current password (default fallback 'password123')
    const existingPassword = user.password || 'password123';
    if (currentPassword !== existingPassword) {
      return { success: false, message: 'Current password does not match.' };
    }

    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    users[index] = user;
    this.setItem(STORAGE_KEYS.USERS, users);

    // Sync current user
    const current = this.getCurrentUser();
    if (current.id === userId) {
      this.setCurrentUser(user);
    }

    this.addAuditLog({
      action: 'USER_PASSWORD_CHANGED',
      entityType: 'settings',
      entityId: userId,
      details: `${user.name} (${user.role}) changed their security password.`,
    });

    this.addNotification({
      type: 'success',
      title: 'Security Password Changed',
      message: `Your password was successfully updated for account ${user.email}.`,
    });

    return { success: true, message: 'Password has been updated successfully.' };
  }

  // ===================== NOTIFICATIONS =====================
  public getNotifications(): AppNotification[] {
    return this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const list = this.getNotifications();
    const item: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(item);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 20));
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  public markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // ===================== AGGREGATIONS & METRICS =====================
  public getSummaryMetrics() {
    const units = this.getUnits();
    const tenants = this.getTenants().filter((t) => t.status === 'active');
    const repairs = this.getRepairs();

    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
    const vacantUnits = units.filter((u) => u.status === 'vacant').length;
    const maintenanceUnits = units.filter((u) => u.status === 'maintenance').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const openRepairs = repairs.filter((r) => !['Completed', 'Cancelled'].includes(r.status));
    const highImpactRepairs = openRepairs.filter((r) => r.impact === 'HIGH');
    const completedRepairs = repairs.filter((r) => r.status === 'Completed').length;

    const totalPotentialRentKes = units.reduce((acc, u) => acc + (u.rentKes || 0), 0);
    const collectedRentRollKes = units
      .filter((u) => u.status === 'occupied')
      .reduce((acc, u) => acc + (u.rentKes || 0), 0);

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      occupancyRate,
      activeTenantsCount: tenants.length,
      openRepairsCount: openRepairs.length,
      highImpactRepairsCount: highImpactRepairs.length,
      completedRepairsCount: completedRepairs,
      totalPotentialRentKes,
      collectedRentRollKes,
    };
  }

  // ===================== BACKUP & RESTORE =====================
  public exportDataJSON(): string {
    const data = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      floors: this.getFloors(),
      units: this.getUnits(),
      tenants: this.getTenants(),
      repairs: this.getRepairs(),
      auditLogs: this.getAuditLogs(),
      settings: this.getSettings(),
      users: this.getUsers(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importDataJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.units && Array.isArray(data.units)) {
        this.setItem(STORAGE_KEYS.UNITS, data.units);
      }
      if (data.floors && Array.isArray(data.floors)) {
        this.setItem(STORAGE_KEYS.FLOORS, data.floors);
      }
      if (data.tenants && Array.isArray(data.tenants)) {
        this.setItem(STORAGE_KEYS.TENANTS, data.tenants);
      }
      if (data.repairs && Array.isArray(data.repairs)) {
        this.setItem(STORAGE_KEYS.REPAIRS, data.repairs);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      }
      if (data.users && Array.isArray(data.users)) {
        this.setItem(STORAGE_KEYS.USERS, data.users);
      }
      this.addAuditLog({
        action: 'DATA_RESTORED',
        entityType: 'settings',
        entityId: 'global',
        details: 'System restored from JSON backup file.',
      });
      return true;
    } catch {
      return false;
    }
  }

  public clearAllData(): void {
    this.setItem(STORAGE_KEYS.UNITS, []);
    this.setItem(STORAGE_KEYS.TENANTS, []);
    this.setItem(STORAGE_KEYS.REPAIRS, []);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, []);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  public resetToFactoryDemo(): void {
    this.setItem(STORAGE_KEYS.FLOORS, INITIAL_FLOORS);
    this.setItem(STORAGE_KEYS.UNITS, []);
    this.setItem(STORAGE_KEYS.TENANTS, []);
    this.setItem(STORAGE_KEYS.REPAIRS, []);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, []);
    this.setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, []);
    this.setItem(STORAGE_KEYS.CURRENT_USER, DEFAULT_USER);
  }
}

export const storage = new StorageService();
