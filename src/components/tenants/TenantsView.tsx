/**
 * Weena Loft Accommodations - Tenant Management & Tenancy Records
 * Dark Editorial Luxury Edition with high contrast and complete visibility.
 */

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Edit, 
  X,
  AlertTriangle,
  DoorOpen,
  Calendar
} from 'lucide-react';
import { Tenant, Unit, Repair } from '../../types';

interface TenantsViewProps {
  tenants: Tenant[];
  units: Unit[];
  repairs: Repair[];
  onOpenAddTenant: () => void;
  onEditTenant: (tenant: Tenant) => void;
  onEndTenancy: (tenantId: string, reason: string, departureDate: string) => void;
  onAssignUnit: (tenantId: string, unitId: string) => void;
  onNavigateTab: (tab: string, targetId?: string) => void;
  selectedTenantIdInitial?: string | null;
}

export const TenantsView: React.FC<TenantsViewProps> = ({
  tenants,
  units,
  repairs,
  onOpenAddTenant,
  onEditTenant,
  onEndTenancy,
  onNavigateTab,
  selectedTenantIdInitial = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'past'>('active');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(
    selectedTenantIdInitial ? tenants.find((t) => t.id === selectedTenantIdInitial) || null : null
  );
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const [departingTenant, setDepartingTenant] = useState<Tenant | null>(null);
  const [departureReason, setDepartureReason] = useState('Tenancy ended');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    if (selectedTenantIdInitial) {
      const found = tenants.find((t) => t.id === selectedTenantIdInitial);
      if (found) setSelectedTenant(found);
    }
  }, [selectedTenantIdInitial, tenants]);

  const toggleRevealId = (tenantId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRevealedIds((prev) => ({ ...prev, [tenantId]: !prev[tenantId] }));
  };

  const filteredTenants = tenants.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;

    if (filterFloor !== 'all') {
      const u = units.find((unit) => unit.id === t.assignedUnitId);
      if (!u || u.floor !== Number(filterFloor)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.fullName.toLowerCase().includes(q);
      const matchPhone = t.phone.includes(q);
      const u = units.find((unit) => unit.id === t.assignedUnitId);
      const matchUnit = u ? u.unitNumber.toLowerCase().includes(q) : false;
      if (!matchName && !matchPhone && !matchUnit) return false;
    }

    return true;
  });

  const getTenantUnit = (unitId?: string | null) => unitId ? units.find((u) => u.id === unitId) : undefined;
  const getTenantRepairs = (unitId?: string | null) => unitId ? repairs.filter((r) => r.unitId === unitId) : [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters Bar */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D8B475]" />
              <h2 className="text-2xl font-serif font-bold text-[#F6F3EC]">
                Resident & Tenant Directory
              </h2>
            </div>
            <p className="text-xs text-[#8E958C] mt-1">
              Active leases, resident contacts, emergency details, and departure history.
            </p>
          </div>

          <button
            onClick={onOpenAddTenant}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Resident</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
            <input
              type="text"
              placeholder="Search resident name, phone, or unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] placeholder-[#70786E] focus:outline-none focus:border-[#D8B475]"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="active">Active Residents Only</option>
              <option value="past">Past Residents (Departed)</option>
              <option value="all">All Tenancy Records</option>
            </select>
          </div>

          {/* Floor filter */}
          <div>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="all">All Four Floors</option>
              <option value="1">Floor 01 (Ground)</option>
              <option value="2">Floor 02</option>
              <option value="3">Floor 03</option>
              <option value="4">Floor 04 (Penthouse)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Tenant Cards Grid */}
      {tenants.length === 0 ? (
        <div className="p-12 text-center bg-[#151815] border border-dashed border-[#242A24] rounded-3xl shadow-sm">
          <Users className="w-12 h-12 mx-auto text-[#8E958C]/40 mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#F6F3EC]">No residents registered yet</h3>
          <p className="text-xs text-[#8E958C] mt-1 max-w-sm mx-auto leading-relaxed">
            Register the residents of Weena Loft as they move in. You can record their contact details, lease dates, and assign them to an apartment.
          </p>
          <button
            onClick={onOpenAddTenant}
            className="mt-4 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm"
          >
            + Add First Resident
          </button>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="p-10 text-center bg-[#151815] border border-dashed border-[#242A24] rounded-2xl">
          <p className="text-xs text-[#8E958C]">No residents match your search or filter settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map((t) => {
            const unit = getTenantUnit(t.assignedUnitId);
            const isRevealed = revealedIds[t.id];

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTenant(t)}
                className={`p-5 rounded-2xl bg-[#151815] border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:border-[#D8B475]/60 ${
                  selectedTenant?.id === t.id ? 'border-[#D8B475] ring-1 ring-[#D8B475]' : 'border-[#242A24]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1C201C] border border-[#2A312A] text-[#D8B475] font-serif font-bold text-sm flex items-center justify-center">
                        {t.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#F6F3EC]">
                          {t.fullName}
                        </h3>
                        <span className="text-[11px] text-[#8E958C]">
                          {t.phone}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                        t.status === 'active'
                          ? 'bg-[#142B1A] text-[#4ADE80] border-[#235730]'
                          : 'bg-[#1C201C] text-[#8E958C] border-[#2A312A]'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  {/* Assigned Unit badge */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#181B18] border border-[#242A24] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-3.5 h-3.5 text-[#D8B475]" />
                      {unit ? (
                        <span className="font-semibold text-[#F6F3EC]">
                          Unit #{unit.unitNumber} (Floor {unit.floor})
                        </span>
                      ) : (
                        <span className="italic text-[#8E958C]">No unit assigned</span>
                      )}
                    </div>
                    {unit && (
                      <span className="text-[10px] font-mono text-[#D8B475]">
                        KES {unit.rentKes.toLocaleString()}/mo
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#1F241F] text-xs">
                  {/* National ID masked / unmasked */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E958C] text-[11px]">National ID / Passport:</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#F6F3EC]">
                      <span>
                        {t.idPassportNumber
                          ? isRevealed
                            ? t.idPassportNumber
                            : `•••• ${t.idPassportNumber.slice(-4)}`
                          : '—'}
                      </span>
                      {t.idPassportNumber && (
                        <button
                          onClick={(e) => toggleRevealId(t.id, e)}
                          className="text-[#8E958C] hover:text-[#D8B475] p-0.5"
                          title={isRevealed ? 'Hide ID' : 'Reveal ID'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8E958C]">
                    <span>Tenancy Start:</span>
                    <span className="text-[#F6F3EC] font-mono">{t.tenancyStartDate}</span>
                  </div>

                  {t.emergencyContactName && (
                    <div className="flex items-center justify-between text-[11px] text-[#8E958C]">
                      <span>Emergency Contact:</span>
                      <span className="text-[#F6F3EC] truncate max-w-[140px]">{t.emergencyContactName}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Tenant Profile Drawer */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="w-full max-w-lg h-full bg-[#151815] border-l border-[#242A24] p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242A24] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C201C] border border-[#2A312A] text-[#D8B475] font-serif font-bold text-lg flex items-center justify-center">
                  {selectedTenant.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8B475] font-bold">
                    Resident Record
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#F6F3EC]">
                    {selectedTenant.fullName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedTenant(null)}
                className="p-1.5 rounded-lg text-[#8E958C] hover:text-[#F6F3EC] hover:bg-[#1C201C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Lease Status Banner */}
            <div className="p-4 rounded-2xl bg-[#181B18] border border-[#242A24] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#8E958C]">Tenancy Status</span>
                <p className="font-semibold text-sm capitalize text-[#F6F3EC] mt-0.5">
                  {selectedTenant.status === 'active' ? 'Active Resident' : 'Past Resident (Departed)'}
                </p>
              </div>
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold border ${
                  selectedTenant.status === 'active'
                    ? 'bg-[#142B1A] text-[#4ADE80] border-[#235730]'
                    : 'bg-[#1C201C] text-[#8E958C] border-[#2A312A]'
                }`}
              >
                {selectedTenant.status}
              </span>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 text-xs">
              <h4 className="font-serif text-sm font-bold text-[#F6F3EC] border-b border-[#242A24] pb-1.5">
                Contact & Identity
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24]">
                  <span className="text-[#8E958C] block text-[10px]">Phone Number</span>
                  <p className="font-bold text-[#F6F3EC] mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#D8B475]" />
                    <span>{selectedTenant.phone}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24]">
                  <span className="text-[#8E958C] block text-[10px]">Email Address</span>
                  <p className="font-semibold text-[#F6F3EC] mt-0.5 truncate flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#D8B475]" />
                    <span>{selectedTenant.email || 'None registered'}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24] col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E958C] text-[10px]">National ID / Passport Number</span>
                    {selectedTenant.idPassportNumber && (
                      <button
                        onClick={() => toggleRevealId(selectedTenant.id)}
                        className="text-[11px] text-[#D8B475] hover:underline flex items-center gap-1"
                      >
                        {revealedIds[selectedTenant.id] ? 'Hide' : 'Reveal'}
                      </button>
                    )}
                  </div>
                  <p className="font-mono font-bold text-[#F6F3EC] mt-0.5">
                    {selectedTenant.idPassportNumber
                      ? revealedIds[selectedTenant.id]
                        ? selectedTenant.idPassportNumber
                        : `•••• •••• ${selectedTenant.idPassportNumber.slice(-4)}`
                      : 'None registered'}
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Unit & Financials */}
            <div className="space-y-3 text-xs">
              <h4 className="font-serif text-sm font-bold text-[#F6F3EC] border-b border-[#242A24] pb-1.5">
                Assigned Apartment
              </h4>

              {(() => {
                const u = getTenantUnit(selectedTenant.assignedUnitId);
                if (u) {
                  return (
                    <div className="p-4 rounded-xl bg-[#181B18] border border-[#242A24] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="w-4 h-4 text-[#D8B475]" />
                          <span className="font-bold text-sm text-[#F6F3EC]">Unit #{u.unitNumber}</span>
                          <span className="text-[10px] text-[#8E958C]">(Floor {u.floor})</span>
                        </div>
                        <span className="font-mono font-bold text-[#D8B475]">
                          KES {u.rentKes.toLocaleString()} / mo
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E958C]">{u.type} • Deposit KES {(u.depositKes || u.rentKes).toLocaleString()}</p>
                    </div>
                  );
                }
                return (
                  <div className="p-4 rounded-xl bg-[#181B18] border border-[#242A24] text-center text-[#8E958C]">
                    No apartment assigned to this resident.
                  </div>
                );
              })()}
            </div>

            {/* Emergency Contact */}
            {selectedTenant.emergencyContactName && (
              <div className="space-y-2 text-xs">
                <h4 className="font-serif text-sm font-bold text-[#F6F3EC] border-b border-[#242A24] pb-1.5">
                  Emergency Contact
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181B18] border border-[#242A24] space-y-1">
                  <p className="font-bold text-[#F6F3EC]">{selectedTenant.emergencyContactName}</p>
                  <p className="text-[#8E958C]">Relationship: {selectedTenant.emergencyContactRelation || 'Contact'}</p>
                  <p className="text-[#8E958C]">Phone: <strong className="text-[#F6F3EC]">{selectedTenant.emergencyContactPhone}</strong></p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#242A24] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  onEditTenant(selectedTenant);
                  setSelectedTenant(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#1C201C] border border-[#2A312A] text-xs font-semibold text-[#F6F3EC] hover:bg-[#252A25] flex items-center justify-center gap-1.5 transition-all"
              >
                <Edit className="w-3.5 h-3.5 text-[#D8B475]" /> Edit Resident
              </button>

              {selectedTenant.status === 'active' && (
                <button
                  onClick={() => setDepartingTenant(selectedTenant)}
                  className="py-2 px-3.5 rounded-xl bg-[#2A1414] border border-[#4A2020] text-xs font-semibold text-[#F87171] hover:bg-[#381818] flex items-center justify-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> End Tenancy
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Departure Confirmation Modal */}
      {departingTenant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#151815] border border-[#242A24] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#F87171]">
              <div className="p-2.5 rounded-xl bg-[#2A1414] border border-[#4A2020]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">
                  Confirm Resident Departure
                </h3>
                <p className="text-xs text-[#8E958C]">
                  {departingTenant.fullName}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#8E958C] leading-relaxed">
              Recording a departure will mark this resident as past/inactive, vacate their assigned unit in Weena Loft, and archive the tenancy record.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Departure Date</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#8E958C] block mb-1">Reason for Leaving</label>
                <select
                  value={departureReason}
                  onChange={(e) => setDepartureReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                >
                  <option value="Tenancy ended">Tenancy ended normally</option>
                  <option value="Relocated">Relocated to another city / area</option>
                  <option value="Bought property">Purchased own home</option>
                  <option value="Lease breach">Terminated due to lease terms</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#242A24]">
              <button
                onClick={() => setDepartingTenant(null)}
                className="px-4 py-2 rounded-xl bg-[#1C201C] text-xs font-semibold text-[#8E958C] hover:text-[#F6F3EC]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEndTenancy(departingTenant.id, departureReason, departureDate);
                  setDepartingTenant(null);
                  setSelectedTenant(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#2A1414] border border-[#4A2020] text-xs font-semibold text-[#F87171] hover:bg-[#381818]"
              >
                Confirm Departure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
