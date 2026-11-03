/**
 * Weena Loft Accommodations - Units & House Number Management
 * Dark Editorial Luxury Edition with high contrast and complete visibility.
 */

import React, { useState } from 'react';
import { 
  DoorOpen, 
  Plus, 
  Search, 
  Grid, 
  List, 
  Edit, 
  Trash2, 
  Wrench, 
  ExternalLink,
  X
} from 'lucide-react';
import { Unit, Tenant, Repair } from '../../types';

interface UnitsViewProps {
  units: Unit[];
  tenants: Tenant[];
  repairs: Repair[];
  onOpenAddUnit: () => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit: (unitId: string) => void;
  onAssignTenant: (unitId: string) => void;
  onReportRepairForUnit: (unit: Unit) => void;
  onOpenTenantProfile: (tenantId: string) => void;
  selectedUnitIdInitial?: string | null;
}

export const UnitsView: React.FC<UnitsViewProps> = ({
  units,
  tenants,
  repairs,
  onOpenAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAssignTenant,
  onReportRepairForUnit,
  onOpenTenantProfile,
  selectedUnitIdInitial = null,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(
    selectedUnitIdInitial ? units.find((u) => u.id === selectedUnitIdInitial) || null : null
  );

  React.useEffect(() => {
    if (selectedUnitIdInitial) {
      const found = units.find((u) => u.id === selectedUnitIdInitial);
      if (found) setSelectedUnit(found);
    }
  }, [selectedUnitIdInitial, units]);

  const filteredUnits = units.filter((u) => {
    if (filterFloor !== 'all' && u.floor !== Number(filterFloor)) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (filterType !== 'all' && u.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = u.unitNumber.toLowerCase().includes(q);
      const matchType = u.type.toLowerCase().includes(q);
      const tenant = tenants.find((t) => t.id === u.tenantId);
      const matchTenant = tenant ? tenant.fullName.toLowerCase().includes(q) : false;
      if (!matchNum && !matchType && !matchTenant) return false;
    }
    return true;
  });

  const getUnitTenant = (unitId: string) => tenants.find((t) => t.assignedUnitId === unitId && t.status === 'active');
  const getUnitRepairs = (unitId: string) => repairs.filter((r) => r.unitId === unitId);

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters Bar */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-[#D8B475]" />
              <h2 className="text-2xl font-serif font-bold text-[#F6F3EC]">
                Apartment Units Directory
              </h2>
            </div>
            <p className="text-xs text-[#8E958C] mt-1">
              Manage house numbers, floor allocations, rental rates, and tenant occupancy.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center p-1 rounded-xl bg-[#1C201C] border border-[#2A312A]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-[#D4A962] text-[#141714]' : 'text-[#8E958C] hover:text-[#F6F3EC]'
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-[#D4A962] text-[#141714]' : 'text-[#8E958C] hover:text-[#F6F3EC]'
                }`}
                title="Spreadsheet Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onOpenAddUnit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Unit</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E958C]" />
            <input
              type="text"
              placeholder="Search unit # or resident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] placeholder-[#70786E] focus:outline-none focus:border-[#D8B475]"
            />
          </div>

          {/* Floor filter */}
          <div>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="all">All Four Floors</option>
              <option value="1">Floor 01 (Ground Floor)</option>
              <option value="2">Floor 02 (Second Level)</option>
              <option value="3">Floor 03 (Third Level)</option>
              <option value="4">Floor 04 (Top Floor)</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="all">All Statuses</option>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Under Maintenance</option>
            </select>
          </div>

          {/* Unit Type filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
            >
              <option value="all">All Unit Classifications</option>
              <option value="Studio">Studio</option>
              <option value="1-Bedroom">1-Bedroom</option>
              <option value="2-Bedroom">2-Bedroom</option>
              <option value="3-Bedroom">3-Bedroom</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Units Display */}
      {units.length === 0 ? (
        <div className="p-12 text-center bg-[#151815] border border-dashed border-[#242A24] rounded-3xl shadow-sm">
          <DoorOpen className="w-12 h-12 mx-auto text-[#8E958C]/40 mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#F6F3EC]">No units registered yet</h3>
          <p className="text-xs text-[#8E958C] mt-1 max-w-sm mx-auto leading-relaxed">
            Your building starts with clean slate records. Click below to add your first apartment with its house number, floor, and rent.
          </p>
          <button
            onClick={onOpenAddUnit}
            className="mt-4 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm"
          >
            + Register First Unit
          </button>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="p-10 text-center bg-[#151815] border border-dashed border-[#242A24] rounded-2xl">
          <p className="text-xs text-[#8E958C]">No units match your current search/filter criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((u) => {
            const tenant = getUnitTenant(u.id);
            const openUnitRepairs = getUnitRepairs(u.id).filter(
              (r) => !['Completed', 'Cancelled'].includes(r.status)
            );

            return (
              <div
                key={u.id}
                onClick={() => setSelectedUnit(u)}
                className={`p-5 rounded-2xl bg-[#151815] border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:border-[#D8B475]/60 ${
                  selectedUnit?.id === u.id ? 'border-[#D8B475] ring-1 ring-[#D8B475]' : 'border-[#242A24]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xl font-bold text-[#F6F3EC]">
                        Unit #{u.unitNumber}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C201C] text-[#8E958C] border border-[#2A312A] font-semibold">
                        Floor {u.floor}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                        u.status === 'occupied'
                          ? 'bg-[#142B1A] text-[#4ADE80] border-[#235730]'
                          : u.status === 'maintenance'
                          ? 'bg-[#2B2312] text-[#D8B475] border-[#48351F]'
                          : 'bg-[#1C201C] text-[#8E958C] border-[#2A312A]'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-[#8E958C]">
                    <span className="font-semibold text-[#F6F3EC]">{u.type}</span>
                    {u.sizeSqm && <span>• {u.sizeSqm} m²</span>}
                    {u.furnishing && <span>• {u.furnishing}</span>}
                  </div>

                  <p className="mt-2 text-xs text-[#8E958C] line-clamp-2 leading-relaxed">
                    {u.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#1F241F] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E958C]">Monthly Rent:</span>
                    <span className="font-mono font-bold text-[#D8B475]">
                      KES {u.rentKes.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#8E958C]">Tenant:</span>
                    {tenant ? (
                      <span className="text-[#F6F3EC] font-semibold truncate max-w-[150px]">
                        {tenant.fullName}
                      </span>
                    ) : (
                      <span className="text-[#70786E] italic">Vacant</span>
                    )}
                  </div>

                  {openUnitRepairs.length > 0 && (
                    <div className="flex items-center justify-between text-[#F87171] bg-[#2A1414] border border-[#4A2020] px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Wrench className="w-3 h-3 text-[#F87171]" /> Open Repairs:
                      </span>
                      <span className="font-mono text-xs font-bold">
                        {openUnitRepairs.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl border border-[#242A24] bg-[#151815] shadow-sm">
          <table className="w-full text-left text-xs text-[#F6F3EC]">
            <thead className="bg-[#181B18] text-[#8E958C] font-mono text-[10px] uppercase border-b border-[#242A24]">
              <tr>
                <th className="p-3.5">Unit #</th>
                <th className="p-3.5">Floor</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Rent (KES)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Current Tenant</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F241F]">
              {filteredUnits.map((u) => {
                const tenant = getUnitTenant(u.id);

                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUnit(u)}
                    className="hover:bg-[#1C201C] cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold font-serif text-sm text-[#F6F3EC]">#{u.unitNumber}</td>
                    <td className="p-3.5 font-mono text-[#8E958C]">Floor {u.floor}</td>
                    <td className="p-3.5 text-[#F6F3EC]">{u.type}</td>
                    <td className="p-3.5 font-mono font-bold text-[#D8B475]">
                      KES {u.rentKes.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                          u.status === 'occupied'
                            ? 'bg-[#142B1A] text-[#4ADE80] border-[#235730]'
                            : u.status === 'maintenance'
                            ? 'bg-[#2B2312] text-[#D8B475] border-[#48351F]'
                            : 'bg-[#1C201C] text-[#8E958C] border-[#2A312A]'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {tenant ? (
                        <span className="font-semibold text-[#F6F3EC]">{tenant.fullName}</span>
                      ) : (
                        <span className="text-[#70786E] italic">Vacant</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnit(u);
                        }}
                        className="text-xs text-[#D8B475] hover:underline font-semibold"
                      >
                        View Record
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Unit Details Drawer */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="w-full max-w-lg h-full bg-[#151815] border-l border-[#242A24] p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242A24] pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8B475] font-bold">
                  Unit Profile
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#F6F3EC]">
                  Unit #{selectedUnit.unitNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="p-1.5 rounded-lg text-[#8E958C] hover:text-[#F6F3EC] hover:bg-[#1C201C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24]">
                <span className="text-[10px] font-mono uppercase text-[#8E958C] font-semibold">Floor</span>
                <p className="font-bold text-sm text-[#F6F3EC] mt-0.5">
                  Floor {selectedUnit.floor}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#181B18] border border-[#242A24]">
                <span className="text-[10px] font-mono uppercase text-[#8E958C] font-semibold">Status</span>
                <p className="font-bold text-sm capitalize text-[#D8B475] mt-0.5">
                  {selectedUnit.status}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#F6F3EC] border-b border-[#242A24] pb-1.5">
                Specifications
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8E958C]">Classification:</span>
                  <p className="font-semibold text-[#F6F3EC] mt-0.5">{selectedUnit.type}</p>
                </div>
                <div>
                  <span className="text-[#8E958C]">Monthly Rent:</span>
                  <p className="font-mono font-bold text-[#D8B475] mt-0.5">
                    KES {selectedUnit.rentKes.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[#8E958C]">Deposit:</span>
                  <p className="font-mono text-[#F6F3EC] mt-0.5">
                    KES {(selectedUnit.depositKes || selectedUnit.rentKes).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[#8E958C]">Size:</span>
                  <p className="text-[#F6F3EC] mt-0.5">
                    {selectedUnit.sizeSqm ? `${selectedUnit.sizeSqm} m²` : '—'}
                  </p>
                </div>
              </div>

              {selectedUnit.description && (
                <div className="pt-2">
                  <span className="text-xs text-[#8E958C]">Description:</span>
                  <p className="text-xs text-[#F6F3EC] mt-1 bg-[#181B18] p-3 rounded-xl border border-[#242A24]">
                    {selectedUnit.description}
                  </p>
                </div>
              )}
            </div>

            {/* Resident Details */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#F6F3EC] border-b border-[#242A24] pb-1.5">
                Current Resident
              </h4>

              {(() => {
                const tenant = getUnitTenant(selectedUnit.id);
                if (tenant) {
                  return (
                    <div className="p-3.5 rounded-xl bg-[#181B18] border border-[#242A24] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#F6F3EC]">{tenant.fullName}</span>
                        <button
                          onClick={() => onOpenTenantProfile(tenant.id)}
                          className="text-[11px] text-[#D8B475] hover:underline flex items-center gap-1 font-semibold"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[#8E958C]">Phone: <strong className="text-[#F6F3EC]">{tenant.phone}</strong></p>
                      <p className="text-[#8E958C]">Start Date: <strong className="text-[#F6F3EC]">{tenant.tenancyStartDate}</strong></p>
                    </div>
                  );
                }
                return (
                  <div className="p-4 rounded-xl bg-[#181B18] border border-[#242A24] text-center">
                    <p className="text-xs text-[#8E958C] mb-2">This unit is currently vacant.</p>
                    <button
                      onClick={() => onAssignTenant(selectedUnit.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72]"
                    >
                      Assign Resident
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Maintenance History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#242A24] pb-1.5">
                <h4 className="font-serif text-sm font-bold text-[#F6F3EC]">
                  Maintenance Tickets
                </h4>
                <button
                  onClick={() => onReportRepairForUnit(selectedUnit)}
                  className="text-xs text-[#D8B475] hover:underline font-semibold"
                >
                  + Report Repair
                </button>
              </div>

              {(() => {
                const uRepairs = getUnitRepairs(selectedUnit.id);
                if (uRepairs.length === 0) {
                  return <p className="text-xs text-[#8E958C] italic">No repairs logged for this unit.</p>;
                }
                return (
                  <div className="space-y-2">
                    {uRepairs.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-[#181B18] border border-[#242A24] text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[#D8B475] font-bold">{r.ticketNumber}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C201C] text-[#8E958C] border border-[#2A312A] font-bold">
                            {r.status}
                          </span>
                        </div>
                        <p className="font-semibold text-[#F6F3EC] mt-1">{r.title}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#242A24] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  onEditUnit(selectedUnit);
                  setSelectedUnit(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#1C201C] border border-[#2A312A] text-xs font-semibold text-[#F6F3EC] hover:bg-[#252A25] flex items-center justify-center gap-1.5 transition-all"
              >
                <Edit className="w-3.5 h-3.5 text-[#D8B475]" /> Edit Unit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete Unit ${selectedUnit.unitNumber}?`)) {
                    onDeleteUnit(selectedUnit.id);
                    setSelectedUnit(null);
                  }
                }}
                className="py-2 px-3 rounded-xl bg-[#2A1414] border border-[#4A2020] text-xs font-semibold text-[#F87171] hover:bg-[#381818] flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
