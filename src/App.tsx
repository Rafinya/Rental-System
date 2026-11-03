/**
 * Weena Loft Apartment — Rental Management System
 * Caramel White Master Application Shell & Controller
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  DoorOpen, 
  Users, 
  Wrench, 
  FileText, 
  LayoutDashboard,
  UserCog
} from 'lucide-react';
import { storage } from './services/storage';
import { 
  Unit, 
  Tenant, 
  Repair, 
  Floor, 
  AuditLog, 
  PropertySettings, 
  User, 
  UserRole,
  AppNotification
} from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/dashboard/OverviewView';
import { BuildingExplorerView } from './components/building/BuildingExplorerView';
import { FloorsView } from './components/floors/FloorsView';
import { UnitsView } from './components/units/UnitsView';
import { TenantsView } from './components/tenants/TenantsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { UsersView } from './components/users/UsersView';
import { AddUnitModal } from './components/units/AddUnitModal';
import { AddTenantModal } from './components/tenants/AddTenantModal';
import { NewRepairModal } from './components/maintenance/NewRepairModal';
import { LoginView } from './components/auth/LoginView';
import { UserProfileModal } from './components/auth/UserProfileModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(storage.getUsers());
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<PropertySettings>(storage.getSettings());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [currentTab, setCurrentTab] = useState<string>(() =>
    storage.getCurrentUser()?.role === 'maintenance' ? 'repairs' : 'overview'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  // Tracks the owner account when an owner previews the system as another role.
  const [ownerImpersonator, setOwnerImpersonator] = useState<User | null>(null);

  // User Profile Modal
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  // Modals & Target Selections
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [addUnitInitialFloor, setAddUnitInitialFloor] = useState<number>(1);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [addTenantInitialUnitId, setAddTenantInitialUnitId] = useState<string | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [isNewRepairOpen, setIsNewRepairOpen] = useState(false);
  const [newRepairInitialUnitId, setNewRepairInitialUnitId] = useState<string | null>(null);

  // Deep-linking selections from Search or Notifications
  const [focusedUnitId, setFocusedUnitId] = useState<string | null>(null);
  const [focusedTenantId, setFocusedTenantId] = useState<string | null>(null);
  const [focusedRepairId, setFocusedRepairId] = useState<string | null>(null);

  const refreshState = () => {
    setFloors(storage.getFloors());
    setUnits(storage.getUnits());
    setTenants(storage.getTenants());
    setRepairs(storage.getRepairs());
    setAuditLogs(storage.getAuditLogs());
    setSettings(storage.getSettings());
    setNotifications(storage.getNotifications());
    setAllUsers(storage.getUsers());
    const latestUser = storage.getCurrentUser();
    if (latestUser) setCurrentUser(latestUser);
  };

  useEffect(() => {
    storage.ensureInitialized();
    refreshState();
  }, []);

  const isOwner = currentUser?.role === 'owner';
  const isMaintenance = currentUser?.role === 'maintenance';

  // Enforce role boundaries even if a tab is requested through search or a notification.
  useEffect(() => {
    if (isMaintenance && currentTab !== 'repairs') {
      setCurrentTab('repairs');
    } else if (currentTab === 'users' && !isOwner) {
      setCurrentTab(isMaintenance ? 'repairs' : 'overview');
    }
  }, [isMaintenance, isOwner, currentTab]);

  const handleLogin = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    setOwnerImpersonator(null);
    setCurrentTab(user.role === 'maintenance' ? 'repairs' : 'overview');
    refreshState();
  };

  const handleLogout = () => {
    setOwnerImpersonator(null);
    setCurrentUser(null);
  };

  const handleRoleChange = (role: UserRole) => {
    // Only an owner / system admin may switch viewing roles.
    if (currentUser?.role !== 'owner') return;

    if (role !== 'owner') {
      setOwnerImpersonator(currentUser);
    } else {
      setOwnerImpersonator(null);
    }

    const matched = storage.getUsers().find((u) => u.role === role);
    if (matched) {
      storage.setCurrentUser(matched);
      setCurrentUser(matched);
      setCurrentTab(role === 'maintenance' ? 'repairs' : 'overview');
    } else if (currentUser) {
      const updated = { ...currentUser, role };
      storage.setCurrentUser(updated);
      setCurrentUser(updated);
      setCurrentTab(role === 'maintenance' ? 'repairs' : 'overview');
    }
    refreshState();
  };

  const handleReturnToOwner = () => {
    if (!ownerImpersonator) return;
    storage.setCurrentUser(ownerImpersonator);
    setCurrentUser(ownerImpersonator);
    setOwnerImpersonator(null);
    setCurrentTab('overview');
    refreshState();
  };

  const handleUpdateUserProfile = (
    userId: string,
    updates: { name?: string; email?: string; phone?: string; avatar?: string }
  ) => {
    const result = storage.updateUserProfile(userId, updates);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    refreshState();
    return result;
  };

  const handleChangePassword = (
    userId: string,
    currentPass: string,
    newPass: string
  ) => {
    const result = storage.changeUserPassword(userId, currentPass, newPass);
    refreshState();
    return result;
  };

  const handleSwitchUser = (user: User) => {
    // Profile switching is restricted to owners / system administrators.
    if (currentUser?.role !== 'owner') return;

    if (user.role !== 'owner') {
      setOwnerImpersonator(currentUser);
    } else {
      setOwnerImpersonator(null);
    }

    storage.setCurrentUser(user);
    setCurrentUser(user);
    setCurrentTab(user.role === 'maintenance' ? 'repairs' : 'overview');
    refreshState();
  };

  // ==================== USER MANAGEMENT HANDLERS ====================
  const handleCreateUser = (payload: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    password?: string;
  }) => {
    const result = storage.createUser(payload);
    if (result.success) refreshState();
    return result;
  };

  const handleUpdateUser = (
    userId: string,
    updates: {
      name?: string;
      email?: string;
      phone?: string;
      role?: UserRole;
      password?: string;
      avatar?: string;
    }
  ) => {
    const result = storage.updateUser(userId, updates);
    if (result.success) refreshState();
    return result;
  };

  const handleDeleteUser = (userId: string) => {
    const result = storage.deleteUser(userId);
    if (result.success) refreshState();
    return result;
  };

  const handleNavigateTab = (tab: string, targetId?: string) => {
    if (isMaintenance && tab !== 'repairs') return;
    if (tab === 'users' && !isOwner) return;

    setCurrentTab(tab);
    if (tab === 'units') setFocusedUnitId(targetId || null);
    if (tab === 'tenants') setFocusedTenantId(targetId || null);
    if (tab === 'repairs') setFocusedRepairId(targetId || null);
  };

  // ==================== UNIT HANDLERS ====================
  const handleOpenAddUnit = (floorNum: number = 1) => {
    setEditingUnit(null);
    setAddUnitInitialFloor(floorNum);
    setIsAddUnitOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsAddUnitOpen(true);
  };

  const handleSaveUnit = (unitData: any) => {
    if (editingUnit) {
      storage.updateUnit(editingUnit.id, unitData);
    } else {
      storage.createUnit(unitData);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    }
    refreshState();
  };

  const handleDeleteUnit = (unitId: string) => {
    storage.deleteUnit(unitId);
    refreshState();
  };

  // ==================== TENANT HANDLERS ====================
  const handleOpenAddTenant = (unitId?: string) => {
    setEditingTenant(null);
    setAddTenantInitialUnitId(unitId || null);
    setIsAddTenantOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsAddTenantOpen(true);
  };

  const handleSaveTenant = (tenantData: any) => {
    if (editingTenant) {
      storage.updateTenant(editingTenant.id, tenantData);
    } else {
      storage.createTenant(tenantData);
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
    }
    refreshState();
  };

  const handleEndTenancy = (tenantId: string, reason: string, departureDate: string) => {
    storage.endTenancy(tenantId, reason, departureDate);
    refreshState();
  };

  // ==================== REPAIR HANDLERS ====================
  const handleOpenNewRepair = (unitId?: string) => {
    setNewRepairInitialUnitId(unitId || null);
    setIsNewRepairOpen(true);
  };

  const handleSaveRepair = (repairData: any) => {
    storage.createRepair(repairData);
    refreshState();
  };

  const handleUpdateRepairStatus = (
    id: string,
    status: any,
    note: string,
    actualCostKes?: number,
    assignedWorker?: string
  ) => {
    storage.updateRepairStatus(id, status, note, actualCostKes, assignedWorker);
    refreshState();
  };

  // ==================== FLOOR HANDLERS ====================
  const handleUpdateFloor = (floorNumber: number, updates: Partial<Floor>) => {
    storage.updateFloor(floorNumber, updates);
    refreshState();
  };

  // ==================== SETTINGS & DATA HANDLERS ====================
  const handleUpdateSettings = (updates: Partial<PropertySettings>) => {
    storage.updateSettings(updates);
    refreshState();
  };

  const handleExportData = () => {
    const json = storage.exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weena-loft-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (json: string) => {
    const success = storage.importDataJSON(json);
    if (success) refreshState();
    return success;
  };

  const handleResetData = () => {
    storage.clearAllData();
    refreshState();
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const openRepairsCount = repairs.filter(
    (r) => !['Completed', 'Cancelled'].includes(r.status)
  ).length;
  const highImpactCount = repairs.filter(
    (r) => r.impact === 'HIGH' && !['Completed', 'Cancelled'].includes(r.status)
  ).length;

  return (
    <div className="min-h-screen bg-[#0C0E0D] text-[#F6F3EC] flex">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => handleNavigateTab(tab)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          openRepairsCount={openRepairsCount}
          highImpactCount={highImpactCount}
          userRole={currentUser.role}
          onRoleChange={handleRoleChange}
          currentUser={currentUser}
          onOpenProfile={() => setIsUserProfileOpen(true)}
          onLogout={handleLogout}
          impersonatingOwnerName={ownerImpersonator?.name}
          onReturnToOwner={handleReturnToOwner}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        } pb-20 md:pb-6`}
      >
        <Header
          currentTab={currentTab}
          notifications={notifications}
          onMarkNotificationRead={(id) => {
            storage.markNotificationAsRead(id);
            refreshState();
          }}
          onMarkAllNotificationsRead={() => {
            storage.markAllNotificationsRead();
            refreshState();
          }}
          onNavigateTab={handleNavigateTab}
          onOpenAddUnit={() => handleOpenAddUnit()}
          onOpenAddTenant={() => handleOpenAddTenant()}
          onOpenNewRepair={() => handleOpenNewRepair()}
          units={units}
          tenants={tenants}
          repairs={repairs}
          currentUser={currentUser}
          onOpenProfile={() => setIsUserProfileOpen(true)}
          onLogout={handleLogout}
          impersonatingOwnerName={ownerImpersonator?.name}
          onReturnToOwner={handleReturnToOwner}
        />

        {/* View Routing */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewView
              units={units}
              tenants={tenants}
              repairs={repairs}
              floors={floors}
              auditLogs={isOwner ? auditLogs : []}
              showActivityLog={Boolean(isOwner)}
              onNavigateTab={handleNavigateTab}
              onOpenAddUnit={(flNum) => handleOpenAddUnit(flNum)}
              onOpenAddTenant={() => handleOpenAddTenant()}
              onOpenNewRepair={() => handleOpenNewRepair()}
              onQuickUpdateRepair={(repId, status, note) => {
                handleUpdateRepairStatus(repId, status, note);
              }}
            />
          )}

          {currentTab === 'explorer' && (
            <BuildingExplorerView
              units={units}
              tenants={tenants}
              floors={floors}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'floors' && (
            <FloorsView
              floors={floors}
              units={units}
              tenants={tenants}
              onUpdateFloor={handleUpdateFloor}
              onOpenAddUnitOnFloor={(flNum) => handleOpenAddUnit(flNum)}
              onOpenUnitDetails={(uId) => handleNavigateTab('units', uId)}
              onOpenTenantDetails={(tId) => handleNavigateTab('tenants', tId)}
            />
          )}

          {currentTab === 'units' && (
            <UnitsView
              units={units}
              tenants={tenants}
              repairs={repairs}
              onOpenAddUnit={() => handleOpenAddUnit()}
              onEditUnit={handleEditUnit}
              onDeleteUnit={handleDeleteUnit}
              onAssignTenant={(uId) => handleOpenAddTenant(uId)}
              onReportRepairForUnit={(unit) => handleOpenNewRepair(unit.id)}
              onOpenTenantProfile={(tId) => handleNavigateTab('tenants', tId)}
              selectedUnitIdInitial={focusedUnitId}
            />
          )}

          {currentTab === 'tenants' && (
            <TenantsView
              tenants={tenants}
              units={units}
              repairs={repairs}
              onOpenAddTenant={() => handleOpenAddTenant()}
              onEditTenant={handleEditTenant}
              onEndTenancy={handleEndTenancy}
              onAssignUnit={(tId, uId) => {
                storage.updateTenant(tId, { assignedUnitId: uId });
                refreshState();
              }}
              onNavigateTab={handleNavigateTab}
              selectedTenantIdInitial={focusedTenantId}
            />
          )}

          {currentTab === 'repairs' && (
            <MaintenanceView
              repairs={repairs}
              units={units}
              onOpenNewRepair={() => handleOpenNewRepair()}
              onUpdateRepairStatus={handleUpdateRepairStatus}
              selectedRepairIdInitial={focusedRepairId}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              units={units}
              tenants={tenants}
              repairs={repairs}
              floors={floors}
            />
          )}

          {currentTab === 'users' && isOwner && (
            <UsersView
              users={allUsers}
              currentUser={currentUser}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              currentUser={currentUser}
              onUpdateUserRole={handleRoleChange}
              onOpenProfileModal={() => setIsUserProfileOpen(true)}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C0E0D]/95 border-t border-[#1F241F] backdrop-blur-md px-2 py-2 flex items-center justify-around shadow-2xl">
        {([
          { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['owner', 'manager'] },
          { id: 'floors', label: 'Floors', icon: Building2, roles: ['owner', 'manager'] },
          { id: 'units', label: 'Units', icon: DoorOpen, roles: ['owner', 'manager'] },
          { id: 'tenants', label: 'Tenants', icon: Users, roles: ['owner', 'manager'] },
          { id: 'repairs', label: 'Repairs', icon: Wrench, badge: highImpactCount, roles: ['owner', 'manager', 'maintenance'] },
          { id: 'reports', label: 'Reports', icon: FileText, roles: ['owner', 'manager'] },
          { id: 'users', label: 'Users', icon: UserCog, roles: ['owner'] },
        ] as Array<{
          id: string;
          label: string;
          icon: React.ComponentType<{ className?: string }>;
          roles: UserRole[];
          badge?: number;
        }>)
          .filter((item) => item.roles.includes(currentUser.role))
          .map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigateTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium relative transition-colors ${
                isActive ? 'text-[#D8B475] font-bold' : 'text-[#8E958C]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
              {Boolean(item.badge) && item.badge! > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#F87171]" />
              )}
            </button>
          );
        })}
      </div>

      {/* MODALS */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onUpdateProfile={handleUpdateUserProfile}
        onChangePassword={handleChangePassword}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />

      <AddUnitModal
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
        onSubmit={handleSaveUnit}
        unitTypes={settings.unitTypes}
        initialFloor={addUnitInitialFloor}
        editingUnit={editingUnit}
      />

      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onSubmit={handleSaveTenant}
        units={units}
        initialUnitId={addTenantInitialUnitId}
        editingTenant={editingTenant}
      />

      <NewRepairModal
        isOpen={isNewRepairOpen}
        onClose={() => setIsNewRepairOpen(false)}
        onSubmit={handleSaveRepair}
        units={units}
        categories={settings.repairCategories}
        initialUnitId={newRepairInitialUnitId}
      />
    </div>
  );
}
