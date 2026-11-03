/**
 * Weena Loft Accommodations - Building & Floors Management
 * Dark Editorial Luxury Edition with high-contrast legibility.
 */

import React, { useState } from 'react';
import { 
  Building, 
  Layers, 
  DoorOpen, 
  Plus, 
  Edit3, 
  Check, 
  X,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { Floor, Unit, Tenant } from '../../types';

interface FloorsViewProps {
  floors: Floor[];
  units: Unit[];
  tenants: Tenant[];
  onUpdateFloor: (floorNumber: number, updates: Partial<Floor>) => void;
  onOpenAddUnitOnFloor: (floorNumber: number) => void;
  onOpenUnitDetails: (unitId: string) => void;
  onOpenTenantDetails: (tenantId: string) => void;
}

export const FloorsView: React.FC<FloorsViewProps> = ({
  floors,
  units,
  tenants,
  onUpdateFloor,
  onOpenAddUnitOnFloor,
  onOpenUnitDetails,
}) => {
  const [selectedFloorNum, setSelectedFloorNum] = useState<number>(1);
  const [editingFloor, setEditingFloor] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');

  const currentFloor = floors.find((f) => f.floorNumber === selectedFloorNum) || floors[0];
  const floorUnits = units.filter((u) => u.floor === selectedFloorNum);

  const occupied = floorUnits.filter((u) => u.status === 'occupied').length;
  const vacant = floorUnits.filter((u) => u.status === 'vacant').length;
  const maintenance = floorUnits.filter((u) => u.status === 'maintenance').length;
  const occupancyRate = floorUnits.length > 0 ? Math.round((occupied / floorUnits.length) * 100) : 0;

  const floorMonthlyRentKes = floorUnits
    .filter((u) => u.status === 'occupied')
    .reduce((acc, u) => acc + (u.rentKes || 0), 0);

  const handleStartEdit = () => {
    if (!currentFloor) return;
    setEditName(currentFloor.name);
    setEditDesc(currentFloor.description);
    setEditingFloor(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    onUpdateFloor(selectedFloorNum, {
      name: editName.trim(),
      description: editDesc.trim(),
    });
    setEditingFloor(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Four Floor Selector Header Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {floors.map((fl) => {
          const flUnits = units.filter((u) => u.floor === fl.floorNumber);
          const flOccupied = flUnits.filter((u) => u.status === 'occupied').length;
          const isSelected = fl.floorNumber === selectedFloorNum;

          return (
            <button
              key={fl.floorNumber}
              onClick={() => {
                setSelectedFloorNum(fl.floorNumber);
                setEditingFloor(false);
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-[#1A1F1A] border-[#D8B475] shadow-lg ring-1 ring-[#D8B475]'
                  : 'bg-[#151815] border-[#242A24] hover:border-[#D8B475]/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                  <div className="bg-[#D8B475] transform rotate-45 translate-x-3 -translate-y-3 w-8 h-3" />
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#D8B475] font-bold">
                  Floor 0{fl.floorNumber}
                </span>
                <span className="text-[11px] font-mono text-[#8E958C] font-semibold">
                  {flUnits.length} units
                </span>
              </div>
              <p className="font-semibold text-sm text-[#F6F3EC] truncate">{fl.name}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#8E958C]">
                <span>{flOccupied} Occupied</span>
                <span>{flUnits.filter((u) => u.status === 'vacant').length} Vacant</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Selected Floor Hero & Detail Card */}
      <div className="p-6 rounded-3xl bg-[#151815] border border-[#242A24] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#242A24]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C201C] text-[#D8B475] font-serif font-bold text-2xl flex items-center justify-center shrink-0 border border-[#2A312A]">
              0{selectedFloorNum}
            </div>

            <div>
              {!editingFloor ? (
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F6F3EC]">
                      {currentFloor?.name || `Floor ${selectedFloorNum}`}
                    </h2>
                    <button
                      onClick={handleStartEdit}
                      className="p-1 rounded-lg text-[#8E958C] hover:text-[#D8B475] hover:bg-[#1C201C] transition-colors"
                      title="Rename or edit description"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#8E958C] mt-1 max-w-xl">
                    {currentFloor?.description || 'Residential floor layout.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-w-md">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Floor Name"
                    className="w-full px-3 py-1.5 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] font-semibold focus:outline-none focus:border-[#D8B475]"
                  />
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description / Spec"
                    className="w-full px-3 py-1.5 text-xs bg-[#1C201C] border border-[#2A312A] rounded-xl text-[#F6F3EC] focus:outline-none focus:border-[#D8B475]"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 rounded-lg bg-[#D4A962] text-[#141714] text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => setEditingFloor(false)}
                      className="px-3 py-1 rounded-lg bg-[#1C201C] text-[#8E958C] text-xs hover:text-[#F6F3EC] flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenAddUnitOnFloor(selectedFloorNum)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Unit to Floor 0{selectedFloorNum}</span>
            </button>
          </div>
        </div>

        {/* Floor Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8E958C] block">
              Units on Floor
            </span>
            <span className="text-2xl font-serif font-bold text-[#F6F3EC] mt-1 block">
              {floorUnits.length}
            </span>
            <span className="text-[11px] text-[#8E958C]">
              {floorUnits.length === 0 ? 'No units registered' : 'Registered units'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8E958C] block">
              Occupancy
            </span>
            <span className="text-2xl font-serif font-bold text-[#F6F3EC] mt-1 block">
              {occupancyRate}%
            </span>
            <span className="text-[11px] text-[#4ADE80]">
              {occupied} Occupied • {vacant} Vacant
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8E958C] block">
              Under Maintenance
            </span>
            <span className="text-2xl font-serif font-bold text-[#F6F3EC] mt-1 block">
              {maintenance}
            </span>
            <span className="text-[11px] text-[#8E958C]">
              {maintenance > 0 ? 'Work order active' : 'All clear'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#181B18] border border-[#242A24]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8E958C] block">
              Monthly Roll
            </span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#F6F3EC] mt-1 block">
              KES {floorMonthlyRentKes.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#D8B475]">
              Active collected
            </span>
          </div>
        </div>
      </div>

      {/* 3. Units on this Floor Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-[#D8B475]" />
            <h3 className="font-serif text-lg font-bold text-[#F6F3EC]">
              Floor 0{selectedFloorNum} Apartment Units ({floorUnits.length})
            </h3>
          </div>
          <span className="text-xs text-[#8E958C]">
            Click any unit card to view full profile & tenant assignment
          </span>
        </div>

        {floorUnits.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#151815] border border-dashed border-[#2A312A] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1C201C] text-[#8E958C] mx-auto flex items-center justify-center">
              <DoorOpen className="w-6 h-6 text-[#D8B475]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#F6F3EC]">
              No units created on Floor 0{selectedFloorNum} yet
            </h4>
            <p className="text-xs text-[#8E958C] max-w-sm mx-auto">
              You have complete control over the units in Weena Loft. Click below to add your first apartment on this floor.
            </p>
            <button
              onClick={() => onOpenAddUnitOnFloor(selectedFloorNum)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A962] text-[#141714] text-xs font-semibold hover:bg-[#E2BA72] shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Unit to Floor 0{selectedFloorNum}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {floorUnits.map((unit) => {
              const assignedTenant = tenants.find((t) => t.id === unit.tenantId);

              return (
                <div
                  key={unit.id}
                  onClick={() => onOpenUnitDetails(unit.id)}
                  className="p-5 rounded-2xl bg-[#151815] border border-[#242A24] hover:border-[#D8B475]/60 cursor-pointer transition-all shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold font-serif text-[#F6F3EC]">
                      Unit #{unit.unitNumber}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                        unit.status === 'occupied'
                          ? 'bg-[#142B1A] text-[#4ADE80] border-[#235730]'
                          : unit.status === 'maintenance'
                          ? 'bg-[#2B2312] text-[#D8B475] border-[#48351F]'
                          : 'bg-[#1C201C] text-[#8E958C] border-[#2A312A]'
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-[#8E958C] block">{unit.type}</span>
                    <p className="text-sm font-semibold text-[#F6F3EC] mt-1 font-mono">
                      KES {(unit.rentKes || 0).toLocaleString()} <span className="text-[10px] text-[#8E958C]">/mo</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1F241F] flex items-center justify-between text-xs text-[#8E958C]">
                    <span>
                      {assignedTenant ? (
                        <span className="text-[#F6F3EC] font-medium">{assignedTenant.fullName}</span>
                      ) : (
                        <span className="italic text-[#70786E]">Vacant</span>
                      )}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8E958C]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
