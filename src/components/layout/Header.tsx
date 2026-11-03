/**
 * Weena Loft Accommodations - Master Dark Header
 * Breadcrumbs, live date, universal search, notifications & quick actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  DoorOpen, 
  UserPlus, 
  Wrench, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Calendar,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { AppNotification, Unit, Tenant, Repair } from '../../types';

interface HeaderProps {
  currentTab: string;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onNavigateTab: (tab: string, targetId?: string) => void;
  onOpenAddUnit: () => void;
  onOpenAddTenant: () => void;
  onOpenNewRepair: () => void;
  units: Unit[];
  tenants: Tenant[];
  repairs: Repair[];
  currentUser?: { name: string; email: string; role: any; avatar?: string };
  onOpenProfile?: () => void;
  onLogout?: () => void;
  impersonatingOwnerName?: string;
  onReturnToOwner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigateTab,
  onOpenAddUnit,
  onOpenAddTenant,
  onOpenNewRepair,
  units,
  tenants,
  repairs,
  currentUser,
  onOpenProfile,
  onLogout,
  impersonatingOwnerName,
  onReturnToOwner,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowQuickAddMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabLabels: Record<string, string> = {
    overview: 'Overview',
    floors: 'Building & Floors',
    units: 'Units',
    tenants: 'Tenants',
    repairs: 'Repairs & Maintenance',
    reports: 'Reports',
    users: 'User Management',
    settings: 'Settings',
  };

  const isMaintenance = currentUser?.role === 'maintenance';

  const currentLabel = tabLabels[currentTab] || 'Overview';

  const filteredUnits = searchQuery.trim()
    ? units.filter((u) => u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredTenants = searchQuery.trim()
    ? tenants.filter((t) =>
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery)
      )
    : [];
  const filteredRepairs = searchQuery.trim()
    ? repairs.filter((r) =>
        r.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasSearchResults =
    filteredUnits.length > 0 || filteredTenants.length > 0 || filteredRepairs.length > 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0C0E0D]/95 border-b border-[#1F241F] backdrop-blur-md px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Breadcrumb matching screenshot "Weena Loft > Overview" */}
        <div className="flex items-center gap-2 text-xs">
          <img
            src="/assets/aistudio/weena-loft-wl.png"
            alt="Weena Loft monogram"
            className="md:hidden w-6 h-6 rounded-md object-cover border border-[#D4A962]/40"
          />
          <span
            className="text-[#8E958C] font-medium hover:text-[#F6F3EC] cursor-pointer"
            onClick={() => onNavigateTab(isMaintenance ? 'repairs' : 'overview')}
          >
            Weena Loft
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#555C52]" />
          <span className="text-[#F6F3EC] font-semibold">
            {currentLabel}
          </span>
        </div>

        {/* Right: Date, Search, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          {/* Universal Search Input (hidden for maintenance staff) */}
          {!isMaintenance && (
          <div ref={searchRef} className="relative hidden sm:block w-48 lg:w-60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
              <input
                type="text"
                placeholder="Search unit, resident..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#141714] border border-[#242A24] rounded-xl text-[#F6F3EC] placeholder-[#70786E] focus:outline-none focus:border-[#D8B475] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E958C] hover:text-[#F6F3EC]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {showSearchResults && searchQuery.trim() && (
              <div className="absolute top-full right-0 mt-2 w-72 p-2 bg-[#151815] border border-[#2A312A] rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                {!hasSearchResults ? (
                  <div className="py-4 text-center text-xs text-[#8E958C]">
                    No matches found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUnits.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#D8B475] px-2 font-bold">
                          Units ({filteredUnits.length})
                        </span>
                        <div className="mt-1 space-y-1">
                          {filteredUnits.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                onNavigateTab('units', u.id);
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#1E241E] text-xs flex items-center justify-between text-[#F6F3EC]"
                            >
                              <div className="flex items-center gap-2">
                                <DoorOpen className="w-3.5 h-3.5 text-[#D8B475]" />
                                <span className="font-semibold">Unit {u.unitNumber}</span>
                                <span className="text-[10px] text-[#8E958C]">({u.type})</span>
                              </div>
                              <span className="text-[10px] text-[#D8B475] font-mono">
                                Floor {u.floor}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredTenants.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#D8B475] px-2 font-bold">
                          Tenants ({filteredTenants.length})
                        </span>
                        <div className="mt-1 space-y-1">
                          {filteredTenants.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                onNavigateTab('tenants', t.id);
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#1E241E] text-xs flex items-center justify-between text-[#F6F3EC]"
                            >
                              <div className="flex items-center gap-2">
                                <UserPlus className="w-3.5 h-3.5 text-[#8E958C]" />
                                <span className="truncate font-semibold">{t.fullName}</span>
                              </div>
                              <span className="text-[10px] text-[#8E958C]">{t.phone}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredRepairs.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#D8B475] px-2 font-bold">
                          Repairs ({filteredRepairs.length})
                        </span>
                        <div className="mt-1 space-y-1">
                          {filteredRepairs.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => {
                                onNavigateTab('repairs', r.id);
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#1E241E] text-xs flex items-center justify-between text-[#F6F3EC]"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Wrench className="w-3.5 h-3.5 text-[#D8B475] shrink-0" />
                                <span className="truncate font-semibold">{r.title}</span>
                              </div>
                              <span className="text-[10px] font-mono shrink-0 ml-2 text-[#F87171] font-bold">
                                {r.impact}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* Owner preview-mode return action */}
          {impersonatingOwnerName && onReturnToOwner && (
            <button
              onClick={onReturnToOwner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2A1F12] border border-[#48351F] text-[11px] font-semibold text-[#D8B475] hover:bg-[#382A16] transition-all"
              title={`Return to ${impersonatingOwnerName}'s owner access`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Return to Owner</span>
            </button>
          )}

          {/* Date Indicator from Screenshot: "📅 Tue, 3 Nov 2026" */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#8E958C]">
            <Calendar className="w-3.5 h-3.5 text-[#8E958C]" />
            <span>Tue, 3 Nov 2026</span>
          </div>

          {/* Notifications Center Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-[#141714] border border-[#242A24] text-[#8E958C] hover:text-[#F6F3EC] hover:border-[#D8B475] transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D8B475]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 p-3 bg-[#151815] border border-[#2A312A] rounded-2xl shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#242A24]">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-[#F6F3EC]">
                      Notifications & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#2A1F12] text-[#D8B475] border border-[#48351F] font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-[11px] text-[#D8B475] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center py-4 text-xs text-[#8E958C]">
                      No active alerts.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onMarkNotificationRead(notif.id);
                          if (notif.linkTo) {
                            onNavigateTab(notif.linkTo.tab, notif.linkTo.id);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          !notif.read
                            ? 'bg-[#1C221C] border-[#D8B475]'
                            : 'bg-[#141714] border-[#242A24] opacity-80'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {notif.type === 'urgent' ? (
                            <ShieldAlert className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
                          ) : notif.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                          ) : (
                            <Bell className="w-4 h-4 text-[#D8B475] shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-[#F6F3EC]">{notif.title}</p>
                            <p className="text-[11px] text-[#8E958C] mt-0.5">
                              {notif.message}
                            </p>
                            <span className="text-[9px] font-mono text-[#666C63] mt-1 block">
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Circle from Screenshot: "WL" / Initials */}
          <button
            onClick={onOpenProfile}
            title={`${currentUser?.name || 'Account'} (${currentUser?.role || 'owner'}) — Click to edit details & password`}
            className="w-8 h-8 rounded-full bg-[#1C201C] border border-[#2E352E] hover:border-[#D8B475] text-[#F6F3EC] font-semibold text-xs flex items-center justify-center transition-all cursor-pointer"
          >
            {currentUser?.avatar || currentUser?.name.slice(0, 2).toUpperCase() || 'WL'}
          </button>

          {/* Mobile-only sign out */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="md:hidden p-2 rounded-xl bg-[#141714] border border-[#242A24] text-[#8E958C] hover:text-[#F87171] hover:border-[#4A2020] transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
