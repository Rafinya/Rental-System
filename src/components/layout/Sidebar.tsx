/**
 * Weena Loft Accommodations - Dark Editorial Sidebar Navigation
 * Matches exact palette and hierarchy from reference design.
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Building,  DoorOpen, 
  Users, 
  Wrench, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  LogOut,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Key,
  UserCog
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  openRepairsCount: number;
  highImpactCount: number;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser?: { name: string; email: string; role: UserRole; avatar?: string };
  onOpenProfile?: () => void;
  onLogout: () => void;
  impersonatingOwnerName?: string;
  onReturnToOwner?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  openRepairsCount,
  highImpactCount,
  userRole,
  onRoleChange,
  currentUser,
  onOpenProfile,
  onLogout,
  impersonatingOwnerName,
  onReturnToOwner,
}) => {
  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
    badge?: string;
    badgeUrgent?: boolean;
  }

  const allNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['owner', 'manager'] },
    { id: 'floors', label: 'Building & Floors', icon: Building, roles: ['owner', 'manager'] },
    { id: 'units', label: 'Units', icon: DoorOpen, roles: ['owner', 'manager'] },
    { id: 'tenants', label: 'Tenants', icon: Users, roles: ['owner', 'manager'] },
    {
      id: 'repairs',
      label: 'Repairs & Maintenance',
      icon: Wrench,
      roles: ['owner', 'manager', 'maintenance'],
      badge: highImpactCount > 0 ? `${highImpactCount}` : openRepairsCount > 0 ? String(openRepairsCount) : undefined,
      badgeUrgent: highImpactCount > 0
    },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['owner', 'manager'] },
    { id: 'users', label: 'User Management', icon: UserCog, roles: ['owner'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['owner', 'manager'] },
  ];

  // Maintenance staff only ever see the repairs & maintenance workspace.
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));
  const isOwner = userRole === 'owner';

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col justify-between border-r border-[#1F241F] bg-[#0C0E0D] text-[#F6F3EC] transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F241F]">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Weena Loft Monogram Logo */}
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#D4A962]/40 bg-[#161816] shadow-md flex items-center justify-center">
              <span className="text-[#D8B475] font-serif font-bold text-lg pointer-events-none absolute">
                W
              </span>
              <img
                src="/assets/aistudio/weena-loft-wl.png"
                alt="Weena Loft monogram"
                className="relative z-10 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-semibold text-sm tracking-wider text-[#F6F3EC]">
                  WEENA LOFT
                </span>
                <span className="text-[9px] tracking-widest text-[#D8B475] uppercase font-mono font-medium">
                  ACCOMMODATIONS
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1 rounded-lg text-[#8E958C] hover:text-[#F6F3EC] hover:bg-[#171B17] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Property Selector Card */}
        {!collapsed && (
          <div className="p-3">
            <div className="p-2.5 rounded-xl bg-[#141714] border border-[#242A24] flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center shrink-0">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#F6F3EC] truncate">Weena Loft</p>
                  <p className="text-[10px] text-[#8E958C] truncate">Residential property</p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8E958C] shrink-0 ml-1" />
            </div>
          </div>
        )}

        {/* Category Header */}
        {!collapsed && (
          <div className="px-4 pt-2 pb-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#666C63] font-semibold">
              {userRole === 'maintenance' ? 'MAINTENANCE' : 'PROPERTY'}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all relative ${
                  isActive
                    ? 'bg-[#171B17] text-[#F6F3EC] border-l-2 border-[#D8B475] font-semibold'
                    : 'text-[#8E958C] hover:text-[#F6F3EC] hover:bg-[#141714]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#F6F3EC]' : 'text-[#8E958C]'
                  }`}
                />

                {!collapsed && (
                  <div className="flex items-center justify-between w-full truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                          item.badgeUrgent
                            ? 'bg-[#331414] text-[#F87171] border border-[#5A1E1E]'
                            : 'bg-[#222722] text-[#D8B475] border border-[#323A32]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {collapsed && item.badge && (
                  <div className="absolute right-2 w-2 h-2 rounded-full bg-[#D8B475]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 space-y-2.5 border-t border-[#1F241F] bg-[#0C0E0D]">
        {/* "Need a hand?" Helper Card from Screenshot */}
        {!collapsed && (
          <div className="p-3 rounded-2xl bg-[#141714] border border-[#242A24] flex items-center justify-between cursor-pointer hover:border-[#D8B475]/40 transition-all">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#1C201C] border border-[#2A312A] text-[#D8B475] flex items-center justify-center shrink-0">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#F6F3EC]">Need a hand?</p>
                <p className="text-[10px] text-[#8E958C]">Your property, made simpler.</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#8E958C]" />
          </div>
        )}

        {/* Owner preview-mode return card */}
        {!collapsed && impersonatingOwnerName && onReturnToOwner && (
          <div className="p-3 rounded-2xl bg-[#2A1F12] border border-[#48351F] space-y-2">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-[#D8B475] font-bold">
                Owner Preview Mode
              </p>
              <p className="text-[10px] text-[#8E958C] mt-0.5">
                Viewing as {userRole}. Return to {impersonatingOwnerName}'s owner access.
              </p>
            </div>
            <button
              onClick={onReturnToOwner}
              className="w-full py-1.5 rounded-lg bg-[#D4A962] text-[#141714] text-[10px] font-bold hover:bg-[#E2BA72] transition-all"
            >
              Return to Owner
            </button>
          </div>
        )}

        {/* Role Switcher — owner / system admin only */}
        {!collapsed && isOwner && (
          <div className="p-2.5 rounded-xl bg-[#141714] border border-[#242A24]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#8E958C]">
                Switch Viewing Role
              </span>
              <span className="text-[10px] font-semibold text-[#D8B475] capitalize">
                {userRole}
              </span>
            </div>
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="w-full text-xs bg-[#0C0E0D] text-[#F6F3EC] border border-[#242A24] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#D8B475]"
            >
              <option value="owner">Building Owner</option>
              <option value="manager">Property Manager</option>
              <option value="maintenance">Maintenance Staff</option>
            </select>
          </div>
        )}

        {/* User Profile Bar */}
        <div className="flex items-center justify-between pt-1">
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
            title="Edit Profile & Change Password"
          >
            <div className="w-8 h-8 rounded-full bg-[#1C201C] border border-[#D8B475]/50 text-[#D8B475] font-semibold text-xs flex items-center justify-center shrink-0">
              {currentUser?.avatar || currentUser?.name.slice(0, 2).toUpperCase() || 'WL'}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-[#F6F3EC] truncate">
                  {currentUser?.name || 'Ralph Okono'}
                </p>
                <p className="text-[10px] text-[#8E958C] truncate capitalize">
                  {currentUser?.role === 'owner' ? 'Owner & Admin' : currentUser?.role === 'manager' ? 'Property Manager' : 'Maintenance Lead'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                title="Account Settings & Password"
                className="p-1.5 text-[#8E958C] hover:text-[#D8B475] rounded-lg hover:bg-[#141714] transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-[#8E958C] hover:text-[#F87171] rounded-lg hover:bg-[#141714] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
